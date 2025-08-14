export const logger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  setUserId: jest.fn(),
  setContext: jest.fn(),
  clearContext: jest.fn(),
  log: jest.fn(),
  trace: jest.fn(),
  fatal: jest.fn(),
};
