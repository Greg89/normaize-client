import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { DataSet } from '../../types';
import { formatFileSize } from '../../utils/format';
import { getUploadedAt, getFileSize, getRowCount, getColumnCount } from '../../utils/datasetHelpers';

interface NormalizationDatasetSelectorProps {
  datasets: DataSet[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  onSelect: (dataset: DataSet) => void;
}

export default function NormalizationDatasetSelector({
  datasets,
  loading,
  error,
  refetch,
  onSelect,
}: NormalizationDatasetSelectorProps) {
  const activeDatasets = datasets?.filter((d) => !d.isDeleted) ?? [];
  const defaultDataset = activeDatasets.find((d) => d.isProcessed) ?? null;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading datasets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading datasets: {error}</p>
        <button onClick={() => refetch()} className="mt-2 text-blue-500 hover:text-blue-600">
          Try again
        </button>
      </div>
    );
  }

  if (!datasets || activeDatasets.length === 0) {
    return (
      <div className="text-center py-8">
        <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No active datasets available</p>
        <p className="text-gray-400 text-sm mt-1">
          Please upload and process a dataset first in the Datasets section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Dataset for Normalization</h2>
        <p className="text-gray-600">
          Choose an active dataset to begin the transformation and enhancement process
        </p>
      </div>

      <div className="grid gap-4 max-w-4xl mx-auto">
        {activeDatasets.map((dataset) => (
          <div
            key={dataset.id}
            onClick={() => onSelect(dataset)}
            className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
              dataset.isProcessed
                ? 'border-green-200 bg-green-50/60 hover:bg-green-50'
                : 'border-yellow-200 bg-yellow-50/60 hover:bg-yellow-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <DocumentTextIcon className="h-6 w-6 text-gray-500" />
                  <h3 className="text-lg font-medium text-gray-900">{dataset.name}</h3>
                  {defaultDataset?.id === dataset.id && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Default
                    </span>
                  )}
                  {dataset.isProcessed && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ready for Normalization
                    </span>
                  )}
                  {!dataset.isProcessed && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Processing...
                    </span>
                  )}
                </div>
                {dataset.description && (
                  <p className="text-gray-600 mb-3">{dataset.description}</p>
                )}
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>Uploaded: {new Date(getUploadedAt(dataset)).toLocaleDateString()}</span>
                  <span>Size: {formatFileSize(getFileSize(dataset))}</span>
                  <span>Rows: {getRowCount(dataset).toLocaleString()}</span>
                  <span>Columns: {getColumnCount(dataset)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
