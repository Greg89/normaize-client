import { ConsoleLogger } from '../consoleLogger';

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Store original console methods
const originalConsole = { ...console };

describe('ConsoleLogger', () => {
  beforeEach(() => {
    // Replace console methods with mocks
    Object.defineProperty(global, 'console', {
      value: mockConsole,
      writable: true,
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original console methods
    Object.defineProperty(global, 'console', {
      value: originalConsole,
      writable: true,
    });
  });

  describe('log method', () => {
    it('should log error level correctly', () => {
      const message = 'Test error message';
      const data = { key: 'value' };

      ConsoleLogger.log('error', message, data);

      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test error message', data);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('should log warn level correctly', () => {
      const message = 'Test warning message';
      const data = { key: 'value' };

      ConsoleLogger.log('warn', message, data);

      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Test warning message', data);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    });

    it('should log info level correctly', () => {
      const message = 'Test info message';
      const data = { key: 'value' };

      ConsoleLogger.log('info', message, data);

      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Test info message', data);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    it('should log debug level correctly', () => {
      const message = 'Test debug message';
      const data = { key: 'value' };

      ConsoleLogger.log('debug', message, data);

      expect(mockConsole.log).toHaveBeenCalledWith('[DEBUG] Test debug message', data);
      expect(mockConsole.log).toHaveBeenCalledTimes(1);
    });

    it('should log with default level when unknown level provided', () => {
      const message = 'Test message';
      const data = { key: 'value' };

      ConsoleLogger.log('unknown', message, data);

      expect(mockConsole.log).toHaveBeenCalledWith('[UNKNOWN] Test message', data);
      expect(mockConsole.log).toHaveBeenCalledTimes(1);
    });

    it('should log without data when no data provided', () => {
      const message = 'Test message';

      ConsoleLogger.log('info', message);

      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Test message', undefined);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    it('should handle empty message', () => {
      const message = '';
      const data = { key: 'value' };

      ConsoleLogger.log('info', message, data);

      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] ', data);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in message', () => {
      const message = 'Test message with special chars: !@#$%^&*()';
      const data = { key: 'value' };

      ConsoleLogger.log('info', message, data);

      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Test message with special chars: !@#$%^&*()', data);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });
  });

  describe('error method', () => {
    it('should call log with error level', () => {
      const message = 'Test error';
      const data = { errorCode: 500 };

      ConsoleLogger.error(message, data);

      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test error', data);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('should call log with error level without data', () => {
      const message = 'Test error';

      ConsoleLogger.error(message);

      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test error', undefined);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('warn method', () => {
    it('should call log with warn level', () => {
      const message = 'Test warning';
      const data = { warningType: 'deprecation' };

      ConsoleLogger.warn(message, data);

      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Test warning', data);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    });

    it('should call log with warn level without data', () => {
      const message = 'Test warning';

      ConsoleLogger.warn(message);

      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Test warning', undefined);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('info method', () => {
    it('should call log with info level', () => {
      const message = 'Test info';
      const data = { infoType: 'status' };

      ConsoleLogger.info(message, data);

      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Test info', data);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });

    it('should call log with info level without data', () => {
      const message = 'Test info';

      ConsoleLogger.info(message);

      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Test info', undefined);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
    });
  });

  describe('debug method', () => {
    it('should call log with debug level', () => {
      const message = 'Test debug';
      const data = { debugInfo: 'stack trace' };

      ConsoleLogger.debug(message, data);

      expect(mockConsole.log).toHaveBeenCalledWith('[DEBUG] Test debug', data);
      expect(mockConsole.log).toHaveBeenCalledTimes(1);
    });

    it('should call log with debug level without data', () => {
      const message = 'Test debug';

      ConsoleLogger.debug(message);

      expect(mockConsole.log).toHaveBeenCalledWith('[DEBUG] Test debug', undefined);
      expect(mockConsole.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle null data', () => {
      const message = 'Test message';
      const data = null;

      ConsoleLogger.log('info', message, data as unknown);

      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Test message', null);
    });

    it('should handle undefined data', () => {
      const message = 'Test message';
      const data = undefined;

      ConsoleLogger.log('info', message, data);

      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Test message', undefined);
    });

    it('should handle empty object data', () => {
      const message = 'Test message';
      const data = {};

      ConsoleLogger.log('info', message, data);

      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Test message', {});
    });

    it('should handle complex data objects', () => {
      const message = 'Test message';
      const data = {
        nested: {
          deep: {
            value: 'test',
            array: [1, 2, 3],
            nullValue: null,
            undefinedValue: undefined,
          },
        },
        function: () => 'test',
        symbol: Symbol('test'),
      };

      ConsoleLogger.log('info', message, data);

      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Test message', data);
    });
  });
});

