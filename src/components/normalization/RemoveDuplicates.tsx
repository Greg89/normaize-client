import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { DataSet } from '../../types';
import { logger } from '../../utils/logger';
import { 
  PlayIcon
} from '@heroicons/react/24/outline';

interface RemoveDuplicatesProps {
  dataset: DataSet;
}

export default function RemoveDuplicates({ dataset }: RemoveDuplicatesProps) {
  const [config, setConfig] = useState({
    columns: [] as string[],
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
                  Choose which columns to use when identifying duplicates. Leave empty to compare all columns.
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {/* Mock column list - in real implementation, this would come from dataset schema */}
                  {['id', 'name', 'email', 'age', 'city', 'country'].map((column) => (
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
                  ))}
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
                  ? config.columns.join(', ')
                  : 'All columns'
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
            <button
              onClick={() => {
                // Mock execution functionality
                const columnText = config.columns.length > 0 
                  ? `based on columns: ${config.columns.join(', ')}` 
                  : 'based on all columns';
                toast(`Duplicate removal executed ${columnText}`, { icon: '✅' });
                logger.info('Duplicate removal executed', { 
                  datasetId: dataset.id, 
                  config 
                });
              }}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Execute Duplicate Removal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
