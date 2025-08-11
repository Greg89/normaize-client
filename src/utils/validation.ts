import { logger } from './logger';

// Input validation and sanitization utilities
export class ValidationUtils {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // URL validation
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // File type validation
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  // File size validation (in bytes)
  static isValidFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  // String sanitization (remove potentially dangerous characters)
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // HTML content sanitization
  static sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // SQL injection prevention (basic)
  static containsSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /\b(select|insert|update|delete|drop|create|alter|exec|execute|union|where|from|join|having|group|order|by|and|or|not|in|like|between|is|null|as|distinct|top|limit|offset)\b/i,
      /['";]/, // Single quotes, double quotes, semicolons
      /--/, // SQL comments
      /\bxp_/, // Extended stored procedures
      /\bsp_/, // Stored procedures
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // XSS prevention
  static containsXss(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Input length validation
  static isValidLength(input: string, minLength: number, maxLength: number): boolean {
    return input.length >= minLength && input.length <= maxLength;
  }

  // Numeric validation
  static isValidNumber(input: string | number): boolean {
    if (typeof input === 'number') return !isNaN(input) && isFinite(input);
    return !isNaN(Number(input)) && isFinite(Number(input));
  }

  // Integer validation
  static isValidInteger(input: string | number): boolean {
    if (typeof input === 'number') return Number.isInteger(input);
    return Number.isInteger(Number(input));
  }

  // Date validation
  static isValidDate(date: string | Date): boolean {
    if (date instanceof Date) return !isNaN(date.getTime());
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }

  // Phone number validation (basic)
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // Password strength validation
  static getPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password should be at least 8 characters long');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain at least one lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain at least one uppercase letter');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain at least one number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain at least one special character');
    }

    return {
      score,
      feedback,
      isStrong: score >= 4,
    };
  }

  // Validate and sanitize user input
  static validateUserInput(input: string, options: {
    maxLength?: number;
    allowHtml?: boolean;
    allowSpecialChars?: boolean;
  } = {}): {
    isValid: boolean;
    sanitized: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let sanitized = input;

    // Check for SQL injection
    if (this.containsSqlInjection(input)) {
      errors.push('Input contains potentially dangerous content');
      logger.warn('Potential SQL injection detected', { input: input.substring(0, 100) });
    }

    // Check for XSS
    if (this.containsXss(input)) {
      errors.push('Input contains potentially dangerous content');
      logger.warn('Potential XSS detected', { input: input.substring(0, 100) });
    }

    // Length validation
    if (options.maxLength && input.length > options.maxLength) {
      errors.push(`Input is too long (max ${options.maxLength} characters)`);
    }

    // Sanitize based on options
    if (!options.allowHtml) {
      sanitized = this.sanitizeHtml(sanitized);
    }

    if (!options.allowSpecialChars) {
      sanitized = this.sanitizeString(sanitized);
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors,
    };
  }

  // Validate file upload
  static validateFileUpload(file: File, options: {
    maxSize: number;
    allowedTypes: string[];
    allowedExtensions: string[];
  }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!this.isValidFileType(file, options.allowedTypes)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    if (!this.isValidFileSize(file, options.maxSize)) {
      const maxSizeMB = Math.round(options.maxSize / (1024 * 1024));
      errors.push(`File size exceeds maximum limit of ${maxSizeMB}MB`);
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && !options.allowedExtensions.includes(`.${extension}`)) {
      errors.push(`File extension .${extension} is not allowed`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Rate limiting helper
  static createRateLimiter(maxRequests: number, timeWindow: number) {
    const requests = new Map<string, number[]>();

    return (identifier: string): boolean => {
      const now = Date.now();
      const userRequests = requests.get(identifier) || [];
      
      // Remove old requests outside the time window
      const validRequests = userRequests.filter(time => now - time < timeWindow);
      
      if (validRequests.length >= maxRequests) {
        logger.warn('Rate limit exceeded', { identifier, maxRequests, timeWindow });
        return false;
      }
      
      validRequests.push(now);
      requests.set(identifier, validRequests);
      return true;
    };
  }
}

// Export individual functions for convenience
export const {
  isValidEmail,
  isValidUrl,
  isValidFileType,
  isValidFileSize,
  sanitizeString,
  sanitizeHtml,
  containsSqlInjection,
  containsXss,
  isValidLength,
  isValidNumber,
  isValidInteger,
  isValidDate,
  isValidPhoneNumber,
  getPasswordStrength,
  validateUserInput,
  validateFileUpload,
  createRateLimiter,
} = ValidationUtils;
