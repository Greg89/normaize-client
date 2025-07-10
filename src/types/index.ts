// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Upload Response Types
export interface DataSetUploadResponse {
  id: number;
  message: string;
  success: boolean;
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