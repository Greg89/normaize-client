import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { useDataSets } from '../hooks/useApi';
import { DataSet } from '../types';

export default function DataSets() {
  const { data: datasets, loading, error, refetch } = useDataSets();
  const [showUpload, setShowUpload] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we should show upload interface from query parameter
    if (searchParams.get('upload') === 'true') {
      setShowUpload(true);
    }
  }, [searchParams]);

  const handleUploadSuccess = (_datasetId: number, _fileName: string) => {
    // Refresh the datasets list after successful upload
    refetch();
    setShowUpload(false);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
          <p className="text-gray-600">Manage your uploaded data files</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showUpload ? 'Cancel Upload' : 'Upload Dataset'}
        </button>
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
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{dataset.name}</h4>
                      <p className="text-sm text-gray-500">{dataset.fileName}</p>
                      {dataset.description && (
                        <p className="text-sm text-gray-600 mt-1">{dataset.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                        <span>Uploaded: {new Date(dataset.uploadedAt).toLocaleDateString()}</span>
                        <span>Size: {(dataset.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span>Rows: {dataset.rowCount}</span>
                        <span>Columns: {dataset.columnCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {dataset.isProcessed && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Processed
                        </span>
                      )}
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 