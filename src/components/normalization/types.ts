import { DataSet } from '../../types';

// Base interface that all normalization tools should implement
export interface NormalizationToolProps {
  dataset: DataSet;
}

// Tool metadata for the sidebar
export interface NormalizationTool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  comingSoon?: boolean;
}

// Category structure for organizing tools
export interface NormalizationCategory {
  category: string;
  categoryName: string;
  categoryIcon: React.ComponentType<{ className?: string }>;
  tools: NormalizationTool[];
}
