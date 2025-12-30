import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { DataSet } from '../../types';
import { logger } from '../../utils/logger';
import { useRemoveDuplicates } from '../../hooks/useApi';
import { 
  PlayIcon
} from '@heroicons/react/24/outline';

interface RemoveDuplicatesProps {
  dataset: DataSet;
}

export default function RemoveDuplicates({ dataset }: RemoveDuplicatesProps) {
  const { removeDuplicates, loading: apiLoading, error: apiError } = useRemoveDuplicates();
  
  // Extract columns from dataset schema or previewData
  const getAvailableColumns = (): string[] => {
    try {
      // First try to get from schema field
      if (dataset.schema) {
        const schemaColumns = JSON.parse(dataset.schema);
        if (Array.isArray(schemaColumns)) {
          return schemaColumns;
        }
      }
      
      // Fallback to previewData columns
      if (dataset.previewData) {
        const previewData = JSON.parse(dataset.previewData);
        if (previewData.columns && Array.isArray(previewData.columns)) {
          return previewData.columns;
        }
      }
    } catch (error) {
      logger.error('Failed to parse dataset schema/preview data', { error, datasetId: dataset.id });
    }
    
    return [];
  };

  const availableColumns = getAvailableColumns();
  
  const [config, setConfig] = useState({
    columns: availableColumns, // Default all columns selected
    keepFirst: true,
    caseSensitive: true
  });

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Remove Duplicates</h2>
        <p className="text-gray-600">Configure duplicate removal settings for <span className="font-medium">{dataset.name}</span></p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Duplicate Detection Settings</h3>
            
            {/* Column Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Columns for Comparison
                </label>
                <div className="text-sm text-gray-500 mb-3">
                  Choose which columns to use when identifying duplicates. All columns are selected by default.
                </div>
                {availableColumns.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, columns: availableColumns }))}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, columns: [] }))}
                      className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>
                )}
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {availableColumns.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No columns detected in dataset</p>
                    </div>
                  ) : (
                    availableColumns.map((column) => (
                    <label key={column} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.columns.includes(column)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({
                              ...prev,
                              columns: [...prev.columns, column]
                            }));
                          } else {
                            setConfig(prev => ({
                              ...prev,
                              columns: prev.columns.filter(col => col !== column)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{column}</span>
                    </label>
                    ))
                  )}
                </div>
              </div>

              {/* Keep Strategy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which Duplicate to Keep
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={config.keepFirst}
                      onChange={() => setConfig(prev => ({ ...prev, keepFirst: true }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Keep first occurrence</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={!config.keepFirst}
                      onChange={() => setConfig(prev => ({ ...prev, keepFirst: false }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Keep last occurrence</span>
                  </label>
                </div>
              </div>

              {/* Case Sensitivity */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.caseSensitive}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      caseSensitive: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Case sensitive comparison</span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  When enabled, &quot;John&quot; and &quot;john&quot; will be treated as different values
                </p>
              </div>
            </div>
          </div>


        </div>

        {/* Preview Panel */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Summary</h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Dataset:</span>
              <span className="ml-2 text-gray-600">{dataset.name}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Columns to compare:</span>
              <div className="ml-2 text-gray-600">
                {config.columns.length > 0 
                  ? (config.columns.length === availableColumns.length 
                      ? 'All columns' 
                      : config.columns.join(', '))
                  : 'No columns selected'
                }
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Keep strategy:</span>
              <span className="ml-2 text-gray-600">
                {config.keepFirst ? 'First occurrence' : 'Last occurrence'}
              </span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Case sensitive:</span>
              <span className="ml-2 text-gray-600">
                {config.caseSensitive ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}
            <button
              onClick={async () => {
                // Validate that at least one column is selected
                if (config.columns.length === 0) {
                  toast.error('Please select at least one column for comparison');
                  return;
                }

                try {
                  const success = await removeDuplicates(dataset.id, {
                    columnNames: config.columns,
                    keepFirstOccurrence: config.keepFirst,
                    caseSensitive: config.caseSensitive
                  });

                  if (success) {
                    const columnText = config.columns.length > 0 
                      ? `based on columns: ${config.columns.join(', ')}` 
                      : 'based on all columns';
                    toast.success(`Duplicate removal completed ${columnText}`);
                    logger.info('Duplicate removal executed', { 
                      datasetId: dataset.id, 
                      config 
                    });
                  } else {
                    toast.error('Failed to remove duplicates');
                  }
                } catch (error) {
                  logger.error('Duplicate removal error', { error, datasetId: dataset.id });
                  toast.error('An error occurred while removing duplicates');
                }
              }}
              disabled={apiLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              {apiLoading ? 'Removing Duplicates...' : 'Execute Duplicate Removal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
