import { useState, useEffect } from 'react';
import { DataSet } from '../types';
import { formatFileSize } from '../utils/format';

// Format date function that matches test expectations
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Not set';
  
  // Handle YYYY-MM-DD format to avoid timezone issues
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return `${month}/${day}/${year}`;
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

interface DatasetDetailsModalProps {
  dataset: DataSet | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: { name: string; description: string; retentionExpiryDate?: string }) => Promise<boolean>;
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
  const [tempRetentionDate, setTempRetentionDate] = useState('');

  useEffect(() => {
    if (dataset) {
      setName(dataset.name);
      setDescription(dataset.description || '');
      
      // Convert ISO date string to YYYY-MM-DD format for the date input
      if (dataset.retentionExpiryDate) {
        const date = new Date(dataset.retentionExpiryDate);
        const formattedDate = date.toISOString().split('T')[0];
        setTempRetentionDate(formattedDate || '');
      } else {
        setTempRetentionDate('');
      }
    }
  }, [dataset]);

  const handleSave = async () => {
    if (!dataset) return;
    
    const updates: { name: string; description: string; retentionExpiryDate?: string } = {
      name,
      description,
    };
    
    if (tempRetentionDate.trim() !== '') {
      updates.retentionExpiryDate = tempRetentionDate;
    }
    
    const success = await onSave(updates);
    if (success) {
      onClose();
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (dataset) {
      setName(dataset.name);
      setDescription(dataset.description || '');
      
      // Convert ISO date string to YYYY-MM-DD format for the date input
      if (dataset.retentionExpiryDate) {
        const date = new Date(dataset.retentionExpiryDate);
        const formattedDate = date.toISOString().split('T')[0];
        setTempRetentionDate(formattedDate || '');
      } else {
        setTempRetentionDate('');
      }
    }
    onClose();
  };


  if (!isOpen || !dataset) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
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

          {/* Read-only Fields in Two Columns */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Additional Information</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
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
                <span>{formatFileSize(dataset.fileSize)}</span>
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
              <div className="flex justify-between items-center">
                <span>Retention Expiry:</span>
                <div className="flex items-center space-x-2">
                  <span>{formatDate(dataset.retentionExpiryDate)}</span>
                  <label htmlFor="retention-date" className="sr-only">Retention Expiry Date</label>
                  <input
                    type="date"
                    id="retention-date"
                    aria-label="Retention Expiry Date"
                    value={tempRetentionDate}
                    onChange={(e) => setTempRetentionDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer hover:border-blue-400"
                    title="Click to set retention expiry date"
                    disabled={loading}
                  />
                </div>
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