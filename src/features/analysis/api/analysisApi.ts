import { apiClient } from '@lib/api/client';
import { uploadFile } from '@lib/api/uploadClient';
import type { AnalysisJob, AnalysisResults } from '@/types/analysis';
import type { PaginatedResponse } from '@/types/api';

export const analysisApi = {
  submitFile: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ job_id: string }> => {
    return uploadFile(file, {
      onProgress: (event) => {
        if (event.total) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          onProgress?.(percentCompleted);
        }
      },
    });
  },

  getJobStatus: async (jobId: string): Promise<AnalysisJob> => {
    const response = await apiClient.get<AnalysisJob>(`/api/v1/analyze/${jobId}`);
    return response.data;
  },

  getJobResults: async (jobId: string): Promise<AnalysisResults> => {
    const response = await apiClient.get<AnalysisResults>(`/api/v1/analyze/${jobId}/results`);
    return response.data;
  },

  cancelJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/analyze/${jobId}`);
  },

  listJobs: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AnalysisJob>> => {
    const response = await apiClient.get<PaginatedResponse<AnalysisJob>>('/api/v1/analyze', {
      params,
    });
    return response.data;
  },

  downloadResults: async (jobId: string, format: 'json' | 'csv' = 'json'): Promise<Blob> => {
    const response = await apiClient.get(`/api/v1/analyze/${jobId}/download`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  // Get audio file URL for playback
  getAudioUrl: (jobId: string, stem?: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    if (stem) {
      return `${baseUrl}/api/v1/analyze/${jobId}/audio/${stem}`;
    }
    return `${baseUrl}/api/v1/analyze/${jobId}/audio`;
  },

  // Get waveform peaks data
  getWaveformPeaks: async (jobId: string): Promise<number[]> => {
    const response = await apiClient.get(`/api/v1/analyze/${jobId}/waveform`);
    return response.data.peaks;
  },
};