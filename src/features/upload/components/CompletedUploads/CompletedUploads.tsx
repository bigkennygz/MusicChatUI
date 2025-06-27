import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { useUploadStore } from '../../stores/uploadStore';
import { CheckCircle, ArrowRight, X } from 'lucide-react';
import { formatFileSize } from '../../../../lib/utils/format';

export function CompletedUploads() {
  const navigate = useNavigate();
  const uploads = useUploadStore((state) => state.uploads);
  const removeUpload = useUploadStore((state) => state.removeUpload);

  const completedUploads = Array.from(uploads.values()).filter(
    upload => upload.status === 'completed' && upload.jobId
  );

  if (completedUploads.length === 0) {
    return null;
  }

  const handleNavigateToAnalysis = (jobId: string) => {
    navigate(`/analysis/${jobId}`);
  };

  const handleDismiss = (uploadId: string) => {
    removeUpload(uploadId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-600">
            Completed Analyses ({completedUploads.length})
          </h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {completedUploads.map((upload) => (
          <div
            key={upload.id}
            className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">{upload.file.name}</p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(upload.file.size)} • Analysis complete
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => handleNavigateToAnalysis(upload.jobId!)}
                className="flex items-center space-x-1"
              >
                <span>View Analysis</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                onClick={() => handleDismiss(upload.id)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}