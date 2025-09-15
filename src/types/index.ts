// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp?: string;
  errors?: string[];
}

// Paginated Response Types
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Upload Response Types
export interface DataSetUploadResponse {
  id: number;
  message: string;
  success: boolean;
  dataSetId?: number; // For backward compatibility
}

// User Profile Types - matching server DTOs (camelCase for JSON)
export interface UserProfileDto {
  userId: string;
  email: string;
  name: string;
  picture?: string; 
  emailVerified: boolean;
  settings: UserSettingsDto;
}

export interface UserSettingsDto {
  id: number;
  userId: string;
  
  // Notification Settings
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  processingCompleteNotifications: boolean;
  errorNotifications: boolean;
  weeklyDigestEnabled: boolean;
  
  // UI/UX Preferences
  theme: string;
  language: string;
  defaultPageSize: number;
  showTutorials: boolean;
  compactMode: boolean;
  
  // Data Processing Preferences
  autoProcessUploads: boolean;
  maxPreviewRows: number;
  defaultFileType: string;
  enableDataValidation: boolean;
  enableSchemaInference: boolean;
  
  // Privacy Settings
  shareAnalytics: boolean;
  allowDataUsageForImprovement: boolean;
  showProcessingTime: boolean;
  
  // Account Information (non-sensitive)
  displayName?: string;
  timeZone?: string;
  dateFormat?: string;
  timeFormat?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Legacy types for backward compatibility (can be removed later)
export interface UserProfile {
  id: string;
  auth0Id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    updates: boolean;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

// DataSet Types
export interface DataSet {
  id: number;
  name: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  rowCount: number;
  columnCount: number;
  isProcessed: boolean;
  isDeleted?: boolean;
  retentionExpiryDate?: string; // ISO date string for when the dataset will be automatically deleted
  schema?: string; // JSON string containing column names array
  previewData?: string; // JSON string containing preview data with columns array
}

// Analysis Types
export interface Analysis {
  id: number;
  name: string;
  description?: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  dataSetId: number;
  results?: unknown;
}

// Dashboard Types
export interface DashboardStats {
  totalDatasets: number;
  totalAnalyses: number;
  totalVisualizations: number;
  recentUploads: number;
}

// Navigation Types
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
} 

// Dataset Reset Types
export enum ResetType {
  RESTORE = 'RESTORE',
  REPROCESS = 'REPROCESS'
}

export interface DataSetResetDto {
  resetType: ResetType;
  reason?: string;
}

// Remove Duplicates Request DTO
export interface RemoveDuplicateRowsRequest {
  columnNames: string[];
  keepFirstOccurrence: boolean;
  caseSensitive: boolean;
}

// Normalization Job Status Enum - matches server-side enum
export enum NormalizationJobStatus {
  QUEUED = 'Queued',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled'
}

// Normalization Job Response DTO
export interface NormalizationJobResponse {
  jobId: string;
  status: NormalizationJobStatus;
  message: string;
  submittedAt: string; // ISO date string
  estimatedCompletionAt?: string; // ISO date string
  progressPercentage: number;
  success: boolean;
}

// Job tracking interface for client-side state management
export interface JobTracker {
  jobId: string;
  type: 'REMOVE_DUPLICATES' | 'NORMALIZE_DATA' | 'TRANSFORM_DATA';
  datasetId: number;
  datasetName: string;
  status: NormalizationJobStatus;
  message: string;
  submittedAt: Date;
  estimatedCompletionAt?: Date | undefined;
  progressPercentage: number;
  lastUpdated: Date;
  config?: Record<string, unknown> | undefined; // Store job configuration for reference
}

// Job status utility constants
export const JOB_STATUS_GROUPS = {
  ACTIVE: [NormalizationJobStatus.QUEUED, NormalizationJobStatus.PROCESSING],
  COMPLETED: [NormalizationJobStatus.COMPLETED, NormalizationJobStatus.FAILED, NormalizationJobStatus.CANCELLED],
  SUCCESSFUL: [NormalizationJobStatus.COMPLETED],
  FAILED: [NormalizationJobStatus.FAILED, NormalizationJobStatus.CANCELLED]
} as const;

// Job status utility functions
export const JobStatusUtils = {
  isActive: (status: NormalizationJobStatus): boolean => 
    (JOB_STATUS_GROUPS.ACTIVE as readonly NormalizationJobStatus[]).includes(status),
  
  isCompleted: (status: NormalizationJobStatus): boolean => 
    (JOB_STATUS_GROUPS.COMPLETED as readonly NormalizationJobStatus[]).includes(status),
  
  isSuccessful: (status: NormalizationJobStatus): boolean => 
    (JOB_STATUS_GROUPS.SUCCESSFUL as readonly NormalizationJobStatus[]).includes(status),
  
  isFailed: (status: NormalizationJobStatus): boolean => 
    (JOB_STATUS_GROUPS.FAILED as readonly NormalizationJobStatus[]).includes(status),
  
  getDisplayName: (status: NormalizationJobStatus): string => {
    switch (status) {
      case NormalizationJobStatus.QUEUED:
        return 'Queued';
      case NormalizationJobStatus.PROCESSING:
        return 'Processing';
      case NormalizationJobStatus.COMPLETED:
        return 'Completed';
      case NormalizationJobStatus.FAILED:
        return 'Failed';
      case NormalizationJobStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  },
  
  getStatusColor: (status: NormalizationJobStatus): string => {
    switch (status) {
      case NormalizationJobStatus.QUEUED:
        return 'text-yellow-600 bg-yellow-50';
      case NormalizationJobStatus.PROCESSING:
        return 'text-blue-600 bg-blue-50';
      case NormalizationJobStatus.COMPLETED:
        return 'text-green-600 bg-green-50';
      case NormalizationJobStatus.FAILED:
        return 'text-red-600 bg-red-50';
      case NormalizationJobStatus.CANCELLED:
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }
} as const;  