import { useState, useEffect } from 'react';
import { DataSet } from '../types';

interface DatasetDetailsModalProps {
  dataset: DataSet | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: { name: string; description: string }) => Promise<boolean>;
  loading: boolean;
}

export default function DatasetDetailsModal({
  dataset,
  isOpen,
  onClose,
  onSave,
  loading
}: DatasetDetailsModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (dataset) {
      setName(dataset.name);
      setDescription(dataset.description || '');
    }
  }, [dataset]);

  const handleSave = async () => {
    if (!dataset) return;
    
    const success = await onSave({ name, description });
    if (success) {
      onClose();
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (dataset) {
      setName(dataset.name);
      setDescription(dataset.description || '');
    }
    onClose();
  };

  if (!isOpen || !dataset) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Dataset Details</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Editable Fields */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

          {/* Read-only Fields */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>File Name:</span>
                <span className="font-mono truncate max-w-xs ml-2" title={dataset.fileName}>{dataset.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span>File Type:</span>
                <span>{dataset.fileType}</span>
              </div>
              <div className="flex justify-between">
                <span>File Size:</span>
                <span>{(dataset.fileSize / 1024 / 1024) < 0.01 ? '< 0.01 MB' : `${(dataset.fileSize / 1024 / 1024).toFixed(2)} MB`}</span>
              </div>
              <div className="flex justify-between">
                <span>Uploaded:</span>
                <span>{new Date(dataset.uploadedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Rows:</span>
                <span>{dataset.rowCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Columns:</span>
                <span>{dataset.columnCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={dataset.isProcessed ? 'text-green-600' : 'text-yellow-600'}>
                  {dataset.isProcessed ? 'Processed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
} 