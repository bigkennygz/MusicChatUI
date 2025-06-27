import type { AxiosError, AxiosRequestConfig } from 'axios';

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: AxiosError) => boolean;
  onRetry?: (error: AxiosError, retryCount: number) => void;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
  onRetry: () => {},
};

export function isRetryableError(error: AxiosError): boolean {
  // Network errors
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return true;
  }
  
  // No response (network error)
  if (!error.response) {
    return true;
  }
  
  // Server errors (5xx)
  if (error.response.status >= 500 && error.response.status < 600) {
    return true;
  }
  
  // Request timeout
  if (error.response.status === 408) {
    return true;
  }
  
  return false;
}

export function calculateBackoff(retryCount: number, baseDelay: number): number {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, retryCount);
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
}

export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  config?: RetryConfig
): Promise<T> {
  const { maxRetries, retryDelay, retryCondition, onRetry } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };
  
  let lastError: AxiosError | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as AxiosError;
      
      // Don't retry if we've exhausted attempts
      if (attempt === maxRetries) {
        break;
      }
      
      // Check if error is retryable
      if (!retryCondition(lastError)) {
        throw lastError;
      }
      
      // Calculate delay
      const delay = calculateBackoff(attempt, retryDelay);
      
      // Call retry callback
      onRetry(lastError, attempt + 1);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Axios request interceptor for automatic retry
export function axiosRetryInterceptor(
  error: AxiosError,
  retryConfig?: RetryConfig
): Promise<AxiosRequestConfig> {
  const config = error.config as AxiosRequestConfig & { _retryCount?: number };
  
  if (!config || !isRetryableError(error)) {
    return Promise.reject(error);
  }
  
  config._retryCount = config._retryCount || 0;
  
  const { maxRetries = 3, retryDelay = 1000 } = retryConfig || {};
  
  if (config._retryCount >= maxRetries) {
    return Promise.reject(error);
  }
  
  config._retryCount++;
  
  const delay = calculateBackoff(config._retryCount - 1, retryDelay);
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(config), delay);
  });
}