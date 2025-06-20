import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { UploadProgress } from '../UploadProgress';
import { useUploadStore } from '../../stores/uploadStore';

export function ActiveUploads() {
  const uploads = useUploadStore((state) => state.uploads);
  const cancelUpload = useUploadStore((state) => state.cancelUpload);
  const cancelAllActive = useUploadStore((state) => state.getActiveUploads);

  const activeUploads = Array.from(uploads.values()).filter(
    upload => upload.status === 'uploading' || upload.status === 'analyzing'
  );

  if (activeUploads.length === 0) {
    return null;
  }

  const handleCancelAll = () => {
    const active = cancelAllActive();
    active.forEach(upload => cancelUpload(upload.id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Active Uploads ({activeUploads.length})</h3>
          <button
            onClick={handleCancelAll}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Cancel All
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeUploads.map((upload) => (
          <UploadProgress
            key={upload.id}
            file={upload.file}
            uploadProgress={upload.uploadProgress}
            analysisProgress={upload.analysisProgress}
            status={upload.status}
            error={upload.error}
            onCancel={() => cancelUpload(upload.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}