'use client';

import { useState, useRef, useCallback, DragEvent } from 'react';
import { Upload, FileAudio, File, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export interface FileUploadInfo {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
  preview?: string;
}

interface DragDropZoneProps {
  accept?: string[];
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFilesAdded: (files: FileUploadInfo[]) => void;
  onFileRemove?: (fileId: string) => void;
  disabled?: boolean;
  multiple?: boolean;
  showPreview?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface DropZoneState {
  isDragOver: boolean;
  isDragActive: boolean;
  files: FileUploadInfo[];
}

export default function DragDropZone({
  accept = ['audio/*', '.wav', '.mp3', '.ogg', '.m4a', '.flac'],
  maxSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 10,
  onFilesAdded,
  onFileRemove,
  disabled = false,
  multiple = true,
  showPreview = true,
  className,
  children
}: DragDropZoneProps) {
  const [state, setState] = useState<DropZoneState>({
    isDragOver: false,
    isDragActive: false,
    files: []
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const isValidFileType = useCallback((file: File): boolean => {
    if (accept.length === 0) return true;
    
    return accept.some(acceptType => {
      if (acceptType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(acceptType.toLowerCase());
      }
      if (acceptType.includes('*')) {
        const baseType = acceptType.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === acceptType;
    });
  }, [accept]);

  const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Check file type
      if (!isValidFileType(file)) {
        errors.push(`${file.name}: Invalid file type. Accepted: ${accept.join(', ')}`);
        continue;
      }

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        errors.push(`${file.name}: File too large. Maximum size: ${maxSizeMB}MB`);
        continue;
      }

      valid.push(file);
    }

    // Check total file count
    if (state.files.length + valid.length > maxFiles) {
      errors.push(`Too many files. Maximum allowed: ${maxFiles}`);
      return { valid: valid.slice(0, maxFiles - state.files.length), errors };
    }

    return { valid, errors };
  }, [accept, maxSize, maxFiles, state.files.length, isValidFileType]);

  const processFiles = useCallback(async (files: File[]) => {
    const { valid, errors } = validateFiles(files);
    
    if (errors.length > 0) {
      console.warn('File validation errors:', errors);
      // You might want to show these errors to the user
    }

    if (valid.length === 0) return;

    const fileInfos: FileUploadInfo[] = await Promise.all(
      valid.map(async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        let preview: string | undefined;

        // Generate preview for audio files
        if (file.type.startsWith('audio/') && showPreview) {
          try {
            preview = URL.createObjectURL(file);
          } catch (error) {
            console.warn('Failed to create preview for:', file.name);
          }
        }

        return {
          file,
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending' as const,
          preview
        };
      })
    );

    setState(prev => ({
      ...prev,
      files: [...prev.files, ...fileInfos]
    }));

    onFilesAdded(fileInfos);
  }, [validateFiles, onFilesAdded, showPreview]);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current++;

    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setState(prev => ({ ...prev, isDragOver: true, isDragActive: true }));
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current--;

    if (dragCounterRef.current === 0) {
      setState(prev => ({ ...prev, isDragOver: false, isDragActive: false }));
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
    }
  }, [disabled]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setState(prev => ({ ...prev, isDragOver: false, isDragActive: false }));
    dragCounterRef.current = 0;

    if (disabled) return;

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      processFiles(multiple ? files : [files[0]]);
    }
  }, [disabled, multiple, processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(multiple ? files : [files[0]]);
    }
    
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [multiple, processFiles]);

  const handleBrowseClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setState(prev => {
      const file = prev.files.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      
      return {
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      };
    });

    if (onFileRemove) {
      onFileRemove(fileId);
    }
  }, [onFileRemove]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('audio/')) {
      return <FileAudio className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const getStatusIcon = (status: FileUploadInfo['status'], hasError?: boolean) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-synth-accent" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-synth-warning" />;
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-synth-accent border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept.join(',')}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={clsx(
          'relative border-2 border-dashed rounded-xl transition-all duration-300',
          'flex flex-col items-center justify-center p-8 min-h-48',
          state.isDragOver 
            ? 'border-synth-accent bg-synth-accent/10 animate-drag-hover' 
            : 'border-gray-600 bg-synth-panel/50',
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:border-synth-accent/60 hover:bg-synth-panel/70'
        )}
        onClick={handleBrowseClick}
      >
        {children || (
          <>
            <Upload className={clsx(
              'w-12 h-12 mb-4 transition-colors',
              state.isDragOver ? 'text-synth-accent' : 'text-gray-400'
            )} />
            
            <h3 className="text-lg font-semibold text-white mb-2">
              {state.isDragOver ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            
            <p className="text-gray-400 text-center mb-4">
              or click to browse your files
            </p>
            
            <div className="text-sm text-gray-500 text-center space-y-1">
              <p>Supported formats: {accept.join(', ')}</p>
              <p>Maximum size: {formatFileSize(maxSize)} per file</p>
              {multiple && <p>Maximum files: {maxFiles}</p>}
            </div>
          </>
        )}

        {/* Active drag overlay */}
        {state.isDragActive && (
          <div className="absolute inset-0 bg-synth-accent/20 rounded-xl flex items-center justify-center">
            <div className="glass-panel p-6 rounded-lg">
              <Upload className="w-8 h-8 text-synth-accent mx-auto mb-2" />
              <p className="text-synth-accent font-semibold">Drop to upload</p>
            </div>
          </div>
        )}
      </div>

      {/* File list */}
      {state.files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-gray-300">
            Files ({state.files.length})
          </h4>
          
          <div className="space-y-2">
            {state.files.map((fileInfo) => (
              <div
                key={fileInfo.id}
                className="glass-control p-4 rounded-lg flex items-center gap-4"
              >
                {/* File icon */}
                <div className="text-synth-accent flex-shrink-0">
                  {getFileIcon(fileInfo.type)}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white truncate">
                      {fileInfo.name}
                    </p>
                    {getStatusIcon(fileInfo.status, !!fileInfo.error)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{formatFileSize(fileInfo.size)}</span>
                    <span className="capitalize">{fileInfo.status}</span>
                    {fileInfo.error && (
                      <span className="text-synth-warning">{fileInfo.error}</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {fileInfo.status === 'uploading' && typeof fileInfo.progress === 'number' && (
                    <div className="mt-2 w-full bg-synth-bg rounded-full h-1.5">
                      <div 
                        className="bg-synth-accent h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${fileInfo.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Audio preview */}
                {fileInfo.preview && showPreview && (
                  <audio
                    controls
                    className="w-48 h-8"
                    preload="none"
                  >
                    <source src={fileInfo.preview} type={fileInfo.type} />
                  </audio>
                )}

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(fileInfo.id);
                  }}
                  className="text-gray-400 hover:text-synth-warning transition-colors p-1 rounded"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for managing file uploads
export function useFileUpload() {
  const [files, setFiles] = useState<FileUploadInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback((newFiles: FileUploadInfo[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  const updateFileStatus = useCallback((fileId: string, status: FileUploadInfo['status'], progress?: number, error?: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status, progress, error }
        : file
    ));
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  }, [files]);

  const startUpload = useCallback(() => {
    setIsUploading(true);
  }, []);

  const finishUpload = useCallback(() => {
    setIsUploading(false);
  }, []);

  return {
    files,
    isUploading,
    addFiles,
    removeFile,
    updateFileStatus,
    clearFiles,
    startUpload,
    finishUpload
  };
}