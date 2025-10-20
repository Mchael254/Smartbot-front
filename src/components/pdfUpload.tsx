import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import ResponseComponent from './response';
import { useSnackbar } from '../hooks/snackBar';
import type { PdfUploadComponentProps, PdfUploadProgress } from '../types/pdf';
import FileNamingModal from './fileNamingModal';
import pdfService from '../services/knowledgeBase/pdfService';

const PdfUploadComponent: React.FC<PdfUploadComponentProps> = ({
  onUploadSuccess,
  onUploadError,
  className = '',
  disabled = false
}) => {
  const { open, message, severity, showSnackbar, handleClose } = useSnackbar();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState<PdfUploadProgress[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showNamingModal, setShowNamingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileKey = (file: File) => {
    return `${file.name}_${file.size}_${file.lastModified}`;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [disabled]);

    const handleFiles = useCallback((files: File[]) => {
    const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      const errorMsg = 'Please select PDF files only';
      onUploadError?.(errorMsg);
      showSnackbar(errorMsg, 'error');
      return;
    }

    // Show modal for naming confirmation
    setPendingFiles(pdfFiles);
    setShowNamingModal(true);
  }, [onUploadError]);

  const handleNamingConfirm = useCallback(async (fileNames: { [key: string]: string }) => {
    setShowNamingModal(false);
    
    if (pendingFiles.length === 0) return;

    // Add files to upload queue
    const newUploads: PdfUploadProgress[] = pendingFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload files one by one
    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i];
      const uploadIndex = uploads.length + i;
      
      // Get custom name for this file (outside try block so it's accessible in catch)
      const fileKey = getFileKey(file);
      const customName = fileNames[fileKey]?.trim();

      try {
        // Validate file before upload
        const validation = pdfService.validatePdfFile(file);
        if (!validation.valid) {
          setUploads(prev => prev.map((upload, index) => 
            index === uploadIndex 
              ? { ...upload, status: 'error', error: validation.error }
              : upload
          ));
          const validationErrorMsg = validation.error || 'File validation failed';
          onUploadError?.(validationErrorMsg);
          showSnackbar(validationErrorMsg, 'error');
          continue;
        }

        // Upload with progress tracking
        const response = await pdfService.uploadPdfWithProgress(
          file,
          (progress) => {
            setUploads(prev => prev.map((upload, index) => 
              index === uploadIndex 
                ? { ...upload, progress }
                : upload
            ));
          },
          customName || undefined
        );

        // Mark as completed
        setUploads(prev => prev.map((upload, index) => 
          index === uploadIndex 
            ? { ...upload, status: 'completed', progress: 100 }
            : upload
        ));

        onUploadSuccess?.(response);
        showSnackbar(`${customName || file.name} uploaded successfully!`, 'success');

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setUploads(prev => prev.map((upload, index) => 
          index === uploadIndex 
            ? { ...upload, status: 'error', error: errorMessage }
            : upload
        ));

        onUploadError?.(errorMessage);
        showSnackbar(`Failed to upload ${customName || file.name}: ${errorMessage}`, 'error');
      }
    }

    // Clear pending files
    setPendingFiles([]);
  }, [pendingFiles, uploads.length, onUploadSuccess, onUploadError]);

  const handleNamingCancel = useCallback(() => {
    setShowNamingModal(false);
    setPendingFiles([]);
  }, []);



  const removeUpload = useCallback((index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
  }, []);

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-colors duration-200 cursor-pointer
          ${dragActive 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center space-y-4">
          <div className={`
            p-3 rounded-full 
            ${dragActive ? 'bg-green-100' : 'bg-gray-100'}
          `}>
            <Upload 
              size={24} 
              className={dragActive ? 'text-green-600' : 'text-gray-600'} 
            />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              {dragActive ? 'Drop PDF files here' : 'Upload PDF files'}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop your PDF files here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum file size: 10MB per file
            </p>
          </div>

          <button
            type="button"
            disabled={disabled}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${disabled 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
              }
            `}
            style={{ backgroundColor: disabled ? undefined : '#00963f' }}
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Upload Progress ({uploads.length} files)
            </h3>
            <button
              onClick={clearCompleted}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
              style={{ color: '#00963f' }}
            >
              Clear Completed
            </button>
          </div>

          <div className="space-y-2">
            {uploads.map((upload, index) => (
              <div key={index} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <FileText size={20} className="text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {upload.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pdfService.formatFileSize(upload.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {upload.status === 'completed' && (
                      <CheckCircle size={20} className="text-green-500" />
                    )}
                    {upload.status === 'error' && (
                      <AlertCircle size={20} className="text-red-500" />
                    )}
                    <button
                      onClick={() => removeUpload(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {upload.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${upload.progress}%`,
                        backgroundColor: '#00963f'
                      }}
                    />
                  </div>
                )}

                {/* Status Messages */}
                {upload.status === 'completed' && (
                  <p className="text-sm text-green-600 mt-1">
                    Upload completed successfully
                  </p>
                )}

                {upload.status === 'error' && upload.error && (
                  <p className="text-sm text-red-600 mt-1">
                    Error: {upload.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Naming Modal */}
      <FileNamingModal
        files={pendingFiles}
        isOpen={showNamingModal}
        onClose={handleNamingCancel}
        onConfirm={handleNamingConfirm}
      />
      
      {/* Response Component for Snackbar notifications */}
      <ResponseComponent
        open={open}
        handleClose={handleClose}
        message={message}
        type={
          severity === "success" || severity === "error" || severity === "warning"
            ? severity
            : severity === "info" 
              ? "warning" 
              : "error"
        }
        autoHideDuration={3000}
      />
    </div>
  );
};

export default PdfUploadComponent;