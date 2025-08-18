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