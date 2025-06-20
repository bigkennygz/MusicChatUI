import { apiClient } from '@lib/api/client';
import type { QueryRequest, QueryResult } from '@/types/query';

export const queryApi = {
  submitQuery: async (request: QueryRequest): Promise<QueryResult> => {
    const response = await apiClient.post<QueryResult>('/api/v1/query', request);
    return response.data;
  },

  getQueryHistory: async (trackId?: string): Promise<QueryResult[]> => {
    const response = await apiClient.get<QueryResult[]>('/api/v1/query/history', {
      params: { track_id: trackId },
    });
    return response.data;
  },

  saveQuery: async (queryId: string, name: string): Promise<void> => {
    await apiClient.post(`/api/v1/query/${queryId}/save`, { name });
  },

  getSavedQueries: async (): Promise<Array<QueryResult & { name: string }>> => {
    const response = await apiClient.get<Array<QueryResult & { name: string }>>('/api/v1/query/saved');
    return response.data;
  },
};