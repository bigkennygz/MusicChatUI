import { toast } from '../../../components/ui/Toast';

export function showUploadSuccess(fileName: string): void {
  toast.success(`${fileName} uploaded successfully`);
}

export function showUploadError(fileName: string, error: string): void {
  toast.error(`Failed to upload ${fileName}: ${error}`);
}

export function showAnalysisComplete(_jobId: string, fileName: string): void {
  toast.success(`Analysis complete for ${fileName}! Click to view results.`);
  // For now, we'll have to handle navigation separately
}

export function showAnalysisError(fileName: string, error: string): void {
  toast.error(`Analysis failed for ${fileName}: ${error}`);
}

export function showJobCancelled(fileName: string): void {
  toast.info(`Analysis cancelled for ${fileName}`);
}