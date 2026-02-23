import { toast } from 'react-hot-toast';
import {
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { DataSet } from '../../types';
import { getRowCount, getColumnCount } from '../../utils/datasetHelpers';
import { NORMALIZATION_TOOLS } from './normalizationToolsData';

interface NormalizationToolsSidebarProps {
  selectedDataset: DataSet;
  selectedTool: string | null;
  expandedCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  onToolSelect: (toolId: string) => void;
  onChangeDataset: () => void;
}

export default function NormalizationToolsSidebar({
  selectedDataset,
  selectedTool,
  expandedCategories,
  onToggleCategory,
  onToolSelect,
  onChangeDataset,
}: NormalizationToolsSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">Normalization Tools</h3>
          <button
            onClick={onChangeDataset}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Change Dataset
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Dataset: <span className="font-medium">{selectedDataset.name}</span>
        </p>
        <div className="text-xs text-gray-500 mt-1">
          {getRowCount(selectedDataset).toLocaleString()} rows • {getColumnCount(selectedDataset)} columns
        </div>
      </div>

      <div className="p-4 space-y-2">
        {NORMALIZATION_TOOLS.map((category) => (
          <div key={category.category} className="space-y-1">
            <button
              onClick={() => onToggleCategory(category.category)}
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

            {expandedCategories.has(category.category) && (
              <div className="ml-6 space-y-1">
                {category.tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      if (!tool.comingSoon) {
                        onToolSelect(tool.id);
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
}
