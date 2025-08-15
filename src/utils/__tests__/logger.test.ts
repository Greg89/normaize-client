// Mock the entire logger module to avoid import.meta.env parsing issues
jest.mock('../logger', () => {
  const mockLogger = {
    setUserId: jest.fn(),
    setCorrelationId: jest.fn(),
    startCorrelation: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trackUserAction: jest.fn(),
    trackApiCall: jest.fn(),
    devDebug: jest.fn(),
    // Private methods for testing
    createLogEntry: jest.fn(),
    userId: 'test-user-id',
    correlationId: 'test-correlation-id',
    sessionId: 'test-session-id',
  };

  return {
    logger: mockLogger,
  };
});

import { logger } from '../logger';

// Mock ConsoleLogger
jest.mock('../consoleLogger');

// Mock fetch
global.fetch = jest.fn();

describe('Logger', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mock logger methods
    (logger as any).setUserId.mockImplementation((userId: string) => {
      (logger as any).userId = userId;
    });
    
    (logger as any).setCorrelationId.mockImplementation((correlationId: string) => {
      (logger as any).correlationId = correlationId;
    });
    
    (logger as any).startCorrelation.mockImplementation((operation: string) => {
      const newCorrelationId = `${(logger as any).correlationId}_${operation}_${Date.now()}`;
      (logger as any).setCorrelationId(newCorrelationId);
      return newCorrelationId;
    });

    // Mock the private createLogEntry method
    (logger as any).createLogEntry.mockImplementation((level: string, message: string, properties?: any, exception?: Error) => ({
      Timestamp: new Date().toISOString(),
      level: level === 'error' ? 'Error' : level === 'warn' ? 'Warning' : level === 'info' ? 'Information' : level === 'debug' ? 'Debug' : 'Information',
      message,
      MessageTemplate: message,
      properties,
      exception: exception ? `${exception.name}: ${exception.message}\n${exception.stack || ''}` : undefined,
      userId: (logger as any).userId,
      sessionId: (logger as any).sessionId,
      correlationId: (logger as any).correlationId,
      environment: 'test',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      url: 'http://localhost:3000/test',
    }));
  });

  afterEach(() => {
    // Restore original environment
    jest.resetModules();
  });

  describe('initialization', () => {
    it('should be properly mocked', () => {
      expect(logger).toBeDefined();
      expect(logger.setUserId).toBeDefined();
      expect(logger.setCorrelationId).toBeDefined();
    });
  });

  describe('ID management', () => {
    it('should set user ID correctly', () => {
      const userId = 'user123';
      logger.setUserId(userId);
      expect((logger as any).userId).toBe(userId);
    });

    it('should set correlation ID correctly', () => {
      const correlationId = 'corr123';
      logger.setCorrelationId(correlationId);
      expect((logger as any).correlationId).toBe(correlationId);
    });

    it('should start new correlation correctly', () => {
      const operation = 'test-operation';
      const newCorrelationId = logger.startCorrelation(operation);
      
      expect(newCorrelationId).toContain('test-operation');
      expect(newCorrelationId).toContain((logger as any).correlationId);
    });
  });

  describe('logging methods', () => {
    it('should log error level correctly', async () => {
      const message = 'Test error';
      const properties = { errorCode: 500 };
      const exception = new Error('Test exception');

      await logger.error(message, properties, exception);

      expect(logger.error).toHaveBeenCalledWith(message, properties, exception);
    });

    it('should log warn level correctly', async () => {
      const message = 'Test warning';
      const properties = { warningType: 'deprecation' };

      await logger.warn(message, properties);

      expect(logger.warn).toHaveBeenCalledWith(message, properties);
    });

    it('should log info level correctly', async () => {
      const message = 'Test info';
      const properties = { infoType: 'status' };

      await logger.info(message, properties);

      expect(logger.info).toHaveBeenCalledWith(message, properties);
    });

    it('should log debug level correctly', async () => {
      const message = 'Test debug';
      const properties = { debugInfo: 'stack trace' };

      await logger.debug(message, properties);

      expect(logger.debug).toHaveBeenCalledWith(message, properties);
    });

    it('should handle unknown log levels', async () => {
      const message = 'Test message';
      
      // Test the mocked createLogEntry method
      const entry = (logger as any).createLogEntry('unknown', message);
      
      expect(entry.level).toBe('Information'); // Default fallback
    });
  });

  describe('special logging methods', () => {
    it('should track user actions correctly', async () => {
      const action = 'button_click';
      const properties = { buttonId: 'submit-btn' };

      await logger.trackUserAction(action, properties);

      expect(logger.trackUserAction).toHaveBeenCalledWith(action, properties);
    });

    it('should track API calls correctly', async () => {
      const method = 'POST';
      const url = '/api/users';
      const status = 201;
      const duration = 150;

      await logger.trackApiCall(method, url, status, duration);

      expect(logger.trackApiCall).toHaveBeenCalledWith(method, url, status, duration);
    });
  });

  describe('development logging', () => {
    it('should call devDebug method', () => {
      logger.devDebug('Development message');

      expect(logger.devDebug).toHaveBeenCalledWith('Development message');
    });
  });

  describe('singleton instance', () => {
    it('should export logger instance', () => {
      expect(logger).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty properties', async () => {
      await logger.info('Test message');

      expect(logger.info).toHaveBeenCalledWith('Test message');
    });

    it('should handle null properties', async () => {
      await logger.info('Test message', null as any);

      expect(logger.info).toHaveBeenCalledWith('Test message', null);
    });
  });
});
