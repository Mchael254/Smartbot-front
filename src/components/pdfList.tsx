import React, { useState } from 'react';
import { FileText, Download, Trash2, Eye, Calendar, HardDrive, CheckCircle, Circle } from 'lucide-react';
import type { PdfListComponentProps, PdfFileWithSelection } from '../types/pdf';
import { pdfService } from '../services/pdfService';

const PdfListComponent: React.FC<PdfListComponentProps> = ({
  files,
  onDelete,
  onView,
  onToggleSelection,
  loading = false
}) => {
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const handleDelete = async (file: PdfFileWithSelection) => {
    if (deletingFiles.has(file.id)) return;

    if (!window.confirm(`Are you sure you want to delete "${file.filename}"?`)) {
      return;
    }

    setDeletingFiles(prev => new Set(prev).add(file.id));

    try {
      const result = await pdfService.deletePdf(file.id);
      if (result.success) {
        // Notify parent component to remove from list
        onDelete?.(file.filename);
        // Optional: Show success message (you could replace alert with a toast notification)
        // alert(`Successfully deleted "${file.filename}"`);
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete file. Please try again.';
      // You could replace this alert with a toast notification or error state
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const handleView = (file: PdfFileWithSelection) => {
    const url = file.public_url;
    if (url) {
      onView?.(url);
      // Open in new tab
      window.open(url, '_blank');
    }
  };

  const handleDownload = (file: PdfFileWithSelection) => {
    const url = file.public_url;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleToggleSelection = (file: PdfFileWithSelection) => {
    if (onToggleSelection) {
      onToggleSelection(file.id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading files...</span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No PDF files uploaded</h3>
        <p className="text-gray-500">Upload your first PDF file to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Uploaded Files ({files.length})
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>
            Selected: {files.filter(f => f.is_selected).length} / {files.length}
          </span>
          <span>
            Total size: {pdfService.formatFileSize(
              files.reduce((total, file) => total + file.size, 0)
            )}
          </span>
        </div>
      </div>

      {/* File List */}
      <div className="grid gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-2 bg-red-50 rounded-lg">
                  <FileText size={24} className="text-red-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {file.filename}
                    </h4>
                    
                    {/* Selection Status Badge */}
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${file.is_selected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                      }
                    `}>
                      {file.is_selected ? (
                        <>
                          <CheckCircle size={12} className="mr-1" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Circle size={12} className="mr-1" />
                          Not Selected
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <HardDrive size={12} />
                      <span>{pdfService.formatFileSize(file.size)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{formatDate(file.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                {/* Toggle Selection Button */}
                <button
                  onClick={() => handleToggleSelection(file)}
                  className={`
                    px-3 py-1 rounded-lg text-xs font-medium transition-colors
                    ${file.is_selected
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }
                  `}
                  title={file.is_selected ? 'Remove from Knowledge Base' : 'Add to Knowledge Base'}
                >
                  {file.is_selected ? 'Unselect' : 'Select'}
                </button>

                <button
                  onClick={() => handleView(file)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View PDF"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download PDF"
                >
                  <Download size={16} />
                </button>

                <button
                  onClick={() => handleDelete(file)}
                  disabled={deletingFiles.has(file.id)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${deletingFiles.has(file.id)
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }
                  `}
                  title="Delete PDF"
                >
                  {deletingFiles.has(file.id) ? (
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Storage Path */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-mono truncate">
                Path: {file.storage_path}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PdfListComponent;