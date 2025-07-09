import { ConsoleLogger } from './consoleLogger';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  properties?: Record<string, unknown>;
  exception?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  environment: string;
  userAgent: string;
  url: string;
}

class Logger {
  private seqUrl: string;
  private apiKey?: string;
  private environment: string;
  private correlationId: string;
  private sessionId: string;
  private userId?: string;
  private isLogging = false; // Prevent recursive logging

  constructor() {
    this.seqUrl = import.meta.env.VITE_SEQ_URL || '';
    this.apiKey = import.meta.env.VITE_SEQ_API_KEY;
    this.environment = import.meta.env.VITE_NODE_ENV || 'production';
    this.correlationId = this.generateCorrelationId();
    this.sessionId = this.generateSessionId();
    
    // Enhanced initialization logging for debugging
    ConsoleLogger.info('Logger initialization', {
      hasSeqUrl: !!this.seqUrl,
      hasApiKey: !!this.apiKey,
      seqUrl: this.seqUrl || 'NOT_SET',
      environment: this.environment,
      origin: typeof window !== 'undefined' ? window.location.origin : 'SERVER_SIDE'
    });
    
    // Log initialization to console for debugging
    if (!this.seqUrl || !this.apiKey) {
      ConsoleLogger.info('Logger initialized without Seq configuration - using console logging only');
    } else {
      ConsoleLogger.info('Logger initialized with Seq configuration - will attempt to send logs to Seq');
    }
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  private async sendToSeq(entry: LogEntry): Promise<void> {
    // Prevent recursive logging
    if (this.isLogging) {
      ConsoleLogger.log(entry.level, entry.message, {
        ...entry.properties,
        correlationId: entry.correlationId,
        sessionId: entry.sessionId,
        userId: entry.userId,
        environment: entry.environment,
        timestamp: entry.timestamp,
        _recursive: true
      });
      return;
    }

    // Additional safety check for logging-related URLs
    if (entry.properties?.url && (entry.properties.url as string).includes('/api/events/raw')) {
      ConsoleLogger.log(entry.level, entry.message, {
        ...entry.properties,
        correlationId: entry.correlationId,
        sessionId: entry.sessionId,
        userId: entry.userId,
        environment: entry.environment,
        timestamp: entry.timestamp,
        _loggingUrl: true
      });
      return;
    }

    // Check if we have Seq configuration - if not, log to console
    if (!this.seqUrl || !this.apiKey) {
      // Log to console with full details
      ConsoleLogger.log(entry.level, entry.message, {
        ...entry.properties,
        correlationId: entry.correlationId,
        sessionId: entry.sessionId,
        userId: entry.userId,
        environment: entry.environment,
        timestamp: entry.timestamp
      });
      return;
    }

    this.isLogging = true;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['X-Seq-ApiKey'] = this.apiKey;
      }

      // Fix URL construction to prevent double slashes
      const seqUrl = this.seqUrl.endsWith('/') ? this.seqUrl.slice(0, -1) : this.seqUrl;
      const fullUrl = `${seqUrl}/api/events/raw`;
      
      // Debug logging for troubleshooting
      ConsoleLogger.debug('Attempting to send log to Seq', {
        seqUrl: this.seqUrl,
        fullUrl,
        hasApiKey: !!this.apiKey,
        origin: window.location.origin
      });

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify([entry]),
      });

      if (!response.ok) {
        throw new Error(`Seq responded with status ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Enhanced error logging for CORS and other issues
      const errorMessage = error instanceof Error ? error.message : String(error);
      ConsoleLogger.error('Failed to send log to Seq:', { 
        error: errorMessage,
        seqUrl: this.seqUrl,
        origin: window.location.origin,
        userAgent: navigator.userAgent
      });
      
      // Log the original entry to console as fallback
      ConsoleLogger.info('Original log entry (fallback):', entry as unknown as Record<string, unknown>);
    } finally {
      this.isLogging = false;
    }
  }

  private createLogEntry(
    level: string,
    message: string,
    properties?: Record<string, unknown>,
    exception?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      properties,
      exception: exception ? this.formatException(exception) : undefined,
      userId: this.userId,
      sessionId: this.sessionId,
      correlationId: this.correlationId,
      environment: this.environment,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  private formatException(error: Error): string {
    return `${error.name}: ${error.message}\n${error.stack || ''}`;
  }

  async error(message: string, properties?: Record<string, unknown>, exception?: Error): Promise<void> {
    const entry = this.createLogEntry('error', message, properties, exception);
    await this.sendToSeq(entry);
  }

  async warn(message: string, properties?: Record<string, unknown>): Promise<void> {
    const entry = this.createLogEntry('warn', message, properties);
    await this.sendToSeq(entry);
  }

  async info(message: string, properties?: Record<string, unknown>): Promise<void> {
    const entry = this.createLogEntry('info', message, properties);
    await this.sendToSeq(entry);
  }

  async debug(message: string, properties?: Record<string, unknown>): Promise<void> {
    const entry = this.createLogEntry('debug', message, properties);
    await this.sendToSeq(entry);
  }

  // Special method for tracking user actions
  async trackUserAction(action: string, properties?: Record<string, unknown>): Promise<void> {
    await this.info(`User Action: ${action}`, {
      actionType: 'user_action',
      ...properties
    });
  }

  // Special method for API calls
  async trackApiCall(method: string, url: string, status?: number, duration?: number): Promise<void> {
    await this.info(`API Call: ${method} ${url}`, {
      actionType: 'api_call',
      method,
      url,
      status,
      duration,
    });
  }

  // Method to start a new correlation for a specific operation
  startCorrelation(operation: string): string {
    const newCorrelationId = `${this.correlationId}_${operation}_${Date.now()}`;
    this.setCorrelationId(newCorrelationId);
    return newCorrelationId;
  }
}

// Create singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogEntry }; 