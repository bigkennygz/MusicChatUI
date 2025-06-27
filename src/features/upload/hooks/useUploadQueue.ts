import { useCallback, useEffect, useRef } from 'react';
import { useUploadStore } from '../stores/uploadStore';
import { useFileUpload } from './useFileUpload';

interface UseUploadQueueOptions {
  maxConcurrent?: number;
  onQueueComplete?: () => void;
  onUploadSuccess?: (jobId: string, file: File) => void;
  onUploadError?: (error: Error, file: File) => void;
}

export function useUploadQueue(options?: UseUploadQueueOptions) {
  const maxConcurrent = options?.maxConcurrent ?? 3;
  const processingRef = useRef(false);
  
  const {
    getPendingUploads,
    getActiveUploads,
    activeUploads,
  } = useUploadStore();

  const { uploadFile } = useFileUpload({
    onSuccess: options?.onUploadSuccess,
    onError: options?.onUploadError,
  });

  const processQueue = useCallback(async () => {
    // Prevent multiple concurrent queue processors
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const active = getActiveUploads();
      const pending = getPendingUploads();

      // Check if we can start more uploads
      const availableSlots = maxConcurrent - active.length;
      
      if (availableSlots > 0 && pending.length > 0) {
        // Start uploads for available slots
        const toUpload = pending.slice(0, availableSlots);
        
        // Upload files in parallel
        await Promise.all(
          toUpload.map(uploadItem => uploadFile(uploadItem.file))
        );
      }

      // Check if queue is complete
      const stillPending = getPendingUploads();
      const stillActive = getActiveUploads();
      
      if (stillPending.length === 0 && stillActive.length === 0) {
        options?.onQueueComplete?.();
      }
    } finally {
      processingRef.current = false;
    }
  }, [maxConcurrent, getActiveUploads, getPendingUploads, uploadFile, options]);

  // Process queue whenever uploads state changes
  useEffect(() => {
    const pending = getPendingUploads();
    const active = getActiveUploads();
    
    // Process queue if we have pending items and available slots
    if (pending.length > 0 && active.length < maxConcurrent) {
      processQueue();
    }
  }, [activeUploads, maxConcurrent, processQueue, getActiveUploads, getPendingUploads]);

  const addFilesToQueue = useCallback((files: File[]) => {
    const store = useUploadStore.getState();
    
    console.log('useUploadQueue: Adding files to queue:', files.length, files.map(f => f.name));
    
    // Add all files to the queue
    files.forEach(file => {
      store.addUpload(file);
    });

    // Start processing
    processQueue();
  }, [processQueue]);

  const clearQueue = useCallback(() => {
    const store = useUploadStore.getState();
    const pending = store.getPendingUploads();
    
    // Remove all pending uploads
    pending.forEach(upload => {
      store.removeUpload(upload.id);
    });
  }, []);

  const cancelAllActive = useCallback(() => {
    const store = useUploadStore.getState();
    const active = store.getActiveUploads();
    
    // Cancel all active uploads
    active.forEach(upload => {
      store.cancelUpload(upload.id);
    });
  }, []);

  return {
    addFilesToQueue,
    processQueue,
    clearQueue,
    cancelAllActive,
    activeCount: getActiveUploads().length,
    pendingCount: getPendingUploads().length,
    isProcessing: processingRef.current,
  };
}