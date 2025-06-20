import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';

export function StorageInfo() {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Upload Limits</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Max file size:</span>
            <span className="font-medium">500 MB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Concurrent uploads:</span>
            <span className="font-medium">5 files</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Supported formats:</span>
            <span className="font-medium">MP3, WAV, FLAC, M4A, OGG</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}