import { ApiError } from '../types';
import { logger } from './logger';
import toast from 'react-hot-toast';

// Enhanced error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  FILE_UPLOAD = 'FILE_UPLOAD',
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Enhanced error information interface
export interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  context?: string;
  timestamp: Date;
  userId?: string;
  url?: string;
  userAgent?: string;
  stack?: string;
  metadata?: Record<string, unknown>;
}

// Error handler class with enhanced functionality
export class ErrorHandler {
  private static errorCount = new Map<string, number>();
  private static readonly MAX_ERRORS_PER_MINUTE = 10;
  private static readonly ERROR_RESET_INTERVAL = 60000; // 1 minute

  static handle(error: unknown, context?: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM): void {
    const errorInfo = this.parseError(error, context, severity);
    
    // Check rate limiting
    if (this.isRateLimited(errorInfo.type)) {
      return;
    }

    // Log error for debugging and monitoring
    this.logError(errorInfo);
    
    // Show user-friendly message
    this.showUserMessage(errorInfo);
    
    // Track error metrics
    this.trackError(errorInfo);
  }

  private static parseError(error: unknown, context?: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM): ErrorInfo {
    let message: string;
    let code: string | undefined;
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      code = error.name;
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
      code = 'STRING_ERROR';
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String((error as any).message);
      code = (error as any).code || 'OBJECT_ERROR';
    } else {
      message = 'An unexpected error occurred';
      code = ErrorType.UNKNOWN;
    }

    return {
      type: this.determineErrorType(error, code),
      severity,
      message,
      code,
      context,
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      stack,
    };
  }

  private static determineErrorType(error: unknown, code?: string): ErrorType {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
        return ErrorType.NETWORK;
      }
      if (message.includes('validation') || message.includes('invalid')) {
        return ErrorType.VALIDATION;
      }
      if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
        return message.includes('forbidden') ? ErrorType.AUTHORIZATION : ErrorType.AUTHENTICATION;
      }
      if (message.includes('server') || message.includes('500')) {
        return ErrorType.SERVER;
      }
      if (message.includes('timeout')) {
        return ErrorType.TIMEOUT;
      }
      if (message.includes('rate limit') || message.includes('too many requests')) {
        return ErrorType.RATE_LIMIT;
      }
    }

    // Check code-based classification
    if (code) {
      const codeLower = code.toLowerCase();
      if (codeLower.includes('network') || codeLower.includes('fetch')) return ErrorType.NETWORK;
      if (codeLower.includes('validation')) return ErrorType.VALIDATION;
      if (codeLower.includes('auth')) return ErrorType.AUTHENTICATION;
      if (codeLower.includes('forbidden')) return ErrorType.AUTHORIZATION;
      if (codeLower.includes('server')) return ErrorType.SERVER;
      if (codeLower.includes('timeout')) return ErrorType.TIMEOUT;
      if (codeLower.includes('rate_limit')) return ErrorType.RATE_LIMIT;
    }

    return ErrorType.UNKNOWN;
  }

  private static isRateLimited(errorType: ErrorType): boolean {
    const key = `${errorType}_${Math.floor(Date.now() / this.ERROR_RESET_INTERVAL)}`;
    const currentCount = this.errorCount.get(key) || 0;
    
    if (currentCount >= this.MAX_ERRORS_PER_MINUTE) {
      return true;
    }
    
    this.errorCount.set(key, currentCount + 1);
    return false;
  }

  private static async logError(errorInfo: ErrorInfo): Promise<void> {
    const logProperties = {
      errorType: errorInfo.type,
      severity: errorInfo.severity,
      code: errorInfo.code,
      context: errorInfo.context,
      url: errorInfo.url,
      userAgent: errorInfo.userAgent,
      metadata: errorInfo.metadata,
    };

    switch (errorInfo.severity) {
      case ErrorSeverity.CRITICAL:
        await logger.error(`CRITICAL: ${errorInfo.message}`, logProperties, new Error(errorInfo.stack));
        break;
      case ErrorSeverity.HIGH:
        await logger.error(`HIGH: ${errorInfo.message}`, logProperties, new Error(errorInfo.stack));
        break;
      case ErrorSeverity.MEDIUM:
        await logger.warn(`MEDIUM: ${errorInfo.message}`, logProperties);
        break;
      case ErrorSeverity.LOW:
        await logger.info(`LOW: ${errorInfo.message}`, logProperties);
        break;
    }
  }

  private static showUserMessage(errorInfo: ErrorInfo): void {
    let message = this.getUserFriendlyMessage(errorInfo);
    
    // Don't show toast for low severity errors
    if (errorInfo.severity === ErrorSeverity.LOW) {
      return;
    }

    // Use different toast types based on severity
    switch (errorInfo.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        toast.error(message, { duration: 8000 });
        break;
      case ErrorSeverity.MEDIUM:
        toast.error(message, { duration: 5000 });
        break;
      default:
        toast(message, { duration: 3000 });
        break;
    }
  }

  private static getUserFriendlyMessage(errorInfo: ErrorInfo): string {
    // Customize messages based on error type and context
    switch (errorInfo.type) {
      case ErrorType.NETWORK:
        return 'Network error. Please check your connection and try again.';
      case ErrorType.VALIDATION:
        return errorInfo.context 
          ? `Please check your ${errorInfo.context} and try again.`
          : 'Please check your input and try again.';
      case ErrorType.AUTHENTICATION:
        return 'Please log in to continue.';
      case ErrorType.AUTHORIZATION:
        return 'You don\'t have permission to perform this action.';
      case ErrorType.SERVER:
        return 'Server error. Please try again later.';
      case ErrorType.TIMEOUT:
        return 'Request timed out. Please try again.';
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';
      case ErrorType.FILE_UPLOAD:
        return 'File upload failed. Please check the file and try again.';
      default:
        return errorInfo.message || 'An unexpected error occurred.';
    }
  }

  private static async trackError(errorInfo: ErrorInfo): Promise<void> {
    // Track error metrics for analytics
    try {
      await logger.trackUserAction('error_occurred', {
        errorType: errorInfo.type,
        severity: errorInfo.severity,
        context: errorInfo.context,
        code: errorInfo.code,
      });
    } catch (trackingError) {
      // Don't let tracking errors interfere with main error handling
      console.warn('Failed to track error metrics:', trackingError);
    }
  }

  // Enhanced validation helpers
  static validateFile(file: File, context?: string): string | null {
    if (file.size > 50 * 1024 * 1024) {
      this.handle(new Error('File size exceeds 50MB limit'), context, ErrorSeverity.MEDIUM);
      return 'File size must be less than 50MB';
    }
    
    const allowedTypes = [
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      this.handle(new Error(`Unsupported file type: ${file.type}`), context, ErrorSeverity.MEDIUM);
      return 'File type not supported. Please upload CSV, JSON, or Excel files.';
    }
    
    return null;
  }

  static validateRequired(value: string, fieldName: string, context?: string): string | null {
    if (!value || value.trim().length === 0) {
      this.handle(new Error(`Required field missing: ${fieldName}`), context, ErrorSeverity.LOW);
      return `${fieldName} is required`;
    }
    return null;
  }

  // New utility methods
  static createError(type: ErrorType, message: string, context?: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM): ErrorInfo {
    return {
      type,
      severity,
      message,
      context,
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
  }

  static isRetryableError(error: ErrorInfo): boolean {
    return [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.SERVER,
      ErrorType.RATE_LIMIT,
    ].includes(error.type);
  }

  static getRetryDelay(error: ErrorInfo, attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  // Reset error count (useful for testing)
  static resetErrorCount(): void {
    this.errorCount.clear();
  }
}

// Export individual functions for convenience
export const {
  handle,
  validateFile,
  validateRequired,
  createError,
  isRetryableError,
  getRetryDelay,
  resetErrorCount,
} = ErrorHandler; 