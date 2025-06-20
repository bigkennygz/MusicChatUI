import { useEffect } from 'react';
import { wsManager } from '../../../lib/api/websocket';
import { useUploadStore } from '../stores/uploadStore';
import type { AnalysisProgress } from '../../../types/analysis';

export function useAnalysisWebSocket(jobId: string | undefined) {
  const updateAnalysisProgress = useUploadStore((state) => state.updateAnalysisProgress);
  const completeUpload = useUploadStore((state) => state.completeUpload);
  const setUploadError = useUploadStore((state) => state.setUploadError);
  const getUploadByJobId = useUploadStore((state) => state.getUploadByJobId);

  useEffect(() => {
    if (!jobId) return;

    // Connect WebSocket if not connected
    if (!wsManager.isConnected()) {
      wsManager.connect();
    }

    // Subscribe to job updates
    wsManager.emit('analyze:subscribe', { job_id: jobId });

    // Event handlers
    const handleProgress = (data: { job_id: string; progress: AnalysisProgress }) => {
      if (data.job_id === jobId) {
        updateAnalysisProgress(jobId, data.progress);
      }
    };

    const handleCompleted = (data: { job_id: string }) => {
      if (data.job_id === jobId) {
        const upload = getUploadByJobId(jobId);
        if (upload) {
          completeUpload(upload.id);
        }
      }
    };

    const handleFailed = (data: { job_id: string; error: string }) => {
      if (data.job_id === jobId) {
        const upload = getUploadByJobId(jobId);
        if (upload) {
          setUploadError(upload.id, data.error);
        }
      }
    };

    // Register listeners
    wsManager.on(`analysis:progress:${jobId}`, handleProgress);
    wsManager.on(`analysis:completed:${jobId}`, handleCompleted);
    wsManager.on(`analysis:failed:${jobId}`, handleFailed);

    // Cleanup
    return () => {
      wsManager.emit('analyze:unsubscribe', { job_id: jobId });
      wsManager.off(`analysis:progress:${jobId}`, handleProgress);
      wsManager.off(`analysis:completed:${jobId}`, handleCompleted);
      wsManager.off(`analysis:failed:${jobId}`, handleFailed);
    };
  }, [jobId, updateAnalysisProgress, completeUpload, setUploadError, getUploadByJobId]);
}