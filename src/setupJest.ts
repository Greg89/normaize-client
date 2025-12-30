// Extend globalThis with import.meta.env for Jest compatibility
type ImportMetaEnv = {
  VITE_API_URL: string;
  VITE_SEQ_URL: string;
  VITE_SEQ_API_KEY: string;
  VITE_NODE_ENV: string;
  VITE_SENTRY_DSN: string;
  VITE_AUTH0_DOMAIN: string;
  VITE_AUTH0_CLIENT_ID: string;
  VITE_AUTH0_AUDIENCE: string;
};

type ImportMeta = {
  env: ImportMetaEnv;
};

declare global {
  // Augment globalThis to include the importMeta property
  // eslint-disable-next-line no-var
  var importMeta: { meta: ImportMeta };
  interface GlobalThis {
    importMeta: { meta: ImportMeta };
  }
}

globalThis.importMeta = {
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
};

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

console.warn = (...args: unknown[]) => {
  // Suppress React Router deprecation warnings
  if (args[0] && typeof args[0] === 'string' && args[0].includes('React Router')) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

console.error = (...args: unknown[]) => {
  // Suppress jsdom navigation errors
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Not implemented: navigation')) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

export {};
