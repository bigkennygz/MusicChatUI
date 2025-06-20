import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AnalysisProgress } from '../../../types/analysis';
import type { JobStatus } from '../components/UploadProgress';

export interface UploadItem {
  id: string;
  file: File;
  jobId?: string;
  uploadProgress: number;
  analysisProgress?: AnalysisProgress;
  status: JobStatus;
  error?: string;
  startTime: number;
  endTime?: number;
}

export interface UploadState {
  uploads: Map<string, UploadItem>;
  activeUploads: number;
  
  // Actions
  addUpload: (file: File) => string;
  updateUploadProgress: (id: string, progress: number) => void;
  updateAnalysisProgress: (jobId: string, progress: AnalysisProgress) => void;
  setUploadJobId: (uploadId: string, jobId: string) => void;
  setUploadStatus: (id: string, status: JobStatus) => void;
  setUploadError: (id: string, error: string) => void;
  removeUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  completeUpload: (id: string) => void;
  
  // Getters
  getUploadById: (id: string) => UploadItem | undefined;
  getUploadByJobId: (jobId: string) => UploadItem | undefined;
  getActiveUploads: () => UploadItem[];
  getPendingUploads: () => UploadItem[];
  getCompletedUploads: () => UploadItem[];
  getFailedUploads: () => UploadItem[];
}

function generateUploadId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useUploadStore = create<UploadState>()(
  devtools(
    (set, get) => ({
      uploads: new Map(),
      activeUploads: 0,

      addUpload: (file: File) => {
        const id = generateUploadId();
        const uploadItem: UploadItem = {
          id,
          file,
          uploadProgress: 0,
          status: 'pending',
          startTime: Date.now(),
        };

        set((state) => {
          const newUploads = new Map(state.uploads);
          newUploads.set(id, uploadItem);
          return { uploads: newUploads };
        });

        return id;
      },

      updateUploadProgress: (id: string, progress: number) => {
        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.set(id, {
            ...upload,
            uploadProgress: Math.min(100, Math.max(0, progress)),
            status: upload.status === 'pending' ? 'uploading' : upload.status,
          });

          return {
            uploads: newUploads,
            activeUploads: upload.status === 'pending' ? state.activeUploads + 1 : state.activeUploads,
          };
        });
      },

      updateAnalysisProgress: (jobId: string, progress: AnalysisProgress) => {
        set((state) => {
          const upload = Array.from(state.uploads.values()).find(u => u.jobId === jobId);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.set(upload.id, {
            ...upload,
            analysisProgress: progress,
            status: 'analyzing',
          });

          return { uploads: newUploads };
        });
      },

      setUploadJobId: (uploadId: string, jobId: string) => {
        set((state) => {
          const upload = state.uploads.get(uploadId);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.set(uploadId, {
            ...upload,
            jobId,
            uploadProgress: 100,
            status: 'analyzing',
          });

          return { uploads: newUploads };
        });
      },

      setUploadStatus: (id: string, status: JobStatus) => {
        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          const isBecomingActive = upload.status === 'pending' && (status === 'uploading' || status === 'analyzing');
          const isBecomingInactive = (upload.status === 'uploading' || upload.status === 'analyzing') && 
                                    (status === 'completed' || status === 'failed' || status === 'cancelled');

          newUploads.set(id, {
            ...upload,
            status,
            endTime: (status === 'completed' || status === 'failed' || status === 'cancelled') ? Date.now() : upload.endTime,
          });

          return {
            uploads: newUploads,
            activeUploads: isBecomingActive ? state.activeUploads + 1 
                         : isBecomingInactive ? state.activeUploads - 1 
                         : state.activeUploads,
          };
        });
      },

      setUploadError: (id: string, error: string) => {
        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          const wasActive = upload.status === 'uploading' || upload.status === 'analyzing';
          
          newUploads.set(id, {
            ...upload,
            error,
            status: 'failed',
            endTime: Date.now(),
          });

          return {
            uploads: newUploads,
            activeUploads: wasActive ? state.activeUploads - 1 : state.activeUploads,
          };
        });
      },

      removeUpload: (id: string) => {
        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.delete(id);
          
          const wasActive = upload.status === 'uploading' || upload.status === 'analyzing';

          return {
            uploads: newUploads,
            activeUploads: wasActive ? state.activeUploads - 1 : state.activeUploads,
          };
        });
      },

      cancelUpload: (id: string) => {
        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          const wasActive = upload.status === 'uploading' || upload.status === 'analyzing';
          
          newUploads.set(id, {
            ...upload,
            status: 'cancelled',
            endTime: Date.now(),
          });

          return {
            uploads: newUploads,
            activeUploads: wasActive ? state.activeUploads - 1 : state.activeUploads,
          };
        });
      },

      completeUpload: (id: string) => {
        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          const wasActive = upload.status === 'uploading' || upload.status === 'analyzing';
          
          newUploads.set(id, {
            ...upload,
            status: 'completed',
            endTime: Date.now(),
          });

          return {
            uploads: newUploads,
            activeUploads: wasActive ? state.activeUploads - 1 : state.activeUploads,
          };
        });
      },

      getUploadById: (id: string) => {
        return get().uploads.get(id);
      },

      getUploadByJobId: (jobId: string) => {
        return Array.from(get().uploads.values()).find(upload => upload.jobId === jobId);
      },

      getActiveUploads: () => {
        return Array.from(get().uploads.values()).filter(
          upload => upload.status === 'uploading' || upload.status === 'analyzing'
        );
      },

      getPendingUploads: () => {
        return Array.from(get().uploads.values()).filter(
          upload => upload.status === 'pending'
        );
      },

      getCompletedUploads: () => {
        return Array.from(get().uploads.values()).filter(
          upload => upload.status === 'completed'
        );
      },

      getFailedUploads: () => {
        return Array.from(get().uploads.values()).filter(
          upload => upload.status === 'failed'
        );
      },
    }),
    {
      name: 'upload-store',
    }
  )
);