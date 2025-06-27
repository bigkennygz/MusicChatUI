import axios, { AxiosError, type AxiosInstance, type AxiosProgressEvent, type InternalAxiosRequestConfig } from 'axios';
import { authStore } from '@features/auth/stores/authStore';
import { generateRequestId, extractRateLimitInfo, formatApiError } from './helpers';
import type { ApiError } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UploadConfig {
  onProgress?: (progress: AxiosProgressEvent) => void;
  signal?: AbortSignal;
}

export const uploadClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0, // No timeout for uploads
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor (same as main client)
uploadClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token
    const token = authStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();

    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor (same as main client)
uploadClient.interceptors.response.use(
  (response) => {
    // Extract rate limit info
    const rateLimitInfo = extractRateLimitInfo(response.headers);
    if (rateLimitInfo) {
      authStore.getState().setRateLimitInfo(rateLimitInfo);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authStore.getState().refreshTokens();
        return uploadClient(originalRequest);
      } catch (refreshError) {
        authStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle rate limiting with exponential backoff
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
      
      console.warn(`Rate limited. Retrying after ${waitTime}ms`);
      
      // Exponential backoff
      const backoffTime = Math.min(waitTime * Math.pow(2, originalRequest._retry ? 1 : 0), 300000); // Max 5 minutes
      
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return uploadClient(originalRequest);
    }

    return Promise.reject(formatApiError(error as AxiosError<ApiError>));
  }
);

export async function uploadFile(
  file: File,
  config?: UploadConfig
): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append('files', file);

  const response = await uploadClient.post('/api/v1/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: config?.onProgress,
    signal: config?.signal,
  });

  return response.data;
}