import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { analysisApi } from '../api/analysisApi';
import type { ProcessedAnalysisData } from '../types';
import { processAnalysisData } from '../utils/dataProcessing';

export function useAnalysisData(jobId: string) {
  // Fetch job status
  const { data: jobStatus, isLoading: statusLoading, error: statusError } = useQuery({
    queryKey: ['analysis', 'status', jobId],
    queryFn: () => analysisApi.getJobStatus(jobId),
    enabled: !!jobId,
    refetchInterval: 2000,
  });

  // Fetch analysis results when job is completed
  const { data: results, isLoading: resultsLoading, error: resultsError } = useQuery({
    queryKey: ['analysis', 'results', jobId],
    queryFn: () => analysisApi.getJobResults(jobId),
    enabled: jobStatus?.status === 'completed' && !!jobId,
    staleTime: Infinity, // Results don't change once analysis is complete
  });

  // Fetch signed audio URL when job is completed
  const { data: signedAudioUrl, isLoading: audioUrlLoading, error: audioUrlError } = useQuery({
    queryKey: ['analysis', 'audioUrl', jobId],
    queryFn: () => analysisApi.getSignedAudioUrl(jobId),
    enabled: jobStatus?.status === 'completed' && !!jobId,
    staleTime: 3000000, // Cache for 50 minutes (token valid for 1 hour)
  });

  // Process and normalize data for visualization
  const processedData = useMemo<ProcessedAnalysisData | null>(() => {
    if (!results || !jobStatus) return null;
    
    return processAnalysisData(results, jobStatus);
  }, [results, jobStatus]);

  // Use signed URL if available, otherwise null
  const audioUrl = signedAudioUrl || null;

  // Determine overall loading state
  const isLoading = statusLoading || (jobStatus?.status === 'completed' && (resultsLoading || audioUrlLoading));
  
  // Determine if job is still processing
  const isProcessing = jobStatus?.status === 'processing' || jobStatus?.status === 'pending';
  
  // Combine errors
  const error = statusError || resultsError || audioUrlError;

  return {
    data: processedData,
    audioUrl,
    jobStatus,
    isLoading,
    isProcessing,
    error,
  };
}