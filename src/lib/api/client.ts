import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { authStore } from '@features/auth/stores/authStore';
import type { ApiError } from '@/types/api';
import { generateRequestId, extractRateLimitInfo, formatApiError } from './helpers';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
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

// Response interceptor
apiClient.interceptors.response.use(
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
        return apiClient(originalRequest);
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
      return apiClient(originalRequest);
    }

    return Promise.reject(formatApiError(error as AxiosError<ApiError>));
  }
);