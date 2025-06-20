import { AxiosError } from 'axios';
import type { ApiError, RateLimitInfo } from '@/types/api';

export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function extractRateLimitInfo(headers: Record<string, unknown>): RateLimitInfo | null {
  const limit = headers['x-ratelimit-limit'];
  const remaining = headers['x-ratelimit-remaining'];
  const reset = headers['x-ratelimit-reset'];

  if (limit && remaining && reset) {
    return {
      limit: parseInt(String(limit)),
      remaining: parseInt(String(remaining)),
      reset: parseInt(String(reset)),
    };
  }

  return null;
}

export function formatApiError(error: AxiosError<ApiError>): ApiError {
  if (error.response?.data) {
    return error.response.data;
  }

  if (error.request) {
    return {
      detail: 'Network error. Please check your connection.',
      status_code: 0,
    };
  }

  return {
    detail: error.message || 'An unexpected error occurred',
    status_code: 0,
  };
}