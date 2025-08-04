import { useState, useEffect, useCallback, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { DataSet } from '../types';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';

interface PreviewRow {
  [key: string]: string | number | boolean | null;
}

interface DatasetPreviewModalProps {
  dataset: DataSet | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DatasetPreviewModal({
  dataset,
  isOpen,
  onClose
}: DatasetPreviewModalProps) {
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreviewData = useCallback(async () => {
    if (!dataset) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getDataSetPreview(dataset.id);
      
      // Handle the API response format
      let data: PreviewRow[] = [];
      let columns: string[] = [];
      
      // Direct format: { columns: [...], rows: [...] }
      if (response && typeof response === 'object' && 'rows' in response && 'columns' in response) {
        data = Array.isArray(response.rows) ? response.rows : [];
        columns = Array.isArray(response.columns) ? response.columns : [];
      }
      // Wrapped format: { data: { columns: [...], rows: [...] } }
      else if (response && typeof response === 'object' && 'data' in response) {
        const responseData = response.data;
        
        if (responseData && typeof responseData === 'object' && 'rows' in responseData && 'columns' in responseData) {
          data = Array.isArray(responseData.rows) ? responseData.rows : [];
          columns = Array.isArray(responseData.columns) ? responseData.columns : [];
        }
        // Legacy format: direct array
        else if (Array.isArray(responseData)) {
          data = responseData;
        }
        // Legacy format: JSON string
        else if (typeof responseData === 'string') {
          try {
            data = JSON.parse(responseData);
          } catch (parseError) {
            logger.error('Failed to parse preview data JSON', { parseError, data: responseData });
            data = [];
          }
        }
      } else if (Array.isArray(response)) {
        data = response;
      }
      
      // Store columns for use in rendering
      setPreviewColumns(columns);
      setPreviewData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preview data';
      setError(errorMessage);
      logger.error('Failed to load dataset preview', { error: err, datasetId: dataset.id });
    } finally {
      setLoading(false);
    }
  }, [dataset]);

  useEffect(() => {
    if (isOpen && dataset) {
      loadPreviewData();
    }
  }, [isOpen, dataset, loadPreviewData]);

  const getColumnHeaders = () => {
    // Use the columns from the API response if available
    if (previewColumns.length > 0) {
      return previewColumns;
    }
    // Fallback to extracting from data
    if (!Array.isArray(previewData) || previewData.length === 0) return [];
    return Object.keys(previewData[0]);
  };

  const formatCellValue = (value: string | number | boolean | null): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-lg font-semibold text-white">
                          Dataset Preview
                        </Dialog.Title>
                        <p className="text-blue-100 text-sm">
                          {dataset?.name}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-md bg-blue-600 text-blue-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 flex-1 overflow-y-auto">
                  {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600 text-lg font-medium">Loading preview data...</p>
                      <p className="text-gray-500 text-sm mt-1">Please wait while we fetch your data</p>
                    </div>
                  )}

                  {error && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Preview</h3>
                      <p className="text-gray-600 text-center mb-6 max-w-md">
                        {error}
                      </p>
                      <button
                        onClick={loadPreviewData}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!loading && !error && (!Array.isArray(previewData) || previewData.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Preview Data</h3>
                      <p className="text-gray-600 text-center">
                        No preview data is available for this dataset.
                      </p>
                    </div>
                  )}

                  {!loading && !error && Array.isArray(previewData) && previewData.length > 0 && (
                    <div className="space-y-4">
                      {/* Data Stats */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Preview Rows</p>
                            <p className="text-lg font-semibold text-gray-900">{previewData.length}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total Rows</p>
                            <p className="text-lg font-semibold text-gray-900">{dataset?.rowCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Columns</p>
                            <p className="text-lg font-semibold text-gray-900">{getColumnHeaders().length}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">File Type</p>
                            <p className="text-lg font-semibold text-gray-900">{dataset?.fileType}</p>
                          </div>
                        </div>
                      </div>

                      {/* Data Table */}
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
                              <tr>
                                {getColumnHeaders().map((header, index) => (
                                  <th
                                    key={index}
                                    className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-600">{header}</span>
                                      <div className="w-1 h-1 bg-blue-500 rounded-full opacity-60"></div>
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {previewData.map((row, rowIndex) => (
                                <tr 
                                  key={rowIndex} 
                                  className={`hover:bg-blue-50 transition-colors ${
                                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  }`}
                                >
                                  {getColumnHeaders().map((header, colIndex) => (
                                    <td
                                      key={colIndex}
                                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                      <div 
                                        className="max-w-xs truncate font-mono text-xs" 
                                        title={formatCellValue(row[header])}
                                      >
                                        {formatCellValue(row[header])}
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 