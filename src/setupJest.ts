// Mock import.meta.env for Jest
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:5000',
        VITE_SEQ_URL: 'http://localhost:5341',
        VITE_SEQ_API_KEY: 'test-api-key',
        VITE_NODE_ENV: 'test',
        VITE_SENTRY_DSN: 'test-sentry-dsn',
        VITE_AUTH0_DOMAIN: 'test.auth0.com',
        VITE_AUTH0_CLIENT_ID: 'test-client-id',
        VITE_AUTH0_AUDIENCE: 'test-audience',
      },
    },
  },
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn();

// Mock console methods to reduce noise in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = (...args: any[]) => {
  // Suppress specific warnings that are expected in tests
  if (args[0]?.includes?.('Failed to track global error metrics')) {
    return;
  }
  if (args[0]?.includes?.('Failed to log error')) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

console.error = (...args: any[]) => {
  // Suppress specific errors that are expected in tests
  if (args[0]?.includes?.('Failed to track global error metrics')) {
    return;
  }
  if (args[0]?.includes?.('Failed to log error')) {
    return;
  }
  originalConsoleError.call(console, ...args);
};


