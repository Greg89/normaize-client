import * as Sentry from '@sentry/react';
import { logger } from './logger';

export const initSentry = (): void => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_NODE_ENV || 'development';
  
  // Only initialize Sentry in production and beta environments
  if (!dsn || environment === 'development') {
    // eslint-disable-next-line no-console
    console.warn('Sentry disabled - running in development mode or DSN not configured');
    return;
  }

  Sentry.init({
    dsn,
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

    // Environment
    environment: import.meta.env.VITE_NODE_ENV || 'development',
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // Before sending to Sentry, also log to our Seq system
    beforeSend(event, hint) {
      // Log to our Seq system for correlation
      const error = hint.originalException;
      if (error instanceof Error) {
        logger.error('Sentry Error Captured', {
          sentryEventId: event.event_id,
          sentryLevel: event.level,
          sentryTags: event.tags,
          sentryContexts: event.contexts,
        }, error);
      }
      
      return event;
    },

    // Add user context when available
    beforeBreadcrumb(breadcrumb) {
      // Also log breadcrumbs to our system for correlation
      logger.debug('Sentry Breadcrumb', {
        sentryBreadcrumb: breadcrumb,
      });
      
      return breadcrumb;
    },
  });
};

// Set user context for Sentry (call this when user logs in)
export const setSentryUser = (user: { sub?: string; email?: string; name?: string }): void => {
  if (user.sub) {
    Sentry.setUser({
      id: user.sub,
      email: user.email,
      username: user.name,
    });
    
    // Also set in our logger for correlation
    logger.setUserId(user.sub);
  }
};

// Clear user context (call this when user logs out)
export const clearSentryUser = (): void => {
  Sentry.setUser(null);
};

// Add custom context to Sentry
export const setSentryContext = (name: string, data: Record<string, unknown>): void => {
  Sentry.setContext(name, data);
};

// Add tags to Sentry
export const setSentryTag = (key: string, value: string): void => {
  Sentry.setTag(key, value);
};

// Capture custom events in Sentry
export const captureSentryEvent = (
  message: string, 
  level: Sentry.SeverityLevel = 'info',
  extra?: Record<string, unknown>
): void => {
  Sentry.captureMessage(message, { level, extra });
  
  // Also log to our system for correlation
  logger.info(`Sentry Event: ${message}`, {
    sentryLevel: level,
    ...extra,
  });
};

// Export Sentry for direct use if needed
export { Sentry }; 