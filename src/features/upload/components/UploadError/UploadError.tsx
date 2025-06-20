import { Button } from '../../../../components/ui/Button';
import { Card, CardContent } from '../../../../components/ui/Card';

export interface UploadErrorProps {
  error: string;
  file: File;
  onRetry: () => void;
  onDismiss: () => void;
}

export function UploadError({ error, file, onRetry, onDismiss }: UploadErrorProps) {
  const getErrorHelp = () => {
    if (error.includes('size')) {
      return 'Try compressing the file or using a smaller audio file.';
    }
    if (error.includes('type') || error.includes('format')) {
      return 'Make sure the file is in a supported format (MP3, WAV, FLAC, M4A, OGG).';
    }
    if (error.includes('network') || error.includes('Network')) {
      return 'Check your internet connection and try again.';
    }
    return 'If the problem persists, please contact support.';
  };

  return (
    <Card className="border-red-300 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-red-900">{file.name}</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <p className="text-sm text-red-600 mt-2">{getErrorHelp()}</p>
          </div>
          <div className="flex gap-2 ml-4">
            <Button size="sm" variant="secondary" onClick={onRetry}>
              Retry
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}