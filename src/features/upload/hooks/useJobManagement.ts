import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisApi } from '../../../features/analysis/api/analysisApi';

export function useJobManagement() {
  const queryClient = useQueryClient();
  
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['analysis', 'jobs'],
    queryFn: () => analysisApi.listJobs(),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const cancelJob = useMutation({
    mutationFn: analysisApi.cancelJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis', 'jobs'] });
    },
  });

  const retryJob = async (jobId: string) => {
    // Get the original file from the failed job
    // This would need to be implemented based on your backend API
    console.log('Retry functionality not yet implemented for job:', jobId);
  };

  return {
    jobs: jobs?.items || [],
    isLoading,
    error,
    cancelJob: cancelJob.mutate,
    retryJob,
  };
}