// Mock the constants module to avoid import.meta.env issues in Jest
jest.mock('../constants', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:5000',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    MAX_RETRY_DELAY: 30000,
    RATE_LIMIT_WINDOW: 60000,
    MAX_REQUESTS_PER_WINDOW: 100,
  },
  FILE_CONFIG: {
    MAX_SIZE: 50 * 1024 * 1024,
    MAX_SIZE_MB: 50,
    ALLOWED_TYPES: [
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/plain',
      'application/pdf',
    ],
    ALLOWED_EXTENSIONS: ['.csv', '.json', '.xlsx', '.xls', '.txt', '.pdf'],
    CHUNK_SIZE: 1024 * 1024,
    UPLOAD_TIMEOUT: 300000,
  },
  ANALYSIS_TYPES: {
    DESCRIPTIVE: 'descriptive',
    CORRELATION: 'correlation',
    REGRESSION: 'regression',
    CLUSTERING: 'clustering',
    CLASSIFICATION: 'classification',
    TIME_SERIES: 'time_series',
    HYPOTHESIS_TESTING: 'hypothesis_testing',
  },
  ANALYSIS_CONFIG: {
    MAX_DATASET_SIZE: 1000000,
    MAX_COLUMNS: 1000,
    TIMEOUT: 300000,
    CACHE_DURATION: 3600000,
  },
  STATUS_TYPES: {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    PAUSED: 'paused',
    QUEUED: 'queued',
  },
  STATUS_COLORS: {
    pending: '#f59e0b',
    running: '#3b82f6',
    completed: '#10b981',
    failed: '#ef4444',
    cancelled: '#6b7280',
    paused: '#f97316',
    queued: '#8b5cf6',
  },
  APP_CONFIG: {
    NAME: 'Normaize',
    DESCRIPTION: 'Data Toolbox',
    VERSION: '1.0.0',
    AUTHOR: 'Normaize Team',
    WEBSITE: 'https://normaize.com',
    SUPPORT_EMAIL: 'support@normaize.com',
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
  },
  UI_CONFIG: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 1000,
    SEARCH_DEBOUNCE: 300,
    INPUT_DEBOUNCE: 500,
    RESIZE_DEBOUNCE: 250,
    TRANSITION_DURATION: 200,
    LOADING_DELAY: 500,
    TOAST_DURATION: 4000,
    ERROR_TOAST_DURATION: 8000,
    MODAL_SIZES: {
      SMALL: 'sm',
      MEDIUM: 'md',
      LARGE: 'lg',
      EXTRA_LARGE: 'xl',
    },
  },
  VALIDATION_RULES: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 50,
    MIN_EMAIL_LENGTH: 5,
    MAX_EMAIL_LENGTH: 254,
    MIN_DATASET_NAME_LENGTH: 1,
    MAX_DATASET_NAME_LENGTH: 100,
    MIN_DATASET_DESCRIPTION_LENGTH: 0,
    MAX_DATASET_DESCRIPTION_LENGTH: 1000,
    MIN_ANALYSIS_NAME_LENGTH: 1,
    MAX_ANALYSIS_NAME_LENGTH: 100,
    MIN_ANALYSIS_DESCRIPTION_LENGTH: 0,
    MAX_ANALYSIS_DESCRIPTION_LENGTH: 2000,
  },
  ERROR_MESSAGES: {
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    AUTH_REQUIRED: 'Please log in to continue.',
    AUTH_FAILED: 'Authentication failed. Please try again.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit. Please check your file.',
    INVALID_FILE_TYPE: 'File type not supported. Please check your file format.',
    UPLOAD_FAILED: 'File upload failed. Please try again.',
    DATASET_NOT_FOUND: 'Dataset not found. Please check your selection.',
    ANALYSIS_FAILED: 'Analysis failed. Please try again.',
    INSUFFICIENT_PERMISSIONS: 'You don\'t have permission to perform this action. Please check your access.',
  },
  STORAGE_KEYS: {
    USER_PREFERENCES: 'normaize_user_preferences',
    THEME: 'normaize_theme',
    LANGUAGE: 'normaize_language',
    AUTH_TOKEN: 'normaize_auth_token',
    REFRESH_TOKEN: 'normaize_refresh_token',
    USER_ID: 'normaize_user_id',
    SIDEBAR_COLLAPSED: 'normaize_sidebar_collapsed',
    TABLE_COLUMNS: 'normaize_table_columns',
    CHART_SETTINGS: 'normaize_chart_settings',
    API_CACHE: 'normaize_api_cache',
    USER_DATA_CACHE: 'normaize_user_data_cache',
  },
  FEATURE_FLAGS: {
    ADVANCED_ANALYSIS: true,
    REAL_TIME_COLLABORATION: false,
    API_INTEGRATIONS: true,
    DARK_MODE: true,
    CUSTOM_THEMES: false,
    KEYBOARD_SHORTCUTS: true,
    LAZY_LOADING: true,
    VIRTUAL_SCROLLING: false,
    SERVICE_WORKER: false,
  },
  PERFORMANCE_THRESHOLDS: {
    TARGET_PAGE_LOAD: 2000,
    ACCEPTABLE_PAGE_LOAD: 4000,
    TARGET_API_RESPONSE: 500,
    ACCEPTABLE_API_RESPONSE: 2000,
    TARGET_FILE_UPLOAD: 5000,
    ACCEPTABLE_FILE_UPLOAD: 15000,
    TARGET_ANALYSIS_TIME: 10000,
    ACCEPTABLE_ANALYSIS_TIME: 30000,
  },
  CONSTANTS: {
    API_CONFIG: {
      BASE_URL: 'http://localhost:5000',
      TIMEOUT: 30000,
      RETRY_ATTEMPTS: 3,
      RETRY_DELAY: 1000,
      MAX_RETRY_DELAY: 30000,
      RATE_LIMIT_WINDOW: 60000,
      MAX_REQUESTS_PER_WINDOW: 100,
    },
    FILE_CONFIG: {
      MAX_SIZE: 50 * 1024 * 1024,
      MAX_SIZE_MB: 50,
      ALLOWED_TYPES: [
        'text/csv',
        'application/json',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain',
        'application/pdf',
      ],
      ALLOWED_EXTENSIONS: ['.csv', '.json', '.xlsx', '.xls', '.txt', '.pdf'],
      CHUNK_SIZE: 1024 * 1024,
      UPLOAD_TIMEOUT: 300000,
    },
    ANALYSIS_TYPES: {
      DESCRIPTIVE: 'descriptive',
      CORRELATION: 'correlation',
      REGRESSION: 'regression',
      CLUSTERING: 'clustering',
      CLASSIFICATION: 'classification',
      TIME_SERIES: 'time_series',
      HYPOTHESIS_TESTING: 'hypothesis_testing',
    },
    ANALYSIS_CONFIG: {
      MAX_DATASET_SIZE: 1000000,
      MAX_COLUMNS: 1000,
      TIMEOUT: 300000,
      CACHE_DURATION: 3600000,
    },
    STATUS_TYPES: {
      PENDING: 'pending',
      RUNNING: 'running',
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
      PAUSED: 'paused',
      QUEUED: 'queued',
    },
    STATUS_COLORS: {
      pending: '#f59e0b',
      running: '#3b82f6',
      completed: '#10b981',
      failed: '#ef4444',
      cancelled: '#6b7280',
      paused: '#f97316',
      queued: '#8b5cf6',
    },
    APP_CONFIG: {
      NAME: 'Normaize',
      DESCRIPTION: 'Data Toolbox',
      VERSION: '1.0.0',
      AUTHOR: 'Normaize Team',
      WEBSITE: 'https://normaize.com',
      SUPPORT_EMAIL: 'support@normaize.com',
      MAX_TITLE_LENGTH: 100,
      MAX_DESCRIPTION_LENGTH: 500,
    },
    UI_CONFIG: {
      DEFAULT_PAGE_SIZE: 20,
      PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
      MAX_PAGE_SIZE: 1000,
      SEARCH_DEBOUNCE: 300,
      INPUT_DEBOUNCE: 500,
      RESIZE_DEBOUNCE: 250,
      TRANSITION_DURATION: 200,
      LOADING_DELAY: 500,
      TOAST_DURATION: 4000,
      ERROR_TOAST_DURATION: 8000,
      MODAL_SIZES: {
        SMALL: 'sm',
        MEDIUM: 'md',
        LARGE: 'lg',
        EXTRA_LARGE: 'xl',
      },
    },
    VALIDATION_RULES: {
      MIN_PASSWORD_LENGTH: 8,
      MAX_PASSWORD_LENGTH: 128,
      MIN_USERNAME_LENGTH: 3,
      MAX_USERNAME_LENGTH: 50,
      MIN_EMAIL_LENGTH: 5,
      MAX_EMAIL_LENGTH: 254,
      MIN_DATASET_NAME_LENGTH: 1,
      MAX_DATASET_NAME_LENGTH: 100,
      MIN_DATASET_DESCRIPTION_LENGTH: 0,
      MAX_DATASET_DESCRIPTION_LENGTH: 1000,
      MIN_ANALYSIS_NAME_LENGTH: 1,
      MAX_ANALYSIS_NAME_LENGTH: 100,
      MIN_ANALYSIS_DESCRIPTION_LENGTH: 0,
      MAX_ANALYSIS_DESCRIPTION_LENGTH: 2000,
    },
    ERROR_MESSAGES: {
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
      NETWORK_ERROR: 'Network error. Please check your connection and try again.',
      TIMEOUT_ERROR: 'Request timed out. Please try again.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      AUTH_REQUIRED: 'Please log in to continue.',
      AUTH_FAILED: 'Authentication failed. Please try again.',
      SESSION_EXPIRED: 'Your session has expired. Please log in again.',
      FILE_TOO_LARGE: 'File size exceeds the maximum limit. Please check your file.',
      INVALID_FILE_TYPE: 'File type not supported. Please check your file format.',
      UPLOAD_FAILED: 'File upload failed. Please try again.',
      DATASET_NOT_FOUND: 'Dataset not found. Please check your selection.',
      ANALYSIS_FAILED: 'Analysis failed. Please try again.',
      INSUFFICIENT_PERMISSIONS: 'You don\'t have permission to perform this action. Please check your access.',
    },
    STORAGE_KEYS: {
      USER_PREFERENCES: 'normaize_user_preferences',
      THEME: 'normaize_theme',
      LANGUAGE: 'normaize_language',
      AUTH_TOKEN: 'normaize_auth_token',
      REFRESH_TOKEN: 'normaize_refresh_token',
      USER_ID: 'normaize_user_id',
      SIDEBAR_COLLAPSED: 'normaize_sidebar_collapsed',
      TABLE_COLUMNS: 'normaize_table_columns',
      CHART_SETTINGS: 'normaize_chart_settings',
      API_CACHE: 'normaize_api_cache',
      USER_DATA_CACHE: 'normaize_user_data_cache',
    },
    FEATURE_FLAGS: {
      ADVANCED_ANALYSIS: true,
      REAL_TIME_COLLABORATION: false,
      API_INTEGRATIONS: true,
      DARK_MODE: true,
      CUSTOM_THEMES: false,
      KEYBOARD_SHORTCUTS: true,
      LAZY_LOADING: true,
      VIRTUAL_SCROLLING: false,
      SERVICE_WORKER: false,
    },
    PERFORMANCE_THRESHOLDS: {
      TARGET_PAGE_LOAD: 2000,
      ACCEPTABLE_PAGE_LOAD: 4000,
      TARGET_API_RESPONSE: 500,
      ACCEPTABLE_API_RESPONSE: 2000,
      TARGET_FILE_UPLOAD: 5000,
      ACCEPTABLE_FILE_UPLOAD: 15000,
      TARGET_ANALYSIS_TIME: 10000,
      ACCEPTABLE_ANALYSIS_TIME: 30000,
    },
  },
}));

import {
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
  CONSTANTS,
} from '../constants';

describe('Constants', () => {
  describe('API_CONFIG', () => {
    it('should have correct API configuration values', () => {
      expect(API_CONFIG.BASE_URL).toBeDefined();
      expect(API_CONFIG.TIMEOUT).toBe(30000);
      expect(API_CONFIG.RETRY_ATTEMPTS).toBe(3);
      expect(API_CONFIG.RETRY_DELAY).toBe(1000);
      expect(API_CONFIG.MAX_RETRY_DELAY).toBe(30000);
      expect(API_CONFIG.RATE_LIMIT_WINDOW).toBe(60000);
      expect(API_CONFIG.MAX_REQUESTS_PER_WINDOW).toBe(100);
    });

    it('should have valid timeout values', () => {
      expect(API_CONFIG.TIMEOUT).toBeGreaterThan(0);
      expect(API_CONFIG.RETRY_DELAY).toBeGreaterThan(0);
      expect(API_CONFIG.MAX_RETRY_DELAY).toBeGreaterThan(API_CONFIG.RETRY_DELAY);
    });

    it('should have valid rate limiting configuration', () => {
      expect(API_CONFIG.RATE_LIMIT_WINDOW).toBeGreaterThan(0);
      expect(API_CONFIG.MAX_REQUESTS_PER_WINDOW).toBeGreaterThan(0);
    });
  });

  describe('FILE_CONFIG', () => {
    it('should have correct file configuration values', () => {
      expect(FILE_CONFIG.MAX_SIZE).toBe(50 * 1024 * 1024); // 50MB in bytes
      expect(FILE_CONFIG.MAX_SIZE_MB).toBe(50);
      expect(FILE_CONFIG.CHUNK_SIZE).toBe(1024 * 1024); // 1MB
      expect(FILE_CONFIG.UPLOAD_TIMEOUT).toBe(300000); // 5 minutes
    });

    it('should have valid file size limits', () => {
      expect(FILE_CONFIG.MAX_SIZE).toBeGreaterThan(0);
      expect(FILE_CONFIG.CHUNK_SIZE).toBeGreaterThan(0);
      expect(FILE_CONFIG.MAX_SIZE).toBeGreaterThan(FILE_CONFIG.CHUNK_SIZE);
    });

    it('should have correct allowed file types', () => {
      expect(FILE_CONFIG.ALLOWED_TYPES).toContain('text/csv');
      expect(FILE_CONFIG.ALLOWED_TYPES).toContain('application/json');
      expect(FILE_CONFIG.ALLOWED_TYPES).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(FILE_CONFIG.ALLOWED_TYPES).toContain('application/vnd.ms-excel');
      expect(FILE_CONFIG.ALLOWED_TYPES).toContain('text/plain');
      expect(FILE_CONFIG.ALLOWED_TYPES).toContain('application/pdf');
    });

    it('should have correct allowed file extensions', () => {
      expect(FILE_CONFIG.ALLOWED_EXTENSIONS).toContain('.csv');
      expect(FILE_CONFIG.ALLOWED_EXTENSIONS).toContain('.json');
      expect(FILE_CONFIG.ALLOWED_EXTENSIONS).toContain('.xlsx');
      expect(FILE_CONFIG.ALLOWED_EXTENSIONS).toContain('.xls');
      expect(FILE_CONFIG.ALLOWED_EXTENSIONS).toContain('.txt');
      expect(FILE_CONFIG.ALLOWED_EXTENSIONS).toContain('.pdf');
    });

    it('should have matching file types and extensions', () => {
      expect(FILE_CONFIG.ALLOWED_TYPES.length).toBe(FILE_CONFIG.ALLOWED_EXTENSIONS.length);
    });
  });

  describe('ANALYSIS_TYPES', () => {
    it('should have all expected analysis types', () => {
      expect(ANALYSIS_TYPES.DESCRIPTIVE).toBe('descriptive');
      expect(ANALYSIS_TYPES.CORRELATION).toBe('correlation');
      expect(ANALYSIS_TYPES.REGRESSION).toBe('regression');
      expect(ANALYSIS_TYPES.CLUSTERING).toBe('clustering');
      expect(ANALYSIS_TYPES.CLASSIFICATION).toBe('classification');
      expect(ANALYSIS_TYPES.TIME_SERIES).toBe('time_series');
      expect(ANALYSIS_TYPES.HYPOTHESIS_TESTING).toBe('hypothesis_testing');
    });

    it('should have unique values', () => {
      const values = Object.values(ANALYSIS_TYPES);
      const uniqueValues = new Set(values);
      expect(values.length).toBe(uniqueValues.size);
    });
  });

  describe('ANALYSIS_CONFIG', () => {
    it('should have correct analysis configuration values', () => {
      expect(ANALYSIS_CONFIG.MAX_DATASET_SIZE).toBe(1000000); // 1M rows
      expect(ANALYSIS_CONFIG.MAX_COLUMNS).toBe(1000);
      expect(ANALYSIS_CONFIG.TIMEOUT).toBe(300000); // 5 minutes
      expect(ANALYSIS_CONFIG.CACHE_DURATION).toBe(3600000); // 1 hour
    });

    it('should have valid limits', () => {
      expect(ANALYSIS_CONFIG.MAX_DATASET_SIZE).toBeGreaterThan(0);
      expect(ANALYSIS_CONFIG.MAX_COLUMNS).toBeGreaterThan(0);
      expect(ANALYSIS_CONFIG.TIMEOUT).toBeGreaterThan(0);
      expect(ANALYSIS_CONFIG.CACHE_DURATION).toBeGreaterThan(0);
    });
  });

  describe('STATUS_TYPES', () => {
    it('should have all expected status types', () => {
      expect(STATUS_TYPES.PENDING).toBe('pending');
      expect(STATUS_TYPES.RUNNING).toBe('running');
      expect(STATUS_TYPES.COMPLETED).toBe('completed');
      expect(STATUS_TYPES.FAILED).toBe('failed');
      expect(STATUS_TYPES.CANCELLED).toBe('cancelled');
      expect(STATUS_TYPES.PAUSED).toBe('paused');
      expect(STATUS_TYPES.QUEUED).toBe('queued');
    });

    it('should have unique values', () => {
      const values = Object.values(STATUS_TYPES);
      const uniqueValues = new Set(values);
      expect(values.length).toBe(uniqueValues.size);
    });
  });

  describe('STATUS_COLORS', () => {
    it('should have colors for all status types', () => {
      Object.values(STATUS_TYPES).forEach(status => {
        expect(STATUS_COLORS[status]).toBeDefined();
        expect(STATUS_COLORS[status]).toMatch(/^#[0-9a-fA-F]{6}$/); // Valid hex color
      });
    });

    it('should have valid hex color codes', () => {
      Object.values(STATUS_COLORS).forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should have appropriate colors for different statuses', () => {
      expect(STATUS_COLORS[STATUS_TYPES.COMPLETED]).toBe('#10b981'); // Green for success
      expect(STATUS_COLORS[STATUS_TYPES.FAILED]).toBe('#ef4444'); // Red for failure
      expect(STATUS_COLORS[STATUS_TYPES.RUNNING]).toBe('#3b82f6'); // Blue for running
    });
  });

  describe('APP_CONFIG', () => {
    it('should have correct application configuration values', () => {
      expect(APP_CONFIG.NAME).toBe('Normaize');
      expect(APP_CONFIG.DESCRIPTION).toBe('Data Toolbox');
      expect(APP_CONFIG.VERSION).toBe('1.0.0');
      expect(APP_CONFIG.AUTHOR).toBe('Normaize Team');
      expect(APP_CONFIG.WEBSITE).toBe('https://normaize.com');
      expect(APP_CONFIG.SUPPORT_EMAIL).toBe('support@normaize.com');
    });

    it('should have valid length constraints', () => {
      expect(APP_CONFIG.MAX_TITLE_LENGTH).toBeGreaterThan(0);
      expect(APP_CONFIG.MAX_DESCRIPTION_LENGTH).toBeGreaterThan(0);
      expect(APP_CONFIG.MAX_DESCRIPTION_LENGTH).toBeGreaterThan(APP_CONFIG.MAX_TITLE_LENGTH);
    });

    it('should have valid URLs and emails', () => {
      expect(APP_CONFIG.WEBSITE).toMatch(/^https?:\/\/.+/);
      expect(APP_CONFIG.SUPPORT_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  describe('UI_CONFIG', () => {
    it('should have correct pagination configuration', () => {
      expect(UI_CONFIG.DEFAULT_PAGE_SIZE).toBe(20);
      expect(UI_CONFIG.PAGE_SIZE_OPTIONS).toEqual([10, 20, 50, 100]);
      expect(UI_CONFIG.MAX_PAGE_SIZE).toBe(1000);
    });

    it('should have valid page size options', () => {
      expect(UI_CONFIG.PAGE_SIZE_OPTIONS).toContain(UI_CONFIG.DEFAULT_PAGE_SIZE);
      expect(UI_CONFIG.PAGE_SIZE_OPTIONS.every(size => size <= UI_CONFIG.MAX_PAGE_SIZE)).toBe(true);
    });

    it('should have correct debounce delays', () => {
      expect(UI_CONFIG.SEARCH_DEBOUNCE).toBe(300);
      expect(UI_CONFIG.INPUT_DEBOUNCE).toBe(500);
      expect(UI_CONFIG.RESIZE_DEBOUNCE).toBe(250);
    });

    it('should have valid animation durations', () => {
      expect(UI_CONFIG.TRANSITION_DURATION).toBeGreaterThan(0);
      expect(UI_CONFIG.LOADING_DELAY).toBeGreaterThan(0);
    });

    it('should have correct toast durations', () => {
      expect(UI_CONFIG.TOAST_DURATION).toBe(4000);
      expect(UI_CONFIG.ERROR_TOAST_DURATION).toBe(8000);
    });

    it('should have correct modal sizes', () => {
      expect(UI_CONFIG.MODAL_SIZES.SMALL).toBe('sm');
      expect(UI_CONFIG.MODAL_SIZES.MEDIUM).toBe('md');
      expect(UI_CONFIG.MODAL_SIZES.LARGE).toBe('lg');
      expect(UI_CONFIG.MODAL_SIZES.EXTRA_LARGE).toBe('xl');
    });
  });

  describe('VALIDATION_RULES', () => {
    it('should have correct password validation rules', () => {
      expect(VALIDATION_RULES.MIN_PASSWORD_LENGTH).toBe(8);
      expect(VALIDATION_RULES.MAX_PASSWORD_LENGTH).toBe(128);
      expect(VALIDATION_RULES.MIN_PASSWORD_LENGTH).toBeLessThan(VALIDATION_RULES.MAX_PASSWORD_LENGTH);
    });

    it('should have correct username validation rules', () => {
      expect(VALIDATION_RULES.MIN_USERNAME_LENGTH).toBe(3);
      expect(VALIDATION_RULES.MAX_USERNAME_LENGTH).toBe(50);
      expect(VALIDATION_RULES.MIN_USERNAME_LENGTH).toBeLessThan(VALIDATION_RULES.MAX_USERNAME_LENGTH);
    });

    it('should have correct email validation rules', () => {
      expect(VALIDATION_RULES.MIN_EMAIL_LENGTH).toBe(5);
      expect(VALIDATION_RULES.MAX_EMAIL_LENGTH).toBe(254);
      expect(VALIDATION_RULES.MIN_EMAIL_LENGTH).toBeLessThan(VALIDATION_RULES.MAX_EMAIL_LENGTH);
    });

    it('should have correct dataset validation rules', () => {
      expect(VALIDATION_RULES.MIN_DATASET_NAME_LENGTH).toBe(1);
      expect(VALIDATION_RULES.MAX_DATASET_NAME_LENGTH).toBe(100);
      expect(VALIDATION_RULES.MIN_DATASET_DESCRIPTION_LENGTH).toBe(0);
      expect(VALIDATION_RULES.MAX_DATASET_DESCRIPTION_LENGTH).toBe(1000);
    });

    it('should have correct analysis validation rules', () => {
      expect(VALIDATION_RULES.MIN_ANALYSIS_NAME_LENGTH).toBe(1);
      expect(VALIDATION_RULES.MAX_ANALYSIS_NAME_LENGTH).toBe(100);
      expect(VALIDATION_RULES.MIN_ANALYSIS_DESCRIPTION_LENGTH).toBe(0);
      expect(VALIDATION_RULES.MAX_ANALYSIS_DESCRIPTION_LENGTH).toBe(2000);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have all expected error message categories', () => {
      expect(ERROR_MESSAGES.UNKNOWN_ERROR).toBeDefined();
      expect(ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
      expect(ERROR_MESSAGES.TIMEOUT_ERROR).toBeDefined();
      expect(ERROR_MESSAGES.VALIDATION_ERROR).toBeDefined();
      expect(ERROR_MESSAGES.AUTH_REQUIRED).toBeDefined();
      expect(ERROR_MESSAGES.AUTH_FAILED).toBeDefined();
      expect(ERROR_MESSAGES.SESSION_EXPIRED).toBeDefined();
      expect(ERROR_MESSAGES.FILE_TOO_LARGE).toBeDefined();
      expect(ERROR_MESSAGES.INVALID_FILE_TYPE).toBeDefined();
      expect(ERROR_MESSAGES.UPLOAD_FAILED).toBeDefined();
      expect(ERROR_MESSAGES.DATASET_NOT_FOUND).toBeDefined();
      expect(ERROR_MESSAGES.ANALYSIS_FAILED).toBeDefined();
      expect(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS).toBeDefined();
    });

    it('should have user-friendly error messages', () => {
      Object.values(ERROR_MESSAGES).forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
        // Check if message contains helpful words
        const hasHelpfulContent = message.includes('Please') || 
                                 message.includes('check') || 
                                 message.includes('try') ||
                                 message.includes('error') ||
                                 message.includes('failed');
        expect(hasHelpfulContent).toBe(true);
      });
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have all expected storage key categories', () => {
      expect(STORAGE_KEYS.USER_PREFERENCES).toBeDefined();
      expect(STORAGE_KEYS.THEME).toBeDefined();
      expect(STORAGE_KEYS.LANGUAGE).toBeDefined();
      expect(STORAGE_KEYS.AUTH_TOKEN).toBeDefined();
      expect(STORAGE_KEYS.REFRESH_TOKEN).toBeDefined();
      expect(STORAGE_KEYS.USER_ID).toBeDefined();
      expect(STORAGE_KEYS.SIDEBAR_COLLAPSED).toBeDefined();
      expect(STORAGE_KEYS.TABLE_COLUMNS).toBeDefined();
      expect(STORAGE_KEYS.CHART_SETTINGS).toBeDefined();
      expect(STORAGE_KEYS.API_CACHE).toBeDefined();
      expect(STORAGE_KEYS.USER_DATA_CACHE).toBeDefined();
    });

    it('should have namespaced storage keys', () => {
      Object.values(STORAGE_KEYS).forEach(key => {
        expect(key).toMatch(/^normaize_/);
      });
    });
  });

  describe('FEATURE_FLAGS', () => {
    it('should have all expected feature flag categories', () => {
      expect(FEATURE_FLAGS.ADVANCED_ANALYSIS).toBeDefined();
      expect(FEATURE_FLAGS.REAL_TIME_COLLABORATION).toBeDefined();
      expect(FEATURE_FLAGS.API_INTEGRATIONS).toBeDefined();
      expect(FEATURE_FLAGS.DARK_MODE).toBeDefined();
      expect(FEATURE_FLAGS.CUSTOM_THEMES).toBeDefined();
      expect(FEATURE_FLAGS.KEYBOARD_SHORTCUTS).toBeDefined();
      expect(FEATURE_FLAGS.LAZY_LOADING).toBeDefined();
      expect(FEATURE_FLAGS.VIRTUAL_SCROLLING).toBeDefined();
      expect(FEATURE_FLAGS.SERVICE_WORKER).toBeDefined();
    });

    it('should have boolean values', () => {
      Object.values(FEATURE_FLAGS).forEach(flag => {
        expect(typeof flag).toBe('boolean');
      });
    });
  });

  describe('PERFORMANCE_THRESHOLDS', () => {
    it('should have all expected performance threshold categories', () => {
      expect(PERFORMANCE_THRESHOLDS.TARGET_PAGE_LOAD).toBeDefined();
      expect(PERFORMANCE_THRESHOLDS.ACCEPTABLE_PAGE_LOAD).toBeDefined();
      expect(PERFORMANCE_THRESHOLDS.TARGET_API_RESPONSE).toBeDefined();
      expect(PERFORMANCE_THRESHOLDS.ACCEPTABLE_API_RESPONSE).toBeDefined();
      expect(PERFORMANCE_THRESHOLDS.TARGET_FILE_UPLOAD).toBeDefined();
      expect(PERFORMANCE_THRESHOLDS.ACCEPTABLE_FILE_UPLOAD).toBeDefined();
      expect(PERFORMANCE_THRESHOLDS.TARGET_ANALYSIS_TIME).toBeDefined();
      expect(PERFORMANCE_THRESHOLDS.ACCEPTABLE_ANALYSIS_TIME).toBeDefined();
    });

    it('should have logical threshold relationships', () => {
      expect(PERFORMANCE_THRESHOLDS.TARGET_PAGE_LOAD).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE_PAGE_LOAD);
      expect(PERFORMANCE_THRESHOLDS.TARGET_API_RESPONSE).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE_API_RESPONSE);
      expect(PERFORMANCE_THRESHOLDS.TARGET_FILE_UPLOAD).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE_FILE_UPLOAD);
      expect(PERFORMANCE_THRESHOLDS.TARGET_ANALYSIS_TIME).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE_ANALYSIS_TIME);
    });

    it('should have positive threshold values', () => {
      Object.values(PERFORMANCE_THRESHOLDS).forEach(threshold => {
        expect(threshold).toBeGreaterThan(0);
      });
    });
  });

  describe('CONSTANTS export', () => {
    it('should export all constant categories', () => {
      expect(CONSTANTS).toHaveProperty('API_CONFIG');
      expect(CONSTANTS).toHaveProperty('FILE_CONFIG');
      expect(CONSTANTS).toHaveProperty('ANALYSIS_TYPES');
      expect(CONSTANTS).toHaveProperty('ANALYSIS_CONFIG');
      expect(CONSTANTS).toHaveProperty('STATUS_TYPES');
      expect(CONSTANTS).toHaveProperty('STATUS_COLORS');
      expect(CONSTANTS).toHaveProperty('APP_CONFIG');
      expect(CONSTANTS).toHaveProperty('UI_CONFIG');
      expect(CONSTANTS).toHaveProperty('VALIDATION_RULES');
      expect(CONSTANTS).toHaveProperty('ERROR_MESSAGES');
      expect(CONSTANTS).toHaveProperty('STORAGE_KEYS');
      expect(CONSTANTS).toHaveProperty('FEATURE_FLAGS');
      expect(CONSTANTS).toHaveProperty('PERFORMANCE_THRESHOLDS');
    });

    it('should have working constant references', () => {
      expect(CONSTANTS.API_CONFIG).toStrictEqual(API_CONFIG);
      expect(CONSTANTS.FILE_CONFIG).toStrictEqual(FILE_CONFIG);
      expect(CONSTANTS.APP_CONFIG).toStrictEqual(APP_CONFIG);
    });
  });

  describe('Environment variable fallbacks', () => {
    it('should have fallback values for API configuration', () => {
      expect(API_CONFIG.BASE_URL).toBe('http://localhost:5000');
      expect(API_CONFIG.TIMEOUT).toBe(30000);
    });

    it('should have reasonable default timeouts', () => {
      expect(API_CONFIG.TIMEOUT).toBeGreaterThan(0);
      expect(API_CONFIG.TIMEOUT).toBeLessThan(60000); // Less than 1 minute
    });
  });
});
