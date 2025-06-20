export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export const ACCEPTED_AUDIO_FORMATS = ['mp3', 'wav', 'flac', 'm4a', 'ogg'];
export const ACCEPTED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/mp4',
  'audio/x-m4a',
  'audio/ogg',
  'audio/vorbis',
];

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB in bytes

export function validateFileType(file: File): boolean {
  // Check MIME type
  if (ACCEPTED_MIME_TYPES.includes(file.type)) {
    return true;
  }

  // Fallback to extension check
  const extension = getFileExtension(file.name).toLowerCase();
  return ACCEPTED_AUDIO_FORMATS.includes(extension);
}

export function validateFileSize(file: File, maxSize: number = MAX_FILE_SIZE): boolean {
  return file.size <= maxSize;
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function getFileMetadata(file: File): FileMetadata {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    extension: getFileExtension(file.name),
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateFile(file: File, options?: {
  maxSize?: number;
  acceptedFormats?: string[];
}): FileValidationResult {
  const errors: string[] = [];
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE;

  if (!validateFileType(file)) {
    const extension = getFileExtension(file.name);
    errors.push(
      `Invalid file type${extension ? ` (.${extension})` : ''}. Accepted formats: ${ACCEPTED_AUDIO_FORMATS.join(', ')}`
    );
  }

  if (!validateFileSize(file, maxSize)) {
    errors.push(
      `File size (${formatFileSize(file.size)}) exceeds maximum allowed size of ${formatFileSize(maxSize)}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateFiles(files: File[], options?: {
  maxFiles?: number;
  maxSize?: number;
  acceptedFormats?: string[];
}): Map<File, FileValidationResult> {
  const results = new Map<File, FileValidationResult>();

  if (options?.maxFiles && files.length > options.maxFiles) {
    // Add error to all files when max files exceeded
    files.forEach(file => {
      results.set(file, {
        valid: false,
        errors: [`Maximum ${options.maxFiles} files allowed, but ${files.length} selected`],
      });
    });
    return results;
  }

  files.forEach(file => {
    results.set(file, validateFile(file, options));
  });

  return results;
}