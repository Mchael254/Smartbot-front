import React, { useState } from 'react';
import { X, FileText, Edit3 } from 'lucide-react';

interface FileNamingModalProps {
  files: File[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fileNames: { [key: string]: string }) => void;
}

const FileNamingModal: React.FC<FileNamingModalProps> = ({
  files,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [customNames, setCustomNames] = useState<{ [key: string]: string }>({});
  const [useOriginalNames, setUseOriginalNames] = useState(true);

  React.useEffect(() => {
    // Initialize with original filenames (without extension)
    const initialNames: { [key: string]: string } = {};
    files.forEach(file => {
      const fileKey = `${file.name}_${file.size}_${file.lastModified}`;
      initialNames[fileKey] = file.name.replace(/\.pdf$/i, '');
    });
    setCustomNames(initialNames);
  }, [files]);

  const handleConfirm = () => {
    const finalNames = useOriginalNames ? {} : customNames;
    onConfirm(finalNames);
  };

  const updateFileName = (fileKey: string, newName: string) => {
    setCustomNames(prev => ({
      ...prev,
      [fileKey]: newName
    }));
  };

  const getFileKey = (file: File) => {
    return `${file.name}_${file.size}_${file.lastModified}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Configure File Names
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <p className="text-gray-600 mb-6">
            Choose how you want to name your PDF files. You can use the original names or customize them.
          </p>

          {/* Quick Options */}
          <div className="mb-6 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="namingOption"
                checked={useOriginalNames}
                onChange={() => setUseOriginalNames(true)}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-900">
                Use original file names (recommended)
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="namingOption"
                checked={!useOriginalNames}
                onChange={() => setUseOriginalNames(false)}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-900">
                Customize file names
              </span>
            </label>
          </div>

          {/* File List */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Files to upload ({files.length}):
            </h4>

            {files.map((file, index) => {
              const fileKey = getFileKey(file);
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FileText size={20} className="text-red-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>

                      {!useOriginalNames && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Custom filename:
                          </label>
                          <div className="flex items-center space-x-2">
                            <Edit3 size={14} className="text-gray-400" />
                            <input
                              type="text"
                              value={customNames[fileKey] || ''}
                              onChange={(e) => updateFileName(fileKey, e.target.value)}
                              placeholder="Enter custom name"
                              className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-500">.pdf</span>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        Will be saved as: {' '}
                        <span className="font-medium text-gray-700">
                          {useOriginalNames 
                            ? file.name
                            : (customNames[fileKey]?.trim() || file.name.replace(/\.pdf$/i, '')) + '.pdf'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            style={{ backgroundColor: '#00963f' }}
          >
            Upload Files
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileNamingModal;