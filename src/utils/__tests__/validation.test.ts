import { ValidationUtils } from '../validation';
import { logger } from '../logger';

// Mock the logger
jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
  },
}));

describe('ValidationUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidEmail', () => {
    it('should validate valid email addresses', () => {
      expect(ValidationUtils.isValidEmail('test@example.com')).toBe(true);
      expect(ValidationUtils.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(ValidationUtils.isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(ValidationUtils.isValidEmail('invalid-email')).toBe(false);
      expect(ValidationUtils.isValidEmail('test@')).toBe(false);
      expect(ValidationUtils.isValidEmail('@example.com')).toBe(false);
      expect(ValidationUtils.isValidEmail('test@.com')).toBe(false);
      expect(ValidationUtils.isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate valid URLs', () => {
      expect(ValidationUtils.isValidUrl('https://example.com')).toBe(true);
      expect(ValidationUtils.isValidUrl('http://localhost:3000')).toBe(true);
      expect(ValidationUtils.isValidUrl('ftp://files.example.org')).toBe(true);
      expect(ValidationUtils.isValidUrl('ws://websocket.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(ValidationUtils.isValidUrl('not-a-url')).toBe(false);
      expect(ValidationUtils.isValidUrl('http://')).toBe(false);
      expect(ValidationUtils.isValidUrl('')).toBe(false);
    });
  });

  describe('isValidFileType', () => {
    it('should validate file types', () => {
      const file = new File([''], 'test.csv', { type: 'text/csv' });
      const allowedTypes = ['text/csv', 'application/json'];
      
      expect(ValidationUtils.isValidFileType(file, allowedTypes)).toBe(true);
    });

    it('should reject invalid file types', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const allowedTypes = ['text/csv', 'application/json'];
      
      expect(ValidationUtils.isValidFileType(file, allowedTypes)).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('should validate file sizes', () => {
      const file = new File(['x'.repeat(1024)], 'test.txt', { type: 'text/plain' });
      
      expect(ValidationUtils.isValidFileSize(file, 2048)).toBe(true);
      expect(ValidationUtils.isValidFileSize(file, 1024)).toBe(true);
    });

    it('should reject oversized files', () => {
      const file = new File(['x'.repeat(2048)], 'test.txt', { type: 'text/plain' });
      
      expect(ValidationUtils.isValidFileSize(file, 1024)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      expect(ValidationUtils.sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(ValidationUtils.sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
      expect(ValidationUtils.sanitizeString('onclick=alert("xss")')).toBe('alert("xss")');
    });

    it('should trim whitespace', () => {
      expect(ValidationUtils.sanitizeString('  test  ')).toBe('test');
    });

    it('should preserve safe content', () => {
      expect(ValidationUtils.sanitizeString('Hello World!')).toBe('Hello World!');
      expect(ValidationUtils.sanitizeString('123-456-7890')).toBe('123-456-7890');
    });
  });

  describe('sanitizeHtml', () => {
    it('should escape HTML content', () => {
      expect(ValidationUtils.sanitizeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(ValidationUtils.sanitizeHtml('<div>Hello</div>')).toBe('&lt;div&gt;Hello&lt;/div&gt;');
    });

    it('should handle plain text', () => {
      expect(ValidationUtils.sanitizeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('containsSqlInjection', () => {
    it('should detect SQL injection patterns', () => {
      expect(ValidationUtils.containsSqlInjection("'; DROP TABLE users; --")).toBe(true);
      expect(ValidationUtils.containsSqlInjection('SELECT * FROM users')).toBe(true);
      expect(ValidationUtils.containsSqlInjection('admin\' OR 1=1--')).toBe(true);
      expect(ValidationUtils.containsSqlInjection('UNION SELECT password FROM users')).toBe(true);
    });

    it('should not flag safe content', () => {
      expect(ValidationUtils.containsSqlInjection('Hello World')).toBe(false);
      expect(ValidationUtils.containsSqlInjection('user@example.com')).toBe(false);
      expect(ValidationUtils.containsSqlInjection('123-456-7890')).toBe(false);
    });
  });

  describe('containsXss', () => {
    it('should detect XSS patterns', () => {
      expect(ValidationUtils.containsXss('<script>alert("xss")</script>')).toBe(true);
      expect(ValidationUtils.containsXss('javascript:alert("xss")')).toBe(true);
      expect(ValidationUtils.containsXss('onclick=alert("xss")')).toBe(true);
      expect(ValidationUtils.containsXss('<iframe src="evil.com"></iframe>')).toBe(true);
    });

    it('should not flag safe content', () => {
      expect(ValidationUtils.containsXss('Hello World')).toBe(false);
      expect(ValidationUtils.containsXss('<p>Safe HTML</p>')).toBe(false);
      expect(ValidationUtils.containsXss('http://example.com')).toBe(false);
    });
  });

  describe('isValidLength', () => {
    it('should validate string lengths', () => {
      expect(ValidationUtils.isValidLength('test', 1, 10)).toBe(true);
      expect(ValidationUtils.isValidLength('test', 4, 4)).toBe(true);
      expect(ValidationUtils.isValidLength('test', 1, 4)).toBe(true);
    });

    it('should reject strings outside length range', () => {
      expect(ValidationUtils.isValidLength('test', 5, 10)).toBe(false);
      expect(ValidationUtils.isValidLength('test', 1, 3)).toBe(false);
    });
  });

  describe('isValidNumber', () => {
    it('should validate numbers', () => {
      expect(ValidationUtils.isValidNumber(123)).toBe(true);
      expect(ValidationUtils.isValidNumber('123')).toBe(true);
      expect(ValidationUtils.isValidNumber(3.14)).toBe(true);
      expect(ValidationUtils.isValidNumber('-42')).toBe(true);
    });

    it('should reject invalid numbers', () => {
      expect(ValidationUtils.isValidNumber('not-a-number')).toBe(false);
      expect(ValidationUtils.isValidNumber('abc')).toBe(false);
      expect(ValidationUtils.isValidNumber(NaN)).toBe(false);
      expect(ValidationUtils.isValidNumber(Infinity)).toBe(false);
    });
  });

  describe('isValidInteger', () => {
    it('should validate integers', () => {
      expect(ValidationUtils.isValidInteger(123)).toBe(true);
      expect(ValidationUtils.isValidInteger('123')).toBe(true);
      expect(ValidationUtils.isValidInteger(-42)).toBe(true);
      expect(ValidationUtils.isValidInteger(0)).toBe(true);
    });

    it('should reject non-integers', () => {
      expect(ValidationUtils.isValidInteger(3.14)).toBe(false);
      expect(ValidationUtils.isValidInteger('3.14')).toBe(false);
      expect(ValidationUtils.isValidInteger('not-a-number')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate dates', () => {
      expect(ValidationUtils.isValidDate(new Date())).toBe(true);
      expect(ValidationUtils.isValidDate('2023-01-01')).toBe(true);
      expect(ValidationUtils.isValidDate('2023/01/01')).toBe(true);
      expect(ValidationUtils.isValidDate('01/01/2023')).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(ValidationUtils.isValidDate('not-a-date')).toBe(false);
      expect(ValidationUtils.isValidDate('2023-13-01')).toBe(false);
      expect(ValidationUtils.isValidDate('')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate phone numbers', () => {
      expect(ValidationUtils.isValidPhoneNumber('1234567890')).toBe(true);
      expect(ValidationUtils.isValidPhoneNumber('+1234567890')).toBe(true);
      expect(ValidationUtils.isValidPhoneNumber('(123) 456-7890')).toBe(true);
      expect(ValidationUtils.isValidPhoneNumber('123-456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(ValidationUtils.isValidPhoneNumber('not-a-phone')).toBe(false);
      expect(ValidationUtils.isValidPhoneNumber('abc')).toBe(false);
      expect(ValidationUtils.isValidPhoneNumber('')).toBe(false);
    });
  });

  describe('getPasswordStrength', () => {
    it('should score strong passwords correctly', () => {
      const result = ValidationUtils.getPasswordStrength('StrongP@ss123');
      
      expect(result.score).toBe(5);
      expect(result.isStrong).toBe(true);
      expect(result.feedback).toHaveLength(0);
    });

    it('should score weak passwords correctly', () => {
      const result = ValidationUtils.getPasswordStrength('weak');
      
      expect(result.score).toBe(1);
      expect(result.isStrong).toBe(false);
      expect(result.feedback).toHaveLength(4);
      expect(result.feedback).toContain('Password should be at least 8 characters long');
      expect(result.feedback).toContain('Password should contain at least one uppercase letter');
      expect(result.feedback).toContain('Password should contain at least one number');
      expect(result.feedback).toContain('Password should contain at least one special character');
    });

    it('should provide specific feedback for missing requirements', () => {
      const result = ValidationUtils.getPasswordStrength('password');
      
      expect(result.score).toBe(2);
      expect(result.feedback).toContain('Password should contain at least one uppercase letter');
      expect(result.feedback).toContain('Password should contain at least one number');
      expect(result.feedback).toContain('Password should contain at least one special character');
    });
  });

  describe('validateUserInput', () => {
    it('should validate safe input', () => {
      const result = ValidationUtils.validateUserInput('Hello World');
      
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('Hello World');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect and log SQL injection attempts', () => {
      const result = ValidationUtils.validateUserInput("'; DROP TABLE users; --");
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input contains potentially dangerous content');
      expect(logger.warn).toHaveBeenCalledWith('Potential SQL injection detected', expect.any(Object));
    });

    it('should detect and log XSS attempts', () => {
      const result = ValidationUtils.validateUserInput('<script>alert("xss")</script>');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input contains potentially dangerous content');
      expect(logger.warn).toHaveBeenCalledWith('Potential XSS detected', expect.any(Object));
    });

    it('should validate length constraints', () => {
      const result = ValidationUtils.validateUserInput('Very long input that exceeds the limit', { maxLength: 20 });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input is too long (max 20 characters)');
    });

    it('should sanitize HTML when not allowed', () => {
      const result = ValidationUtils.validateUserInput('<p>Hello</p>', { allowHtml: false });
      
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('&lt;p&gt;Hello&lt;/p&gt;');
    });

    it('should preserve HTML when allowed', () => {
      const result = ValidationUtils.validateUserInput('<p>Hello</p>', { allowHtml: true, allowSpecialChars: true });
      
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('<p>Hello</p>');
    });

    it('should sanitize HTML when not allowed', () => {
      const result = ValidationUtils.validateUserInput('<p>Hello</p>', { allowHtml: false });
      
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('&lt;p&gt;Hello&lt;/p&gt;');
    });

    it('should sanitize special characters when not allowed', () => {
      const result = ValidationUtils.validateUserInput('<script>alert("xss")</script>', { allowSpecialChars: false });
      
      expect(result.isValid).toBe(false);
      expect(result.sanitized).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });
  });

  describe('validateFileUpload', () => {
    it('should validate valid file uploads', () => {
      const file = new File([''], 'test.csv', { type: 'text/csv' });
      const options = {
        maxSize: 1024 * 1024, // 1MB
        allowedTypes: ['text/csv', 'application/json'],
        allowedExtensions: ['.csv', '.json'],
      };
      
      const result = ValidationUtils.validateFileUpload(file, options);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid file types', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const options = {
        maxSize: 1024 * 1024,
        allowedTypes: ['text/csv', 'application/json'],
        allowedExtensions: ['.csv', '.json'],
      };
      
      const result = ValidationUtils.validateFileUpload(file, options);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File type text/plain is not allowed');
    });

    it('should reject oversized files', () => {
      const file = new File(['x'.repeat(2 * 1024 * 1024)], 'test.csv', { type: 'text/csv' });
      const options = {
        maxSize: 1024 * 1024, // 1MB
        allowedTypes: ['text/csv'],
        allowedExtensions: ['.csv'],
      };
      
      const result = ValidationUtils.validateFileUpload(file, options);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size exceeds maximum limit of 1MB');
    });

    it('should reject invalid file extensions', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const options = {
        maxSize: 1024 * 1024,
        allowedTypes: ['text/plain'],
        allowedExtensions: ['.csv', '.json'],
      };
      
      const result = ValidationUtils.validateFileUpload(file, options);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File extension .txt is not allowed');
    });
  });

  describe('createRateLimiter', () => {
    it('should allow requests within rate limit', () => {
      const rateLimiter = ValidationUtils.createRateLimiter(3, 1000); // 3 requests per second
      
      expect(rateLimiter('user1')).toBe(true);
      expect(rateLimiter('user1')).toBe(true);
      expect(rateLimiter('user1')).toBe(true);
    });

    it('should block requests exceeding rate limit', () => {
      const rateLimiter = ValidationUtils.createRateLimiter(2, 1000); // 2 requests per second
      
      expect(rateLimiter('user1')).toBe(true);
      expect(rateLimiter('user1')).toBe(true);
      expect(rateLimiter('user1')).toBe(false); // Blocked
    });

    it('should reset rate limit after time window', async () => {
      const rateLimiter = ValidationUtils.createRateLimiter(1, 100); // 1 request per 100ms
      
      expect(rateLimiter('user1')).toBe(true);
      expect(rateLimiter('user1')).toBe(false); // Blocked
      
      // Wait for time window to pass
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(rateLimiter('user1')).toBe(true); // Allowed again
    });

    it('should track different users separately', () => {
      const rateLimiter = ValidationUtils.createRateLimiter(1, 1000); // 1 request per second
      
      expect(rateLimiter('user1')).toBe(true);
      expect(rateLimiter('user1')).toBe(false); // Blocked
      
      expect(rateLimiter('user2')).toBe(true); // Different user allowed
    });

    it('should log rate limit violations', () => {
      const rateLimiter = ValidationUtils.createRateLimiter(1, 1000);
      
      rateLimiter('user1'); // First request
      rateLimiter('user1'); // Second request (blocked)
      
      expect(logger.warn).toHaveBeenCalledWith('Rate limit exceeded', expect.any(Object));
    });
  });

  describe('exported functions', () => {
    it('should export all validation functions', () => {
      const {
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
      } = require('../validation');

      expect(typeof isValidEmail).toBe('function');
      expect(typeof isValidUrl).toBe('function');
      expect(typeof isValidFileType).toBe('function');
      expect(typeof isValidFileSize).toBe('function');
      expect(typeof sanitizeString).toBe('function');
      expect(typeof sanitizeHtml).toBe('function');
      expect(typeof containsSqlInjection).toBe('function');
      expect(typeof containsXss).toBe('function');
      expect(typeof isValidLength).toBe('function');
      expect(typeof isValidNumber).toBe('function');
      expect(typeof isValidInteger).toBe('function');
      expect(typeof isValidDate).toBe('function');
      expect(typeof isValidPhoneNumber).toBe('function');
      expect(typeof getPasswordStrength).toBe('function');
      expect(typeof validateUserInput).toBe('function');
      expect(typeof validateFileUpload).toBe('function');
      expect(typeof createRateLimiter).toBe('function');
    });
  });
});
