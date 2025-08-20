import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import FileUpload from '../components/FileUpload';
import DatasetDetailsModal from '../components/DatasetDetailsModal';
import DatasetPreviewModal from '../components/DatasetPreviewModal';
import { useDataSets, useDeleteDataSet, useUpdateDataSet, useResetDataSet } from '../hooks/useApi';
import { DataSet, ResetType } from '../types';
import { logger } from '../utils/logger';
import { formatFileSize } from '../utils/format';

export default function DataSets() {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const { data: datasets, loading, error, refetch } = useDataSets(includeDeleted);
  const { deleteDataSet, loading: deleteLoading } = useDeleteDataSet();
  const { updateDataSet, loading: updateLoading } = useUpdateDataSet();
  const { resetDataSet, loading: resetLoading } = useResetDataSet();
  const [showUpload, setShowUpload] = useState(false);
  const [searchParams] = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<DataSet | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we should show upload interface from query parameter
    if (searchParams.get('upload') === 'true') {
      setShowUpload(true);
    }
  }, [searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const handleUploadSuccess = (_datasetId: number, _fileName: string) => {
    // Refresh the datasets list after successful upload
    refetch();
    setShowUpload(false);
  };

  const handleUploadError = (error: string) => {
    logger.error('Upload error', { error });
    toast.error(`Upload failed: ${error}`, {
      duration: 5000,
      position: 'top-right',
    });
  };

  const handleDeleteDataset = async (dataset: DataSet) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${dataset.name}"? This action can be undone.`
    );
    
    if (!confirmed) return;

    try {
      const success = await deleteDataSet(dataset.id);
      if (success) {
        toast.success(`Dataset "${dataset.name}" deleted successfully`);
        refetch(); // Refresh the datasets list
      } else {
        toast.error('Failed to delete dataset');
      }
    } catch (error) {
      logger.error('Delete dataset error', { error, datasetId: dataset.id });
      toast.error('An error occurred while deleting the dataset');
    }
  };

  const handleOpenDetails = (dataset: DataSet) => {
    setSelectedDataset(dataset);
    setShowDetailsModal(true);
    setOpenDropdown(null); // Close dropdown
  };

  const handleOpenPreview = (dataset: DataSet) => {
    setSelectedDataset(dataset);
    setShowPreviewModal(true);
    setOpenDropdown(null); // Close dropdown
  };

  const handleUpdateDataset = async (updates: { name: string; description: string; retentionExpiryDate?: string }): Promise<boolean> => {
    if (!selectedDataset) return false;

    try {
      const updatedDataset = await updateDataSet(selectedDataset.id, updates);
      
      if (updatedDataset) {
        toast.success(`Dataset "${updates.name}" updated successfully`);
        
        // Update both selectedDataset and the dataset in the datasets array
        setSelectedDataset(updatedDataset);
        
        // Refresh the datasets list to show updated data
        await refetch();
        
        return true;
      } else {
        toast.error('Failed to update dataset');
        return false;
      }
    } catch (error) {
      logger.error('Update dataset error', { error, datasetId: selectedDataset.id });
      toast.error('An error occurred while updating the dataset');
      return false;
    }
  };

  const handleRestoreDataset = async (dataset: DataSet) => {
    const confirmed = window.confirm(
      `Are you sure you want to restore "${dataset.name}"? This will make the dataset active again.`
    );
    
    if (!confirmed) return;

    setOpenDropdown(null); // Close dropdown

    try {
      const restoredDataset = await resetDataSet(dataset.id, {
        resetType: ResetType.RESTORE,
        reason: 'Dataset restored by user'
      });
      
      if (restoredDataset) {
        toast.success(`Dataset "${dataset.name}" restored successfully`);
        refetch(); // Refresh the datasets list
      } else {
        toast.error('Failed to restore dataset');
      }
    } catch (error) {
      logger.error('Restore dataset error', { error, datasetId: dataset.id });
      toast.error('An error occurred while restoring the dataset');
    }
  };

  const handleResetDataset = async (dataset: DataSet) => {
    const confirmed = window.confirm(
      `Are you sure you want to reset "${dataset.name}"? This will restore the dataset to its original uploaded state.`
    );
    
    if (!confirmed) return;

    setOpenDropdown(null); // Close dropdown

    try {
      const resetDataset = await resetDataSet(dataset.id, {
        resetType: ResetType.REPROCESS,
        reason: 'Dataset reset to original state by user'
      });
      
      if (resetDataset) {
        toast.success(`Dataset "${dataset.name}" reset successfully`);
        refetch(); // Refresh the datasets list
      } else {
        toast.error('Failed to reset dataset');
      }
    } catch (error) {
      logger.error('Reset dataset error', { error, datasetId: dataset.id });
      toast.error('An error occurred while resetting the dataset');
    }
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedDataset(null);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setSelectedDataset(null);
  };

  const toggleDropdown = (datasetId: number) => {
    setOpenDropdown(openDropdown === datasetId ? null : datasetId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
          <p className="text-gray-600">Manage your uploaded data files</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active only</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
            <span className="text-sm text-gray-600">Include deleted</span>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showUpload ? 'Cancel Upload' : 'Upload Dataset'}
          </button>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="card">
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            multiple={true}
          />
        </div>
      )}

      {/* Datasets List */}
      <div className="card">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading datasets...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading datasets: {error}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-blue-500 hover:text-blue-600"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && datasets && datasets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No datasets uploaded yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Click &quot;Upload Dataset&quot; to get started.
            </p>
          </div>
        )}

        {!loading && !error && datasets && datasets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Your Datasets</h3>
            <div className="grid gap-4">
              {datasets.map((dataset: DataSet) => (
                <div
                  key={dataset.id}
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
                        <span>Uploaded: {new Date(dataset.uploadedAt).toLocaleDateString()}</span>
                        <span>Size: {formatFileSize(dataset.fileSize)}</span>
                        <span>Rows: {dataset.rowCount}</span>
                        <span>Columns: {dataset.columnCount}</span>
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
                          onClick={() => toggleDropdown(dataset.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded"
                          disabled={deleteLoading || resetLoading}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        
                        {openDropdown === dataset.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200" ref={dropdownRef}>
                            <div className="py-1">
                              <button
                                onClick={() => handleOpenDetails(dataset)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                disabled={updateLoading}
                              >
                                Additional Details
                              </button>
                              <button
                                onClick={() => handleOpenPreview(dataset)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              >
                                Preview Data
                              </button>
                              {dataset.isDeleted && (
                                <button
                                  onClick={() => handleRestoreDataset(dataset)}
                                  className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 hover:text-green-700"
                                  disabled={resetLoading}
                                >
                                  {resetLoading ? 'Restoring...' : 'Restore Dataset'}
                                </button>
                              )}
                              <button
                                onClick={() => handleResetDataset(dataset)}
                                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                disabled={resetLoading}
                              >
                                {resetLoading ? 'Resetting...' : 'Reset Dataset'}
                              </button>
                              <button
                                onClick={() => handleDeleteDataset(dataset)}
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
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dataset Details Modal */}
      <DatasetDetailsModal
        dataset={selectedDataset}
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        onSave={handleUpdateDataset}
        loading={updateLoading}
      />

      {/* Dataset Preview Modal */}
      <DatasetPreviewModal
        dataset={selectedDataset}
        isOpen={showPreviewModal}
        onClose={handleClosePreview}
      />
    </div>
  );
} 