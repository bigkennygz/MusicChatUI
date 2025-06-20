import { useMemo } from 'react';
import { cn } from '../../../../lib/utils/cn';
import { Button } from '../../../../components/ui/Button';
import { formatFileSize } from '../../utils/validation';
import type { AnalysisProgress } from '../../../../types/analysis';

export type JobStatus = 'pending' | 'uploading' | 'analyzing' | 'completed' | 'failed' | 'cancelled';

export interface UploadProgressProps {
  file: File;
  uploadProgress: number;
  analysisProgress?: AnalysisProgress;
  status: JobStatus;
  onCancel?: () => void;
  error?: string;
  className?: string;
}

export function UploadProgress({
  file,
  uploadProgress,
  analysisProgress,
  status,
  onCancel,
  error,
  className,
}: UploadProgressProps) {
  const progress = useMemo(() => {
    if (status === 'uploading') {
      return uploadProgress;
    }
    if (status === 'analyzing' && analysisProgress) {
      return analysisProgress.percentage;
    }
    if (status === 'completed') {
      return 100;
    }
    return 0;
  }, [status, uploadProgress, analysisProgress]);

  const statusText = useMemo(() => {
    switch (status) {
      case 'pending':
        return 'Waiting...';
      case 'uploading':
        return `Uploading... ${uploadProgress}%`;
      case 'analyzing':
        return analysisProgress?.current_stage || 'Analyzing...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }, [status, uploadProgress, analysisProgress]);

  const statusColor = useMemo(() => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      default:
        return 'text-blue-600';
    }
  }, [status]);

  const progressBarColor = useMemo(() => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  }, [status]);

  const formatTime = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canCancel = status === 'uploading' || status === 'analyzing';
  const showActivity = status === 'analyzing' && analysisProgress?.current_activity;
  const showTimeRemaining = status === 'analyzing' && analysisProgress?.estimated_time_remaining;

  return (
    <div className={cn('border rounded-lg p-4 space-y-3', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className={cn('text-sm font-medium', statusColor)}>
                  {statusText}
                </span>
                {showTimeRemaining && (
                  <span className="text-xs text-gray-500">
                    {formatTime(analysisProgress.estimated_time_remaining)} remaining
                  </span>
                )}
              </div>
              
              {showActivity && (
                <p className="text-xs text-gray-600 mb-1">{analysisProgress.current_activity}</p>
              )}
              
              {analysisProgress?.processing_rate && (
                <p className="text-xs text-gray-500">{analysisProgress.processing_rate}</p>
              )}
            </div>
          </div>
        </div>
        
        {canCancel && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="flex-shrink-0"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {(status === 'uploading' || status === 'analyzing') && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', progressBarColor)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Status Icons */}
      <div className="flex items-center gap-2">
        {status === 'completed' && (
          <div className="flex items-center gap-1 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">Analysis complete</span>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="flex items-center gap-1 text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">Upload failed</span>
          </div>
        )}
        
        {status === 'cancelled' && (
          <div className="flex items-center gap-1 text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">Cancelled</span>
          </div>
        )}
      </div>
    </div>
  );
}