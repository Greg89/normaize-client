import {
  CogIcon,
  BeakerIcon,
  ChartBarIcon,
  CheckCircleIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

export const NORMALIZATION_TOOLS = [
  {
    category: 'data-cleaning',
    categoryName: 'Data Cleaning',
    categoryIcon: BeakerIcon,
    tools: [
      {
        id: 'remove-duplicates',
        name: 'Remove Duplicates',
        description: 'Identify and remove duplicate rows based on selected columns',
        icon: TrashIcon,
      },
      {
        id: 'handle-missing',
        name: 'Handle Missing Values',
        description: 'Fill, remove, or interpolate missing data points',
        icon: WrenchScrewdriverIcon,
        comingSoon: true,
      },
      {
        id: 'standardize-formats',
        name: 'Standardize Formats',
        description: 'Normalize date formats, text casing, and number formats',
        icon: AdjustmentsHorizontalIcon,
        comingSoon: true,
      },
    ],
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
        comingSoon: true,
      },
      {
        id: 'encode-categorical',
        name: 'Encode Categorical',
        description: 'Convert categorical variables to numerical representations',
        icon: CogIcon,
        comingSoon: true,
      },
    ],
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
        comingSoon: true,
      },
      {
        id: 'aggregate-data',
        name: 'Aggregate Data',
        description: 'Group and summarize data by specific criteria',
        icon: ChartBarIcon,
        comingSoon: true,
      },
    ],
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
        comingSoon: true,
      },
      {
        id: 'constraint-validation',
        name: 'Constraint Validation',
        description: 'Verify data meets specified business rules and constraints',
        icon: CheckCircleIcon,
        comingSoon: true,
      },
    ],
  },
];
