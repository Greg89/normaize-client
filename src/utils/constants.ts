// Application-wide constants organized by category

// ============================================================================
// API Configuration
// ============================================================================
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  MAX_RETRY_DELAY: 30000, // 30 seconds
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 100,
} as const;

// ============================================================================
// File Upload Configuration
// ============================================================================
export const FILE_CONFIG = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_SIZE_MB: 50,
  ALLOWED_TYPES: [
    'text/csv',
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/plain',
    'application/pdf',
  ],
  ALLOWED_EXTENSIONS: ['.csv', '.json', '.xlsx', '.xls', '.txt', '.pdf'],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large file uploads
  UPLOAD_TIMEOUT: 300000, // 5 minutes
} as const;

// ============================================================================
// Analysis Types and Configuration
// ============================================================================
export const ANALYSIS_TYPES = {
  DESCRIPTIVE: 'descriptive',
  CORRELATION: 'correlation',
  REGRESSION: 'regression',
  CLUSTERING: 'clustering',
  CLASSIFICATION: 'classification',
  TIME_SERIES: 'time_series',
  HYPOTHESIS_TESTING: 'hypothesis_testing',
} as const;

export const ANALYSIS_CONFIG = {
  MAX_DATASET_SIZE: 1000000, // 1M rows
  MAX_COLUMNS: 1000,
  TIMEOUT: 300000, // 5 minutes
  CACHE_DURATION: 3600000, // 1 hour
} as const;

// ============================================================================
// Status Types and States
// ============================================================================
export const STATUS_TYPES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PAUSED: 'paused',
  QUEUED: 'queued',
} as const;

export const STATUS_COLORS = {
  [STATUS_TYPES.PENDING]: '#f59e0b', // amber
  [STATUS_TYPES.RUNNING]: '#3b82f6', // blue
  [STATUS_TYPES.COMPLETED]: '#10b981', // green
  [STATUS_TYPES.FAILED]: '#ef4444', // red
  [STATUS_TYPES.CANCELLED]: '#6b7280', // gray
  [STATUS_TYPES.PAUSED]: '#f97316', // orange
  [STATUS_TYPES.QUEUED]: '#8b5cf6', // violet
} as const;

// ============================================================================
// Application Configuration
// ============================================================================
export const APP_CONFIG = {
  NAME: 'Normaize',
  DESCRIPTION: 'Data Toolbox',
  VERSION: '1.0.0',
  AUTHOR: 'Normaize Team',
  WEBSITE: 'https://normaize.com',
  SUPPORT_EMAIL: 'support@normaize.com',
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

// ============================================================================
// UI Configuration
// ============================================================================
export const UI_CONFIG = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 1000,
  
  // Debounce delays
  SEARCH_DEBOUNCE: 300,
  INPUT_DEBOUNCE: 500,
  RESIZE_DEBOUNCE: 250,
  
  // Animation durations
  TRANSITION_DURATION: 200,
  LOADING_DELAY: 500,
  
  // Toast durations
  TOAST_DURATION: 4000,
  ERROR_TOAST_DURATION: 8000,
  
  // Modal sizes
  MODAL_SIZES: {
    SMALL: 'sm',
    MEDIUM: 'md',
    LARGE: 'lg',
    EXTRA_LARGE: 'xl',
  },
} as const;

// ============================================================================
// Validation Rules
// ============================================================================
export const VALIDATION_RULES = {
  // User input
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 254,
  
  // Dataset
  MIN_DATASET_NAME_LENGTH: 1,
  MAX_DATASET_NAME_LENGTH: 100,
  MIN_DATASET_DESCRIPTION_LENGTH: 0,
  MAX_DATASET_DESCRIPTION_LENGTH: 1000,
  
  // Analysis
  MIN_ANALYSIS_NAME_LENGTH: 1,
  MAX_ANALYSIS_NAME_LENGTH: 100,
  MIN_ANALYSIS_DESCRIPTION_LENGTH: 0,
  MAX_ANALYSIS_DESCRIPTION_LENGTH: 2000,
} as const;

// ============================================================================
// Error Messages
// ============================================================================
export const ERROR_MESSAGES = {
  // General
  UNKNOWN_ERROR: 'An unexpected error occurred',
  NETWORK_ERROR: 'Network error. Please check your connection',
  TIMEOUT_ERROR: 'Request timed out. Please try again',
  VALIDATION_ERROR: 'Please check your input and try again',
  
  // Authentication
  AUTH_REQUIRED: 'Please log in to continue',
  AUTH_FAILED: 'Authentication failed. Please try again',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  
  // File operations
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  INVALID_FILE_TYPE: 'File type not supported',
  UPLOAD_FAILED: 'File upload failed. Please try again',
  
  // Data operations
  DATASET_NOT_FOUND: 'Dataset not found',
  ANALYSIS_FAILED: 'Analysis failed. Please try again',
  INSUFFICIENT_PERMISSIONS: 'You don\'t have permission to perform this action',
} as const;

// ============================================================================
// Local Storage Keys
// ============================================================================
export const STORAGE_KEYS = {
  // User preferences
  USER_PREFERENCES: 'normaize_user_preferences',
  THEME: 'normaize_theme',
  LANGUAGE: 'normaize_language',
  
  // Application state
  AUTH_TOKEN: 'normaize_auth_token',
  REFRESH_TOKEN: 'normaize_refresh_token',
  USER_ID: 'normaize_user_id',
  
  // UI state
  SIDEBAR_COLLAPSED: 'normaize_sidebar_collapsed',
  TABLE_COLUMNS: 'normaize_table_columns',
  CHART_SETTINGS: 'normaize_chart_settings',
  
  // Cache
  API_CACHE: 'normaize_api_cache',
  USER_DATA_CACHE: 'normaize_user_data_cache',
} as const;

// ============================================================================
// Feature Flags
// ============================================================================
export const FEATURE_FLAGS = {
  // Core features
  ADVANCED_ANALYSIS: true,
  REAL_TIME_COLLABORATION: false,
  API_INTEGRATIONS: true,
  
  // UI features
  DARK_MODE: true,
  CUSTOM_THEMES: false,
  KEYBOARD_SHORTCUTS: true,
  
  // Performance features
  LAZY_LOADING: true,
  VIRTUAL_SCROLLING: false,
  SERVICE_WORKER: false,
} as const;

// ============================================================================
// Performance Thresholds
// ============================================================================
export const PERFORMANCE_THRESHOLDS = {
  // Page load
  TARGET_PAGE_LOAD: 2000, // 2 seconds
  ACCEPTABLE_PAGE_LOAD: 4000, // 4 seconds
  
  // API calls
  TARGET_API_RESPONSE: 500, // 500ms
  ACCEPTABLE_API_RESPONSE: 2000, // 2 seconds
  
  // File operations
  TARGET_FILE_UPLOAD: 5000, // 5 seconds
  ACCEPTABLE_FILE_UPLOAD: 15000, // 15 seconds
  
  // Analysis
  TARGET_ANALYSIS_TIME: 10000, // 10 seconds
  ACCEPTABLE_ANALYSIS_TIME: 30000, // 30 seconds
} as const;

// ============================================================================
// Export all constants for convenience
// ============================================================================
export const CONSTANTS = {
  API_CONFIG,
  FILE_CONFIG,
  ANALYSIS_TYPES,
  ANALYSIS_CONFIG,
  STATUS_TYPES,
  STATUS_COLORS,
  APP_CONFIG,
  UI_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  STORAGE_KEYS,
  FEATURE_FLAGS,
  PERFORMANCE_THRESHOLDS,
} as const; 