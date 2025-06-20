import { toast } from '../../../components/ui/Toast';

export function showUploadSuccess(fileName: string): void {
  toast.success(`${fileName} uploaded successfully`);
}

export function showUploadError(fileName: string, error: string): void {
  toast.error(`Failed to upload ${fileName}: ${error}`);
}

export function showAnalysisComplete(jobId: string, fileName: string): void {
  // Can't use useNavigate here since it's not a component/hook
  // We'll create a navigation handler function that can be passed in
  toast.success(`Analysis complete for ${fileName}!`, {
    action: {
      label: 'View Results',
      onClick: () => {
        // Navigate to analysis results
        window.location.href = `/analysis/${jobId}`;
      },
    },
    duration: 10000, // Show for 10 seconds
  });
}

export function showAnalysisError(fileName: string, error: string): void {
  toast.error(`Analysis failed for ${fileName}: ${error}`, {
    duration: 10000,
  });
}

export function showJobCancelled(fileName: string): void {
  toast.info(`Analysis cancelled for ${fileName}`);
}