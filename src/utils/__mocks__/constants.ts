// Mock constants for Jest tests - replaces import.meta.env with static values

// ============================================================================
// API Configuration
// ============================================================================
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
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
  BATCH_SIZE: 10000, // Process in batches of 10k rows
  CACHE_TTL: 300000, // 5 minutes
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
} as const;

// ============================================================================
// Status Types and Colors
// ============================================================================
export const STATUS_TYPES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  QUEUED: 'queued',
} as const;

export const STATUS_COLORS = {
  [STATUS_TYPES.PENDING]: '#FEF3C7', // yellow-100
  [STATUS_TYPES.PROCESSING]: '#DBEAFE', // blue-100
  [STATUS_TYPES.COMPLETED]: '#D1FAE5', // green-100
  [STATUS_TYPES.FAILED]: '#FEE2E2', // red-100
  [STATUS_TYPES.CANCELLED]: '#F3F4F6', // gray-100
  [STATUS_TYPES.QUEUED]: '#EDE9FE', // purple-100
} as const;

// ============================================================================
// Application Configuration
// ============================================================================
export const APP_CONFIG = {
  NAME: 'Normaize',
  VERSION: '1.0.0',
  DESCRIPTION: 'Advanced Data Normalization and Analysis Platform',
  SUPPORT_EMAIL: 'support@normaize.com',
  DOCS_URL: 'https://docs.normaize.com',
  GITHUB_URL: 'https://github.com/normaize/normaize',
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PASSWORD_LENGTH: 8,
  SESSION_TIMEOUT: 3600000, // 1 hour
  IDLE_TIMEOUT: 1800000, // 30 minutes
} as const;

// ============================================================================
// UI Configuration
// ============================================================================
export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    MAX_PAGE_SIZE: 1000,
  },
  DEBOUNCE: {
    SEARCH: 300,
    AUTO_SAVE: 1000,
    RESIZE: 250,
  },
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  TOAST: {
    SUCCESS_DURATION: 4000,
    ERROR_DURATION: 8000,
    WARNING_DURATION: 6000,
    INFO_DURATION: 4000,
  },
  MODAL: {
    SMALL: 'max-w-md',
    MEDIUM: 'max-w-2xl',
    LARGE: 'max-w-4xl',
    EXTRA_LARGE: 'max-w-6xl',
  },
} as const;

// ============================================================================
// Validation Rules
// ============================================================================
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 254,
  },
  DATASET: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
  },
  ANALYSIS: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
  },
} as const;

// ============================================================================
// Error Messages
// ============================================================================
export const ERROR_MESSAGES = {
  NETWORK: {
    CONNECTION_FAILED: 'Unable to connect to the server. Please check your internet connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNKNOWN: 'An unexpected error occurred. Please try again later.',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PASSWORD: 'Password must meet security requirements.',
    FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
    INVALID_FILE_TYPE: 'File type is not supported.',
  },
  AUTH: {
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    INVALID_CREDENTIALS: 'Invalid username or password.',
  },
  API: {
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.',
    RATE_LIMITED: 'Too many requests. Please wait before trying again.',
  },
} as const;

// ============================================================================
// Storage Keys
// ============================================================================
export const STORAGE_KEYS = {
  AUTH: {
    TOKEN: 'normaize_auth_token',
    USER: 'normaize_user',
    REFRESH_TOKEN: 'normaize_refresh_token',
  },
  UI: {
    THEME: 'normaize_theme',
    SIDEBAR_COLLAPSED: 'normaize_sidebar_collapsed',
    LANGUAGE: 'normaize_language',
    PAGINATION_SIZE: 'normaize_pagination_size',
  },
  CACHE: {
    DATASETS: 'normaize_cache_datasets',
    ANALYSES: 'normaize_cache_analyses',
    USER_PROFILE: 'normaize_cache_user_profile',
  },
} as const;

// ============================================================================
// Feature Flags
// ============================================================================
export const FEATURE_FLAGS = {
  ADVANCED_ANALYTICS: true,
  REAL_TIME_COLLABORATION: false,
  EXPORT_TO_CLOUD: true,
  ML_PREDICTIONS: false,
  CUSTOM_VISUALIZATIONS: true,
  API_ACCESS: true,
  BULK_OPERATIONS: true,
  AUDIT_LOGS: true,
  ADVANCED_PERMISSIONS: false,
  DARK_MODE: true,
} as const;

// ============================================================================
// Performance Thresholds
// ============================================================================
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME: {
    GOOD: 200, // ms
    ACCEPTABLE: 1000, // ms
    POOR: 3000, // ms
  },
  FILE_UPLOAD: {
    GOOD: 5000, // ms for 1MB
    ACCEPTABLE: 15000, // ms for 1MB
    POOR: 30000, // ms for 1MB
  },
  PAGE_LOAD: {
    GOOD: 1000, // ms
    ACCEPTABLE: 3000, // ms
    POOR: 5000, // ms
  },
  MEMORY_USAGE: {
    WARNING: 100 * 1024 * 1024, // 100MB
    CRITICAL: 250 * 1024 * 1024, // 250MB
  },
} as const;

// ============================================================================
// Export all constants
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

// Type exports for TypeScript
export type AnalysisType = typeof ANALYSIS_TYPES[keyof typeof ANALYSIS_TYPES];
export type StatusType = typeof STATUS_TYPES[keyof typeof STATUS_TYPES];
