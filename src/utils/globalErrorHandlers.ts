import { logger } from './logger';

// Global error handler for unhandled JavaScript errors
export const setupGlobalErrorHandlers = (): void => {
  // Handle unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    logger.error('Unhandled JavaScript Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
      url: window.location.href,
    }, event.error);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', {
      reason: event.reason,
      promise: event.promise,
      url: window.location.href,
    }, event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
  });

  // Handle resource loading errors (images, scripts, etc.)
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      const target = event.target as HTMLElement;
      logger.warn('Resource Loading Error', {
        tagName: target.tagName,
        src: (target as HTMLImageElement | HTMLScriptElement).src,
        href: (target as HTMLLinkElement).href,
        url: window.location.href,
      });
    }
  }, true);

  // Handle network errors (offline/online events)
  window.addEventListener('offline', () => {
    logger.warn('Browser went offline', {
      url: window.location.href,
    });
  });

  window.addEventListener('online', () => {
    logger.info('Browser came back online', {
      url: window.location.href,
    });
  });
}; 