import React, { useCallback, useState } from 'react';
import { cn } from '../../../../lib/utils/cn';
import { Button } from '../../../../components/ui/Button';
import { 
  validateFiles, 
  formatFileSize, 
  MAX_FILE_SIZE,
  ACCEPTED_AUDIO_FORMATS
} from '../../utils/validation';
import type { FileValidationResult } from '../../utils/validation';

export interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedFormats?: string[];
  disabled?: boolean;
  className?: string;
}

export function FileDropzone({
  onFilesSelected,
  maxFiles = 5,
  maxSize = MAX_FILE_SIZE,
  acceptedFormats = ACCEPTED_AUDIO_FORMATS,
  disabled = false,
  className,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<Map<File, FileValidationResult>>(new Map());

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validationResults = validateFiles(fileArray, { maxFiles, maxSize, acceptedFormats });
    
    const validFiles = fileArray.filter(file => validationResults.get(file)?.valid);
    const hasErrors = fileArray.some(file => !validationResults.get(file)?.valid);
    
    if (hasErrors) {
      setValidationErrors(validationResults);
    } else {
      setValidationErrors(new Map());
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      onFilesSelected(validFiles);
    }
  }, [maxFiles, maxSize, acceptedFormats, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [disabled, processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = useCallback((fileToRemove: File) => {
    const newFiles = selectedFiles.filter(file => file !== fileToRemove);
    setSelectedFiles(newFiles);
    
    // Remove validation error for this file
    const newErrors = new Map(validationErrors);
    newErrors.delete(fileToRemove);
    setValidationErrors(newErrors);
    
    if (newFiles.length === 0) {
      setValidationErrors(new Map());
    }
  }, [selectedFiles, validationErrors]);

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setValidationErrors(new Map());
  }, []);

  const acceptAttribute = acceptedFormats.map(format => `.${format}`).join(',');
  const hasErrors = validationErrors.size > 0;

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all',
          isDragging && 'border-blue-500 bg-blue-50',
          hasErrors && 'border-red-500 bg-red-50',
          !isDragging && !hasErrors && 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          multiple
          accept={acceptAttribute}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          id="file-input"
        />
        
        <div className="flex flex-col items-center gap-4">
          <svg
            className={cn(
              'w-12 h-12',
              isDragging && 'text-blue-500',
              hasErrors && 'text-red-500',
              !isDragging && !hasErrors && 'text-gray-400'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragging ? 'Drop your files here' : 'Drag and drop your audio files here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">or</p>
          </div>
          
          <label htmlFor="file-input">
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              Browse Files
            </Button>
          </label>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>Accepted formats: {acceptedFormats.map(f => f.toUpperCase()).join(', ')}</p>
            <p>Maximum file size: {formatFileSize(maxSize)}</p>
            <p>Maximum {maxFiles} files at once</p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {hasErrors && (
        <div className="mt-4 space-y-2">
          {Array.from(validationErrors.entries()).map(([file, result]) => (
            <div key={file.name} className="bg-red-50 border border-red-200 rounded p-3">
              <p className="font-medium text-red-900 text-sm">{file.name}</p>
              {result.errors.map((error, index) => (
                <p key={index} className="text-red-700 text-sm mt-1">{error}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Selected Files ({selectedFiles.length}/{maxFiles})
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
            >
              Clear All
            </Button>
          </div>
          
          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}