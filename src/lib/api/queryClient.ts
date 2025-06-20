import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from '@components/ui/Toast';
import type { ApiError } from '@/types/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        // Type check for API error
        const apiError = error as ApiError;
        // Don't retry on 4xx errors except 429
        if (apiError?.status_code >= 400 && apiError?.status_code < 500 && apiError?.status_code !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      if (apiError?.status_code !== 401) {
        toast.error(apiError?.detail || 'An error occurred');
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      if (apiError?.status_code !== 401) {
        toast.error(apiError?.detail || 'An error occurred');
      }
    },
  }),
});