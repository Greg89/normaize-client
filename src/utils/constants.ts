// API Configuration
export const API_CONFIG = {
  BASE_URL: (() => {
    const isDev = import.meta.env.DEV;
    const apiUrl = import.meta.env.VITE_API_URL;
    const fallback = 'http://localhost:5000';
    
    // Debug logging for beta environment
    if (!isDev) {
      // eslint-disable-next-line no-console
      console.log('🔧 API Config Debug:', {
        isDev,
        apiUrl,
        fallback,
        finalUrl: isDev ? '' : (apiUrl || fallback),
        hostname: window.location.hostname,
        origin: window.location.origin
      });
    }
    
    return isDev ? '' : (apiUrl || fallback);
  })(),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: [
    'text/csv',
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ],
  ALLOWED_EXTENSIONS: ['.csv', '.json', '.xlsx', '.xls'],
} as const;

// Analysis Types
export const ANALYSIS_TYPES = {
  DESCRIPTIVE: 'descriptive',
  CORRELATION: 'correlation',
  REGRESSION: 'regression',
  CLUSTERING: 'clustering',
} as const;

// Status Types
export const STATUS_TYPES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Navigation Configuration
export const APP_CONFIG = {
  NAME: 'Normaize',
  DESCRIPTION: 'Data Toolbox',
  VERSION: '1.0.0',
} as const; 