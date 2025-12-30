import { CogIcon } from '@heroicons/react/24/outline';
import { DataSet } from '../../types';

interface ComingSoonToolProps {
  dataset: DataSet;
  toolName: string;
}

export default function ComingSoonTool({ dataset, toolName }: ComingSoonToolProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <CogIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{toolName} Coming Soon</h3>
        <p className="text-gray-600 mb-4">
          This tool is currently under development and will be available soon.
        </p>
        <div className="text-sm text-gray-500">
          Selected Dataset: <span className="font-medium">{dataset.name}</span>
        </div>
      </div>
    </div>
  );
}
