import { useState, useCallback, useRef } from 'react';
import { uploadFile as uploadFileApi } from '../../../lib/api/uploadClient';
import { useUploadStore } from '../stores/uploadStore';
import { validateFile } from '../utils/validation';
import { toast } from '../../../components/ui/Toast';
import type { AxiosProgressEvent } from 'axios';

interface UseFileUploadOptions {
  onSuccess?: (jobId: string, file: File) => void;
  onError?: (error: Error, file: File) => void;
  maxSize?: number;
}

export function useFileUpload(options?: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    addUpload,
    updateUploadProgress,
    setUploadJobId,
    setUploadStatus,
    setUploadError,
    cancelUpload,
  } = useUploadStore();

  const uploadFile = useCallback(async (file: File) => {
    // Validate file first
    const validation = validateFile(file, { maxSize: options?.maxSize });
    if (!validation.valid) {
      const errorMessage = validation.errors.join(', ');
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    // Create upload item in store
    const uploadId = addUpload(file);
    setIsUploading(true);
    setError(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Start upload with progress tracking
      setUploadStatus(uploadId, 'uploading');

      const response = await uploadFileApi(file, {
        onProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            updateUploadProgress(uploadId, progress);
          }
        },
        signal: abortControllerRef.current.signal,
      });

      // Upload successful, update with job ID
      setUploadJobId(uploadId, response.job_id);
      setUploadStatus(uploadId, 'analyzing');
      
      toast.success(`${file.name} uploaded successfully`);
      options?.onSuccess?.(response.job_id, file);

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'CanceledError') {
          cancelUpload(uploadId);
          toast.info('Upload cancelled');
        } else {
          const errorMessage = error.message || 'Upload failed';
          setError(errorMessage);
          setUploadError(uploadId, errorMessage);
          toast.error(errorMessage);
          options?.onError?.(error, file);
        }
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  }, [addUpload, updateUploadProgress, setUploadJobId, setUploadStatus, setUploadError, cancelUpload, options]);

  const cancelCurrentUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    uploadFile,
    isUploading,
    error,
    cancelUpload: cancelCurrentUpload,
  };
}