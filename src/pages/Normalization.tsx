import { useRef } from 'react';
import { useDataSets } from '../hooks/useApi';
import { DataSet } from '../types';
import { logger } from '../utils/logger';
import { RemoveDuplicates, ComingSoonTool } from '../components/normalization';
import NormalizationDatasetSelector from '../components/normalization/NormalizationDatasetSelector';
import NormalizationToolsSidebar from '../components/normalization/NormalizationToolsSidebar';
import { BeakerIcon } from '@heroicons/react/24/outline';
import { useDatasetStore, useNormalizationStore } from '../stores';

export default function Normalization() {
  const { data: datasets, loading, error, refetch } = useDataSets(false);
  const workflowRef = useRef<HTMLDivElement>(null);

  // Dataset selection is shared with the DataSets page — if the user
  // selected a dataset there, it is already populated here.
  const { selectedDataset, selectDataset } = useDatasetStore();

  // Normalization workflow state persists across navigation — navigating
  // away and back restores the user’s tool selection and step.
  const {
    activeStep,
    selectedTool,
    expandedCategories,
    setActiveStep,
    selectTool,
    toggleCategory,
    resetWorkflow,
  } = useNormalizationStore();

  const handleDatasetSelect = (dataset: DataSet) => {
    selectDataset(dataset);
    setActiveStep('workflow');
    logger.info('Dataset selected for normalization', { datasetId: dataset.id, name: dataset.name });
    setTimeout(() => {
      workflowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleChangeDataset = () => {
    resetWorkflow();
    selectDataset(null);
  };

  const handleToggleCategory = (categoryId: string) => toggleCategory(categoryId);

  const handleToolSelect = (toolId: string) => {
    selectTool(toolId);
    logger.info('Tool selected', { toolId, datasetId: selectedDataset?.id });
  };

  const renderToolContent = () => {
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

    const toolComponents: Record<string, React.ReactNode> = {
      'remove-duplicates': <RemoveDuplicates dataset={selectedDataset} />,
      'handle-missing': <ComingSoonTool dataset={selectedDataset} toolName="Handle Missing Values" />,
      'standardize-formats': <ComingSoonTool dataset={selectedDataset} toolName="Standardize Formats" />,
      'scale-features': <ComingSoonTool dataset={selectedDataset} toolName="Scale Features" />,
      'encode-categorical': <ComingSoonTool dataset={selectedDataset} toolName="Encode Categorical" />,
      'create-features': <ComingSoonTool dataset={selectedDataset} toolName="Create Features" />,
      'aggregate-data': <ComingSoonTool dataset={selectedDataset} toolName="Aggregate Data" />,
      'quality-check': <ComingSoonTool dataset={selectedDataset} toolName="Quality Check" />,
      'constraint-validation': <ComingSoonTool dataset={selectedDataset} toolName="Constraint Validation" />,
    };

    return (
      <div className="flex-1 p-8 bg-gray-50">
        {toolComponents[selectedTool] ?? <ComingSoonTool dataset={selectedDataset} toolName="Unknown Tool" />}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Normalization</h1>
          <p className="text-gray-600">Transform and enhance your datasets before analysis</p>
        </div>
      </div>

      <div className="card">
        {activeStep === 'select' && (
          <NormalizationDatasetSelector
            datasets={datasets}
            loading={loading}
            error={error}
            refetch={refetch}
            onSelect={handleDatasetSelect}
          />
        )}
        {activeStep === 'workflow' && selectedDataset && (
          <div ref={workflowRef} className="flex h-full min-h-[600px]">
            <NormalizationToolsSidebar
              selectedDataset={selectedDataset}
              selectedTool={selectedTool}
              expandedCategories={expandedCategories}
              onToggleCategory={handleToggleCategory}
              onToolSelect={handleToolSelect}
              onChangeDataset={handleChangeDataset}
            />
            {renderToolContent()}
          </div>
        )}
      </div>
    </div>
  );
}
