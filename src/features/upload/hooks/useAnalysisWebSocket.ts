import { useEffect } from 'react';
import { nativeWsManager } from '../../../lib/api/nativeWebsocket';
import { useUploadStore } from '../stores/uploadStore';
import type { AnalysisProgress } from '../../../types/analysis';

export function useAnalysisWebSocket(jobId: string | undefined) {
  const updateAnalysisProgress = useUploadStore((state) => state.updateAnalysisProgress);
  const completeUpload = useUploadStore((state) => state.completeUpload);
  const setUploadError = useUploadStore((state) => state.setUploadError);
  const getUploadByJobId = useUploadStore((state) => state.getUploadByJobId);

  useEffect(() => {
    if (!jobId) return;

    // Subscribe to WebSocket updates for this job
    nativeWsManager.subscribe(jobId, (message) => {
      const upload = getUploadByJobId(jobId);
      if (!upload) return;

      switch (message.type) {
        case 'progress':
          if (message.data) {
            const progress: AnalysisProgress = {
              job_id: jobId,
              percentage: message.data.percentage || 0,
              current_stage: message.data.current_stage || 'Processing',
              current_activity: message.data.current_activity || 'Processing',
              processing_rate: message.data.processing_rate || '',
              estimated_time_remaining: message.data.estimated_time_remaining || 0,
            };
            updateAnalysisProgress(jobId, progress);
          }
          break;

        case 'job_complete':
          completeUpload(upload.id);
          break;

        case 'error':
          setUploadError(upload.id, message.data?.error || 'Analysis failed');
          break;
      }
    });

    // Cleanup
    return () => {
      nativeWsManager.unsubscribe(jobId);
    };
  }, [jobId, updateAnalysisProgress, completeUpload, setUploadError, getUploadByJobId]);
}