import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { AxiosProgressEvent } from 'axios';
import { useFileUpload } from '../useFileUpload';

// Mock the upload API
vi.mock('../../../../lib/api/uploadClient', () => ({
  uploadFile: vi.fn(),
}));

// Mock the store
vi.mock('../../stores/uploadStore', () => ({
  useUploadStore: vi.fn(() => ({
    addUpload: vi.fn(() => 'test-upload-id'),
    updateUploadProgress: vi.fn(),
    setUploadJobId: vi.fn(),
    setUploadStatus: vi.fn(),
    setUploadError: vi.fn(),
    cancelUpload: vi.fn(),
  })),
}));

// Mock toast
vi.mock('../../../../components/ui/Toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful upload', async () => {
    const { uploadFile: mockUploadFile } = await import('../../../../lib/api/uploadClient');
    vi.mocked(mockUploadFile).mockResolvedValue({ job_id: 'test-123' });
    
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useFileUpload({ onSuccess }));
    
    const file = new File(['test'], 'test.mp3', { type: 'audio/mp3' });
    
    await act(async () => {
      await result.current.uploadFile(file);
    });
    
    expect(mockUploadFile).toHaveBeenCalledWith(file, expect.any(Object));
    expect(onSuccess).toHaveBeenCalledWith('test-123', file);
  });

  it('should handle upload error', async () => {
    const { uploadFile: mockUploadFile } = await import('../../../../lib/api/uploadClient');
    const error = new Error('Upload failed');
    vi.mocked(mockUploadFile).mockRejectedValue(error);
    
    const onError = vi.fn();
    const { result } = renderHook(() => useFileUpload({ onError }));
    
    const file = new File(['test'], 'test.mp3', { type: 'audio/mp3' });
    
    await act(async () => {
      await result.current.uploadFile(file);
    });
    
    expect(onError).toHaveBeenCalledWith(error, file);
    expect(result.current.error).toBe('Upload failed');
  });

  it('should validate file before uploading', async () => {
    const { result } = renderHook(() => useFileUpload({ maxSize: 1024 })); // 1KB limit
    
    const file = new File(['x'.repeat(2048)], 'test.mp3', { type: 'audio/mp3' }); // 2KB file
    
    await act(async () => {
      await result.current.uploadFile(file);
    });
    
    expect(result.current.error).toContain('exceeds maximum allowed size');
  });

  it('should track upload progress', async () => {
    const { uploadFile: mockUploadFile } = await import('../../../../lib/api/uploadClient');
    const { useUploadStore } = await import('../../stores/uploadStore');
    const mockUpdateProgress = vi.fn();
    
    vi.mocked(useUploadStore).mockReturnValue({
      addUpload: vi.fn(() => 'test-upload-id'),
      updateUploadProgress: mockUpdateProgress,
      setUploadJobId: vi.fn(),
      setUploadStatus: vi.fn(),
      setUploadError: vi.fn(),
      cancelUpload: vi.fn(),
    });
    
    vi.mocked(mockUploadFile).mockImplementation(async (file, config) => {
      // Simulate progress
      config?.onProgress?.({ loaded: 50, total: 100 } as AxiosProgressEvent);
      return { job_id: 'test-123' };
    });
    
    const { result } = renderHook(() => useFileUpload());
    const file = new File(['test'], 'test.mp3', { type: 'audio/mp3' });
    
    await act(async () => {
      await result.current.uploadFile(file);
    });
    
    expect(mockUpdateProgress).toHaveBeenCalledWith('test-upload-id', 50);
  });
});