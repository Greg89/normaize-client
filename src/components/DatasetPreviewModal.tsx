import { useState, useEffect, useCallback } from 'react';
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

  if (!isOpen || !dataset) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Data Preview: {dataset.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading preview data...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Error loading preview: {error}</p>
              <button
                onClick={loadPreviewData}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (!Array.isArray(previewData) || previewData.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500">No preview data available</p>
            </div>
          )}

          {!loading && !error && Array.isArray(previewData) && previewData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {getColumnHeaders().map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {getColumnHeaders().map((header, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          <div className="max-w-xs truncate" title={formatCellValue(row[header])}>
                            {formatCellValue(row[header])}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Showing {Array.isArray(previewData) ? previewData.length : 0} rows (preview)</span>
            <span>Total: {dataset.rowCount.toLocaleString()} rows</span>
          </div>
        </div>
      </div>
    </div>
  );
} 