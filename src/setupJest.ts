// Mock import.meta.env for Jest - this must be done before any modules are loaded
if (typeof global !== 'undefined') {
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
    configurable: true,
  });
}

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
  // Suppress React Router deprecation warnings
  if (args[0] && typeof args[0] === 'string' && args[0].includes('React Router')) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

console.error = (...args: any[]) => {
  // Suppress jsdom navigation errors
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Not implemented: navigation')) {
    return;
  }
  originalConsoleError.call(console, ...args);
};


