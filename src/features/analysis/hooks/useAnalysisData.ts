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

  // Process and normalize data for visualization
  const processedData = useMemo<ProcessedAnalysisData | null>(() => {
    if (!results || !jobStatus) return null;
    
    return processAnalysisData(results, jobStatus);
  }, [results, jobStatus]);

  // Get audio URL
  const audioUrl = useMemo(() => {
    if (!jobId) return null;
    return analysisApi.getAudioUrl(jobId);
  }, [jobId]);

  // Determine overall loading state
  const isLoading = statusLoading || (jobStatus?.status === 'completed' && resultsLoading);
  
  // Determine if job is still processing
  const isProcessing = jobStatus?.status === 'processing' || jobStatus?.status === 'pending';
  
  // Combine errors
  const error = statusError || resultsError;

  return {
    data: processedData,
    audioUrl,
    jobStatus,
    isLoading,
    isProcessing,
    error,
  };
}