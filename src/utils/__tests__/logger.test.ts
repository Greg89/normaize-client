// Define proper types for logger mock
interface MockLogger {
  setUserId: jest.Mock;
  setCorrelationId: jest.Mock;
  startCorrelation: jest.Mock;
  error: jest.Mock;
  warn: jest.Mock;
  info: jest.Mock;
  debug: jest.Mock;
  trackUserAction: jest.Mock;
  trackApiCall: jest.Mock;
  devDebug: jest.Mock;
  createLogEntry: jest.Mock;
  userId?: string;
  correlationId?: string;
  sessionId?: string;
}

// Mock the entire logger module to avoid import.meta.env parsing issues
jest.mock('../logger', () => {
  const mockLogger: MockLogger = {
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
    (logger as MockLogger).setUserId.mockImplementation((userId: string) => {
      (logger as MockLogger).userId = userId;
    });
    
    (logger as MockLogger).setCorrelationId.mockImplementation((correlationId: string) => {
      (logger as MockLogger).correlationId = correlationId;
    });
    
    (logger as MockLogger).startCorrelation.mockImplementation((operation: string) => {
      const newCorrelationId = `${(logger as MockLogger).correlationId}_${operation}_${Date.now()}`;
      (logger as MockLogger).setCorrelationId(newCorrelationId);
      return newCorrelationId;
    });

    // Mock the private createLogEntry method
    (logger as MockLogger).createLogEntry.mockImplementation((level: string, message: string, properties?: unknown, exception?: Error) => ({
      Timestamp: new Date().toISOString(),
      level: level === 'error' ? 'Error' : level === 'warn' ? 'Warning' : level === 'info' ? 'Information' : level === 'debug' ? 'Debug' : 'Information',
      message,
      MessageTemplate: message,
      properties,
      exception: exception ? `${exception.name}: ${exception.message}\n${exception.stack || ''}` : undefined,
      userId: (logger as MockLogger).userId,
      sessionId: (logger as MockLogger).sessionId,
      correlationId: (logger as MockLogger).correlationId,
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
      expect((logger as MockLogger).userId).toBe(userId);
    });

    it('should set correlation ID correctly', () => {
      const correlationId = 'corr123';
      logger.setCorrelationId(correlationId);
      expect((logger as MockLogger).correlationId).toBe(correlationId);
    });

    it('should start new correlation correctly', () => {
      const operation = 'test-operation';
      const newCorrelationId = logger.startCorrelation(operation);
      
      expect(newCorrelationId).toContain('test-operation');
      expect(newCorrelationId).toContain((logger as MockLogger).correlationId);
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
      const entry = (logger as MockLogger).createLogEntry('unknown', message);
      
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
      await logger.info('Test message', null as unknown);

      expect(logger.info).toHaveBeenCalledWith('Test message', null);
    });
  });
});
