import { useState, useEffect, useRef } from 'react';
import { DataSet } from '../types';
import { formatFileSize } from '../utils/format';
import { getUploadedAt, getFileSize, getRowCount, getColumnCount } from '../utils/datasetHelpers';

interface DatasetCardProps {
  dataset: DataSet;
  onOpenDetails: (dataset: DataSet) => void;
  onOpenPreview: (dataset: DataSet) => void;
  onDelete: (dataset: DataSet) => void;
  onRestore: (dataset: DataSet) => void;
  onReset: (dataset: DataSet) => void;
  deleteLoading: boolean;
  updateLoading: boolean;
  resetLoading: boolean;
}

export default function DatasetCard({
  dataset,
  onOpenDetails,
  onOpenPreview,
  onDelete,
  onRestore,
  onReset,
  deleteLoading,
  updateLoading,
  resetLoading,
}: DatasetCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
        dataset.isDeleted
          ? 'border-red-200 bg-red-50/60'
          : 'border-green-200 bg-green-50/60'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{dataset.name}</h4>
          {dataset.description && (
            <p className="text-sm text-gray-600 mt-1">{dataset.description}</p>
          )}
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
            <span>Uploaded: {new Date(getUploadedAt(dataset)).toLocaleDateString()}</span>
            <span>Size: {formatFileSize(getFileSize(dataset))}</span>
            <span>Rows: {getRowCount(dataset).toLocaleString()}</span>
            <span>Columns: {getColumnCount(dataset)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {dataset.isDeleted && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
              Deleted
            </span>
          )}
          {dataset.isProcessed && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Processed
            </span>
          )}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
              disabled={deleteLoading || resetLoading}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {isOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
              >
                <div className="py-1">
                  <button
                    onClick={() => { onOpenDetails(dataset); setIsOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    disabled={updateLoading}
                  >
                    Additional Details
                  </button>
                  <button
                    onClick={() => { onOpenPreview(dataset); setIsOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Preview Data
                  </button>
                  {dataset.isDeleted && (
                    <button
                      onClick={() => { onRestore(dataset); setIsOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 hover:text-green-700"
                      disabled={resetLoading}
                    >
                      {resetLoading ? 'Restoring...' : 'Restore Dataset'}
                    </button>
                  )}
                  <button
                    onClick={() => { onReset(dataset); setIsOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Dataset'}
                  </button>
                  <button
                    onClick={() => { onDelete(dataset); setIsOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Dataset'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
