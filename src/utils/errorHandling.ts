import { ApiError } from '../types';
import toast from 'react-hot-toast';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

// Error handler class
export class ErrorHandler {
  static handle(error: unknown, context?: string): void {
    const errorInfo = this.parseError(error);
    
    // Log error for debugging
    console.error(`Error in ${context || 'unknown context'}:`, errorInfo);
    
    // Show user-friendly message
    this.showUserMessage(errorInfo);
  }

  private static parseError(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: error.name,
      };
    }
    
    if (typeof error === 'string') {
      return { message: error };
    }
    
    return {
      message: 'An unexpected error occurred',
      code: ErrorType.UNKNOWN,
    };
  }

  private static showUserMessage(error: ApiError): void {
    let message = error.message;
    
    // Customize messages based on error type
    switch (error.code) {
      case ErrorType.NETWORK:
        message = 'Network error. Please check your connection.';
        break;
      case ErrorType.VALIDATION:
        message = 'Please check your input and try again.';
        break;
      case ErrorType.AUTHENTICATION:
        message = 'Please log in to continue.';
        break;
      case ErrorType.AUTHORIZATION:
        message = 'You don\'t have permission to perform this action.';
        break;
      case ErrorType.SERVER:
        message = 'Server error. Please try again later.';
        break;
    }
    
    toast.error(message);
  }

  // Validation helpers
  static validateFile(file: File): string | null {
    if (file.size > 50 * 1024 * 1024) {
      return 'File size must be less than 50MB';
    }
    
    const allowedTypes = [
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported. Please upload CSV, JSON, or Excel files.';
    }
    
    return null;
  }

  static validateRequired(value: string, fieldName: string): string | null {
    if (!value || value.trim().length === 0) {
      return `${fieldName} is required`;
    }
    return null;
  }
} 