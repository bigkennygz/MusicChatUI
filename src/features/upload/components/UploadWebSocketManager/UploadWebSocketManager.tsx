import { useUploadStore } from '../../stores/uploadStore';
import { useAnalysisWebSocket } from '../../hooks/useAnalysisWebSocket';

// Component to manage WebSocket connections for each active upload
export function UploadWebSocketManager() {
  const uploads = useUploadStore((state) => state.uploads);
  
  // Get all uploads that have a jobId (meaning they're uploaded and need WebSocket tracking)
  const uploadsWithJobs = Array.from(uploads.values()).filter(
    upload => upload.jobId && (upload.status === 'analyzing' || upload.status === 'uploading')
  );

  return (
    <>
      {uploadsWithJobs.map(upload => (
        <WebSocketConnection key={upload.jobId} jobId={upload.jobId!} />
      ))}
    </>
  );
}

// Individual WebSocket connection component
function WebSocketConnection({ jobId }: { jobId: string }) {
  useAnalysisWebSocket(jobId);
  return null;
}