import { logger } from './logger';
import { ErrorHandler, ErrorType, ErrorSeverity } from './errorHandling';

// Global error handler configuration
interface GlobalErrorHandlerConfig {
  enableConsoleLogging: boolean;
  enableToastNotifications: boolean;
  maxErrorsPerMinute: number;
  ignoredErrorPatterns: RegExp[];
  criticalErrorPatterns: RegExp[];
}

// Default configuration
const DEFAULT_CONFIG: GlobalErrorHandlerConfig = {
  enableConsoleLogging: true,
  enableToastNotifications: true,
  maxErrorsPerMinute: 20,
  ignoredErrorPatterns: [
    /Script error\.?$/, // Generic script errors from external sources
    /ResizeObserver loop limit exceeded/, // Common browser warning
    /Non-Error promise rejection/, // Generic promise rejections
    /Failed to fetch/, // Network errors that are handled elsewhere
  ],
  criticalErrorPatterns: [
    /Out of memory/i,
    /Maximum call stack size exceeded/i,
    /Script timeout/i,
    /Internal server error/i,
  ],
};

// Global error handler for unhandled JavaScript errors
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private config: GlobalErrorHandlerConfig;
  private errorCount = 0;
  private lastErrorReset = Date.now();
  private readonly ERROR_RESET_INTERVAL = 60000; // 1 minute

  private constructor(config: Partial<GlobalErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupErrorHandlers();
  }

  static getInstance(config?: Partial<GlobalErrorHandlerConfig>): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler(config);
    }
    return GlobalErrorHandler.instance;
  }

  private setupErrorHandlers(): void {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', this.handleJavaScriptError.bind(this));

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));

    // Handle resource loading errors (images, scripts, etc.)
    window.addEventListener('error', this.handleResourceError.bind(this), true);

    // Handle network errors (offline/online events)
    window.addEventListener('offline', this.handleOfflineEvent.bind(this));
    window.addEventListener('online', this.handleOnlineEvent.bind(this));

    // Handle visibility change events
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Handle beforeunload events
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    // Handle page unload events
    window.addEventListener('unload', this.handleUnloadEvent.bind(this));

    // Log successful initialization
    logger.info('Global error handlers initialized successfully', {
      config: this.config,
      timestamp: new Date().toISOString(),
    });
  }

  private handleJavaScriptError(event: ErrorEvent): void {
    // Check if error should be ignored
    if (this.shouldIgnoreError(event.message)) {
      return;
    }

    // Check rate limiting
    if (this.isRateLimited()) {
      return;
    }

    // Determine error severity
    const severity = this.determineErrorSeverity(event.message, event.error);
    
    // Create error info
    const errorInfo = {
      type: this.determineErrorType(event.message),
      severity,
      message: event.message,
      code: event.error?.name || 'JAVASCRIPT_ERROR',
      context: 'global_error_handler',
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: event.error?.stack,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        errorType: 'javascript_error',
      },
    };

    // Log the error
    this.logError(errorInfo);

    // Show user notification if enabled and error is significant
    if (this.config.enableToastNotifications && severity !== ErrorSeverity.LOW) {
      this.showUserNotification(errorInfo);
    }

    // Track error metrics
    this.trackError(errorInfo);
  }

  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    // Check rate limiting
    if (this.isRateLimited()) {
      return;
    }

    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    
    // Check if error should be ignored
    if (this.shouldIgnoreError(message)) {
      return;
    }

    // Determine error severity
    const severity = this.determineErrorSeverity(message, reason);
    
    // Create error info
    const errorInfo = {
      type: this.determineErrorType(message),
      severity,
      message: `Unhandled Promise Rejection: ${message}`,
      code: reason instanceof Error ? reason.name : 'PROMISE_REJECTION',
      context: 'global_error_handler',
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: reason instanceof Error ? reason.stack : undefined,
      metadata: {
        errorType: 'promise_rejection',
        reason: reason,
      },
    };

    // Log the error
    const logData: { severity: ErrorSeverity; message: string; metadata?: unknown; stack?: string } = {
      severity: errorInfo.severity,
      message: errorInfo.message,
      metadata: errorInfo.metadata,
    };
    
    if (errorInfo.stack !== undefined) {
      logData.stack = errorInfo.stack;
    }
    
    this.logError(logData);

    // Show user notification if enabled and error is significant
    if (this.config.enableToastNotifications && severity !== ErrorSeverity.LOW) {
      this.showUserNotification(errorInfo);
    }

    // Track error metrics
    this.trackError(errorInfo);
  }

  private handleResourceError(event: ErrorEvent): void {
    // Only handle resource loading errors (not window errors)
    if (event.target === window) {
      return;
    }

    const target = event.target as HTMLElement;
    const resourceType = target.tagName.toLowerCase();
    
    // Check if error should be ignored
    if (this.shouldIgnoreResourceError(resourceType, target)) {
      return;
    }

    // Create error info for resource loading issues
    const errorInfo = {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.LOW,
      message: `Resource loading error: ${resourceType}`,
      code: 'RESOURCE_LOADING_ERROR',
      context: 'global_error_handler',
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata: {
        tagName: target.tagName,
        src: (target as HTMLImageElement | HTMLScriptElement).src,
        href: (target as HTMLLinkElement).href,
        errorType: 'resource_loading_error',
      },
    };

    // Log the warning
    logger.warn('Resource Loading Error', errorInfo.metadata);
  }

  private handleOfflineEvent(): void {
    const errorInfo = {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      message: 'Browser went offline',
      code: 'BROWSER_OFFLINE',
      context: 'global_error_handler',
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    logger.warn('Browser went offline', { url: window.location.href });
    
    // Show user notification
    if (this.config.enableToastNotifications) {
      this.showUserNotification(errorInfo);
    }
  }

  private handleOnlineEvent(): void {
    logger.info('Browser came back online', { url: window.location.href });
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      logger.debug('Page became hidden', { url: window.location.href });
    } else {
      logger.debug('Page became visible', { url: window.location.href });
    }
  }

  private handleBeforeUnload(): void {
    logger.info('Page unloading', { url: window.location.href });
  }

  private handleUnloadEvent(): void {
    // Use sendBeacon for reliable logging during page unload
    try {
      const data = JSON.stringify({
        event: 'page_unload',
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/logs', data);
      }
    } catch (error) {
      // Ignore errors during unload
    }
  }

  private shouldIgnoreError(message: string): boolean {
    return this.config.ignoredErrorPatterns.some(pattern => pattern.test(message));
  }

  private shouldIgnoreResourceError(resourceType: string, target: HTMLElement): boolean {
    // Ignore certain resource types or specific patterns
    const ignoredTypes = ['img', 'link'];
    const ignoredPatterns = [
      /favicon\.ico$/,
      /analytics\.js$/,
      /tracking\.js$/,
    ];

    if (ignoredTypes.includes(resourceType)) {
      const src = (target as { src?: string; href?: string }).src || (target as { src?: string; href?: string }).href;
      if (src && ignoredPatterns.some(pattern => pattern.test(src))) {
        return true;
      }
    }

    return false;
  }

  private determineErrorType(message: string): ErrorType {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('network') || messageLower.includes('fetch') || messageLower.includes('timeout')) {
      return ErrorType.NETWORK;
    }
    if (messageLower.includes('validation') || messageLower.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    if (messageLower.includes('auth') || messageLower.includes('unauthorized') || messageLower.includes('forbidden')) {
      return messageLower.includes('forbidden') ? ErrorType.AUTHORIZATION : ErrorType.AUTHENTICATION;
    }
    if (messageLower.includes('server') || messageLower.includes('500')) {
      return ErrorType.SERVER;
    }
    if (messageLower.includes('timeout')) {
      return ErrorType.TIMEOUT;
    }
    if (messageLower.includes('rate limit') || messageLower.includes('too many requests')) {
      return ErrorType.RATE_LIMIT;
    }
    
    return ErrorType.UNKNOWN;
  }

  private determineErrorSeverity(message: string, error?: Error): ErrorSeverity {
    // Check for critical error patterns
    if (this.config.criticalErrorPatterns.some(pattern => pattern.test(message))) {
      return ErrorSeverity.CRITICAL;
    }

    // Check for specific error types that indicate high severity
    if (error?.name === 'RangeError' || error?.name === 'ReferenceError') {
      return ErrorSeverity.HIGH;
    }

    // Check message content for severity indicators
    const messageLower = message.toLowerCase();
    if (messageLower.includes('out of memory') || messageLower.includes('stack overflow')) {
      return ErrorSeverity.CRITICAL;
    }
    if (messageLower.includes('uncaught') || messageLower.includes('unhandled')) {
      return ErrorSeverity.HIGH;
    }

    return ErrorSeverity.MEDIUM;
  }

  private isRateLimited(): boolean {
    const now = Date.now();
    
    // Reset counter if interval has passed
    if (now - this.lastErrorReset > this.ERROR_RESET_INTERVAL) {
      this.errorCount = 0;
      this.lastErrorReset = now;
    }

    if (this.errorCount >= this.config.maxErrorsPerMinute) {
      return true;
    }

    this.errorCount++;
    return false;
  }

  private async logError(errorInfo: { severity: ErrorSeverity; message: string; metadata?: unknown; stack?: string }): Promise<void> {
    try {
      switch (errorInfo.severity) {
        case ErrorSeverity.CRITICAL:
          await logger.error(`CRITICAL: ${errorInfo.message}`, errorInfo.metadata as Record<string, unknown> | undefined, new Error(errorInfo.stack || ''));
          break;
        case ErrorSeverity.HIGH:
          await logger.error(`HIGH: ${errorInfo.message}`, errorInfo.metadata as Record<string, unknown> | undefined, new Error(errorInfo.stack || ''));
          break;
        case ErrorSeverity.MEDIUM:
          await logger.warn(`MEDIUM: ${errorInfo.message}`, errorInfo.metadata as Record<string, unknown> | undefined);
          break;
        case ErrorSeverity.LOW:
          await logger.info(`LOW: ${errorInfo.message}`, errorInfo.metadata as Record<string, unknown> | undefined);
          break;
      }
    } catch (loggingError) {
      // Fallback to console if logging fails
      if (this.config.enableConsoleLogging) {
        logger.error('Failed to log error:', loggingError instanceof Error ? { error: loggingError.message } : { error: String(loggingError) });
        logger.error('Original error:', errorInfo);
      }
    }
  }

  private showUserNotification(errorInfo: { message: string; context?: string; severity: ErrorSeverity }): void {
    // Use the ErrorHandler to show user-friendly messages
    ErrorHandler.handle(
      new Error(errorInfo.message),
      errorInfo.context,
      errorInfo.severity
    );
  }

  private async trackError(errorInfo: { type: string; severity: ErrorSeverity; context?: string; code?: string }): Promise<void> {
    try {
      await logger.trackUserAction('global_error_occurred', {
        errorType: errorInfo.type,
        severity: errorInfo.severity,
        context: errorInfo.context,
        code: errorInfo.code,
      });
    } catch (trackingError) {
      // Don't let tracking errors interfere with main error handling
      if (this.config.enableConsoleLogging) {
        logger.warn('Failed to track global error metrics:', trackingError instanceof Error ? { error: trackingError.message } : { error: String(trackingError) });
      }
    }
  }

  // Public methods for configuration and control
  updateConfig(newConfig: Partial<GlobalErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Global error handler configuration updated', { newConfig });
  }

  resetErrorCount(): void {
    this.errorCount = 0;
    this.lastErrorReset = Date.now();
  }

  getCurrentConfig(): GlobalErrorHandlerConfig {
    return { ...this.config };
  }
}

// Export the setup function for backward compatibility
export const setupGlobalErrorHandlers = (config?: Partial<GlobalErrorHandlerConfig>): GlobalErrorHandler => {
  return GlobalErrorHandler.getInstance(config);
};

// Export types for advanced usage
export type { GlobalErrorHandlerConfig }; 