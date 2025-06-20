import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { FileDropzone } from '../components/FileDropzone';
import { ActiveUploads } from '../components/ActiveUploads';
import { UploadWebSocketManager } from '../components/UploadWebSocketManager';
import { UploadError } from '../components/UploadError';
import { RecentJobs } from '../components/RecentJobs';
import { StorageInfo } from '../components/StorageInfo';
import { useUploadStore } from '../stores/uploadStore';
import { useUploadQueue, useBrowserNotifications } from '../hooks';
import { toast } from '../../../components/ui/Toast';

export function UploadPage() {
  const navigate = useNavigate();
  const uploads = useUploadStore((state) => state.uploads);
  const { notify } = useBrowserNotifications();
  
  const { addFilesToQueue } = useUploadQueue({
    maxConcurrent: 5,
    onQueueComplete: () => {
      toast.success('All uploads completed!');
    },
  });

  const handleFilesSelected = useCallback((files: File[]) => {
    addFilesToQueue(files);
  }, [addFilesToQueue]);

  const handleJobSelect = useCallback((jobId: string) => {
    navigate(`/analysis/${jobId}`);
  }, [navigate]);

  // Browser notifications for completed analyses
  useEffect(() => {
    const completedUploads = Array.from(uploads.values()).filter(
      upload => upload.status === 'completed'
    );
    
    completedUploads.forEach(upload => {
      if (upload.jobId && upload.endTime && Date.now() - upload.endTime < 1000) {
        notify('Analysis Complete', `${upload.file.name} has been analyzed successfully!`, {
          onClick: () => navigate(`/analysis/${upload.jobId}`),
        });
      }
    });
  }, [uploads, notify, navigate]);

  const activeUploads = Array.from(uploads.values()).filter(
    upload => upload.status === 'uploading' || upload.status === 'analyzing'
  );

  const failedUploads = Array.from(uploads.values()).filter(
    upload => upload.status === 'failed'
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* WebSocket Manager for real-time updates */}
      <UploadWebSocketManager />
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Audio Files</h1>
        <p className="text-gray-600 mt-2">
          Upload your music for AI-powered analysis. We support MP3, WAV, FLAC, M4A, and OGG formats up to 500MB.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Dropzone */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Select Files</h2>
            </CardHeader>
            <CardContent>
              <FileDropzone 
                onFilesSelected={handleFilesSelected}
                maxFiles={5}
                disabled={activeUploads.length >= 5}
              />
            </CardContent>
          </Card>

          {/* Active Uploads */}
          <ActiveUploads />

          {/* Failed Uploads with Error Recovery */}
          {failedUploads.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-red-600">Failed Uploads ({failedUploads.length})</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {failedUploads.map((upload) => (
                  <UploadError
                    key={upload.id}
                    file={upload.file}
                    error={upload.error || 'Unknown error'}
                    onRetry={() => {
                      useUploadStore.getState().removeUpload(upload.id);
                      addFilesToQueue([upload.file]);
                    }}
                    onDismiss={() => {
                      useUploadStore.getState().removeUpload(upload.id);
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recent Jobs */}
          <RecentJobs onJobSelect={handleJobSelect} />

          {/* Storage Info */}
          <StorageInfo />

          {/* Tips */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Tips</h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  For best results, use high-quality audio files (320kbps MP3 or lossless formats)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Analysis typically takes 1-3 minutes per track
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  You can upload multiple files at once by selecting them together
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}