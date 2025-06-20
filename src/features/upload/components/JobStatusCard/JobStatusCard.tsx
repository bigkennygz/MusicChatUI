import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisApi } from '../../../../features/analysis/api/analysisApi';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent } from '../../../../components/ui/Card';
import { formatFileSize } from '../../utils/validation';
import type { AnalysisJob } from '../../../../types/analysis';

export interface JobStatusCardProps {
  job: AnalysisJob;
  onCancel?: () => void;
  onRetry?: () => void;
  onViewResults?: () => void;
}

export function JobStatusCard({ job, onCancel, onRetry, onViewResults }: JobStatusCardProps) {
  const queryClient = useQueryClient();
  
  const cancelMutation = useMutation({
    mutationFn: () => analysisApi.cancelJob(job.job_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis', 'jobs'] });
      onCancel?.();
    },
  });

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed': return '✓';
      case 'failed': return '✗';
      case 'processing': return '↻';
      case 'cancelled': return '⊘';
      default: return '◷';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-xl ${getStatusColor()}`}>
                {getStatusIcon()}
              </span>
              <h4 className="font-medium">{job.file_name}</h4>
              <span className="text-sm text-gray-500">
                {formatFileSize(job.file_size)}
              </span>
            </div>
            
            {job.status === 'processing' && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{job.current_activity || 'Processing...'}</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {job.error_message && (
              <p className="text-sm text-red-600 mt-2">{job.error_message}</p>
            )}
            
            <div className="text-sm text-gray-500 mt-2">
              Created: {new Date(job.created_at).toLocaleString()}
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            {job.status === 'processing' && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                Cancel
              </Button>
            )}
            
            {job.status === 'failed' && onRetry && (
              <Button size="sm" variant="secondary" onClick={onRetry}>
                Retry
              </Button>
            )}
            
            {job.status === 'completed' && (
              <Button size="sm" onClick={onViewResults}>
                View Results
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}