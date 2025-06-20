import { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

export class ApiErrorHandler {
  static handle(error: unknown): ApiError {
    if (this.isApiError(error)) {
      return error;
    }

    if (error instanceof AxiosError) {
      return this.fromAxiosError(error);
    }

    if (error instanceof Error) {
      return {
        detail: error.message,
        status_code: 0,
      };
    }

    return {
      detail: 'An unexpected error occurred',
      status_code: 0,
    };
  }

  static isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'detail' in error &&
      'status_code' in error
    );
  }

  static fromAxiosError(error: AxiosError<ApiError>): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }

    if (error.code === 'ECONNABORTED') {
      return {
        detail: 'Request timeout',
        status_code: 408,
      };
    }

    if (error.code === 'ERR_NETWORK') {
      return {
        detail: 'Network error',
        status_code: 0,
      };
    }

    return {
      detail: error.message,
      status_code: 0,
    };
  }

  static getErrorMessage(error: unknown): string {
    const apiError = this.handle(error);
    return apiError.detail;
  }

  static isNetworkError(error: unknown): boolean {
    const apiError = this.handle(error);
    return apiError.status_code === 0;
  }

  static isAuthError(error: unknown): boolean {
    const apiError = this.handle(error);
    return apiError.status_code === 401 || apiError.status_code === 403;
  }

  static isValidationError(error: unknown): boolean {
    const apiError = this.handle(error);
    return apiError.status_code === 422;
  }
}