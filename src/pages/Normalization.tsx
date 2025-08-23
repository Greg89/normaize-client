import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useDataSets } from '../hooks/useApi';
import { DataSet } from '../types';
import { logger } from '../utils/logger';
import { formatFileSize } from '../utils/format';
import { RemoveDuplicates, ComingSoonTool } from '../components/normalization';
import { 
  CogIcon, 
  DocumentTextIcon, 
  BeakerIcon,
  ChartBarIcon,
  CheckCircleIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  WrenchScrewdriverIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export default function Normalization() {
  const { data: datasets, loading, error, refetch } = useDataSets(false); // Only get active datasets
  const [selectedDataset, setSelectedDataset] = useState<DataSet | null>(null);
  const [activeStep, setActiveStep] = useState<'select' | 'workflow'>('select');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['data-cleaning']));
  const workflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (datasets && datasets.length > 0 && !selectedDataset) {
      // Auto-select the first processed dataset if available
      const processedDataset = datasets.find(ds => ds.isProcessed && !ds.isDeleted);
      if (processedDataset) {
        setSelectedDataset(processedDataset);
      }
    }
  }, [datasets, selectedDataset]);

  const handleDatasetSelect = (dataset: DataSet) => {
    setSelectedDataset(dataset);
    setActiveStep('workflow');
    logger.info('Dataset selected for normalization', { datasetId: dataset.id, name: dataset.name });
    
    // Scroll to workflow section after a short delay to allow rendering
    setTimeout(() => {
      workflowRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const normalizationTools = [
    {
      category: 'data-cleaning',
      categoryName: 'Data Cleaning',
      categoryIcon: BeakerIcon,
      tools: [
        {
          id: 'remove-duplicates',
          name: 'Remove Duplicates',
          description: 'Identify and remove duplicate rows based on selected columns',
          icon: TrashIcon
        },
        {
          id: 'handle-missing',
          name: 'Handle Missing Values',
          description: 'Fill, remove, or interpolate missing data points',
          icon: WrenchScrewdriverIcon,
          comingSoon: true
        },
        {
          id: 'standardize-formats',
          name: 'Standardize Formats',
          description: 'Normalize date formats, text casing, and number formats',
          icon: AdjustmentsHorizontalIcon,
          comingSoon: true
        }
      ]
    },
    {
      category: 'data-normalization',
      categoryName: 'Data Normalization',
      categoryIcon: CogIcon,
      tools: [
        {
          id: 'scale-features',
          name: 'Scale Features',
          description: 'Normalize numerical values using min-max, z-score, or robust scaling',
          icon: AdjustmentsHorizontalIcon,
          comingSoon: true
        },
        {
          id: 'encode-categorical',
          name: 'Encode Categorical',
          description: 'Convert categorical variables to numerical representations',
          icon: CogIcon,
          comingSoon: true
        }
      ]
    },
    {
      category: 'data-enhancement',
      categoryName: 'Data Enhancement',
      categoryIcon: ChartBarIcon,
      tools: [
        {
          id: 'create-features',
          name: 'Create Features',
          description: 'Generate new columns based on existing data patterns',
          icon: ChartBarIcon,
          comingSoon: true
        },
        {
          id: 'aggregate-data',
          name: 'Aggregate Data',
          description: 'Group and summarize data by specific criteria',
          icon: ChartBarIcon,
          comingSoon: true
        }
      ]
    },
    {
      category: 'data-validation',
      categoryName: 'Data Validation',
      categoryIcon: CheckCircleIcon,
      tools: [
        {
          id: 'quality-check',
          name: 'Quality Check',
          description: 'Analyze data quality metrics and identify issues',
          icon: CheckCircleIcon,
          comingSoon: true
        },
        {
          id: 'constraint-validation',
          name: 'Constraint Validation',
          description: 'Verify data meets specified business rules and constraints',
          icon: CheckCircleIcon,
          comingSoon: true
        }
      ]
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    logger.info('Tool selected', { toolId, datasetId: selectedDataset?.id });
  };

  const renderToolSidebar = () => (
    <div className="w-80 bg-white border-r border-gray-200 h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">Normalization Tools</h3>
          <button
            onClick={() => {
              setActiveStep('select');
              setSelectedDataset(null);
              setSelectedTool(null);
            }}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Change Dataset
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Dataset: <span className="font-medium">{selectedDataset?.name}</span>
        </p>
        <div className="text-xs text-gray-500 mt-1">
          {selectedDataset?.rowCount.toLocaleString()} rows • {selectedDataset?.columnCount} columns
        </div>
      </div>

      <div className="p-4 space-y-2">
        {normalizationTools.map((category) => (
          <div key={category.category} className="space-y-1">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.category)}
              className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
            >
              <div className="flex items-center space-x-2">
                <category.categoryIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">{category.categoryName}</span>
              </div>
              {expandedCategories.has(category.category) ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {/* Category Tools */}
            {expandedCategories.has(category.category) && (
              <div className="ml-6 space-y-1">
                {category.tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      if (!tool.comingSoon) {
                        handleToolSelect(tool.id);
                      } else {
                        toast(`${tool.name} coming soon!`, { icon: 'ℹ️' });
                      }
                    }}
                    className={`w-full flex items-center space-x-2 p-2 text-left rounded-md transition-colors ${
                      selectedTool === tool.id
                        ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                        : tool.comingSoon
                        ? 'opacity-60 cursor-not-allowed hover:bg-gray-25'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    disabled={tool.comingSoon}
                  >
                    <tool.icon className={`h-4 w-4 ${
                      selectedTool === tool.id ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{tool.name}</span>
                        {tool.comingSoon && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (!selectedTool || !selectedDataset) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <BeakerIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Tool</h3>
            <p className="text-gray-600">
              Choose a normalization tool from the sidebar to get started with transforming your data.
            </p>
          </div>
        </div>
      );
    }

    // Dynamic component loading based on selected tool
    const renderToolComponent = () => {
      switch (selectedTool) {
        case 'remove-duplicates':
          return <RemoveDuplicates dataset={selectedDataset} />;
        case 'handle-missing':
          return <ComingSoonTool dataset={selectedDataset} toolName="Handle Missing Values" />;
        case 'standardize-formats':
          return <ComingSoonTool dataset={selectedDataset} toolName="Standardize Formats" />;
        case 'scale-features':
          return <ComingSoonTool dataset={selectedDataset} toolName="Scale Features" />;
        case 'encode-categorical':
          return <ComingSoonTool dataset={selectedDataset} toolName="Encode Categorical" />;
        case 'create-features':
          return <ComingSoonTool dataset={selectedDataset} toolName="Create Features" />;
        case 'aggregate-data':
          return <ComingSoonTool dataset={selectedDataset} toolName="Aggregate Data" />;
        case 'quality-check':
          return <ComingSoonTool dataset={selectedDataset} toolName="Quality Check" />;
        case 'constraint-validation':
          return <ComingSoonTool dataset={selectedDataset} toolName="Constraint Validation" />;
        default:
          return <ComingSoonTool dataset={selectedDataset} toolName="Unknown Tool" />;
      }
    };

    return (
      <div className="flex-1 p-8 bg-gray-50">
        {renderToolComponent()}
      </div>
    );
  };

  const renderWorkflowInterface = () => (
    <div ref={workflowRef} className="flex h-full min-h-[600px]">
      {renderToolSidebar()}
      {renderMainContent()}
    </div>
  );

  const renderDatasetSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Dataset for Normalization</h2>
        <p className="text-gray-600">Choose an active dataset to begin the transformation and enhancement process</p>
      </div>

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
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No active datasets available</p>
          <p className="text-gray-400 text-sm mt-1">
            Please upload and process a dataset first in the Datasets section.
          </p>
        </div>
      )}

      {!loading && !error && datasets && datasets.length > 0 && (
        <div className="grid gap-4 max-w-4xl mx-auto">
          {datasets
            .filter(dataset => !dataset.isDeleted)
            .map((dataset: DataSet) => (
            <div
              key={dataset.id}
              onClick={() => handleDatasetSelect(dataset)}
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
                    <span>Uploaded: {new Date(dataset.uploadedAt).toLocaleDateString()}</span>
                    <span>Size: {formatFileSize(dataset.fileSize)}</span>
                    <span>Rows: {dataset.rowCount.toLocaleString()}</span>
                    <span>Columns: {dataset.columnCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );





  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Normalization</h1>
          <p className="text-gray-600">Transform and enhance your datasets before analysis</p>
        </div>
      </div>

      <div className="card">
        {activeStep === 'select' && renderDatasetSelection()}
        {activeStep === 'workflow' && renderWorkflowInterface()}
      </div>
    </div>
  );
}
