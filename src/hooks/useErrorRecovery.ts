import { useState, useCallback } from 'react';
import { toast } from '../components/ui/Toast';

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

export interface ErrorRecoveryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
}

export function useErrorRecovery(options: ErrorRecoveryOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry,
    onSuccess,
    onFailure,
  } = options;

  const [state, setState] = useState<ErrorRecoveryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
  });

  const retry = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      errorMessage?: string
    ): Promise<T | null> => {
      setState((prev) => ({ ...prev, isRetrying: true }));

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await operation();
          
          setState({
            isRetrying: false,
            retryCount: 0,
            lastError: null,
          });
          
          if (attempt > 1) {
            toast.success('Operation succeeded after retry');
          }
          
          onSuccess?.();
          return result;
        } catch (error) {
          const err = error as Error;
          
          setState((prev) => ({
            ...prev,
            retryCount: attempt,
            lastError: err,
          }));

          if (attempt < maxRetries) {
            onRetry?.(attempt);
            
            const delay = retryDelay * Math.pow(2, attempt - 1);
            toast.warning(
              `${errorMessage || 'Operation failed'}. Retrying... (${attempt}/${maxRetries})`
            );
            
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            setState((prev) => ({ ...prev, isRetrying: false }));
            
            toast.error(
              `${errorMessage || 'Operation failed'} after ${maxRetries} attempts`
            );
            
            onFailure?.(err);
            return null;
          }
        }
      }

      setState((prev) => ({ ...prev, isRetrying: false }));
      return null;
    },
    [maxRetries, retryDelay, onRetry, onSuccess, onFailure]
  );

  const reset = useCallback(() => {
    setState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
    });
  }, []);

  return {
    ...state,
    retry,
    reset,
  };
}