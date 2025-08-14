export const Sentry = {
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
  showReportDialog: jest.fn(),
  close: jest.fn(),
};

export const setSentryUser = jest.fn();
export const clearSentryUser = jest.fn();
export const initSentry = jest.fn();
export const captureError = jest.fn();
export const captureMessage = jest.fn();
export const setSentryTag = jest.fn();
export const setSentryContext = jest.fn();
