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

  constructor() {
    this.seqUrl = import.meta.env.VITE_SEQ_URL || '';
    this.apiKey = import.meta.env.VITE_SEQ_API_KEY;
    this.environment = 'production'; // Default to production for Seq
    this.correlationId = this.generateCorrelationId();
    this.sessionId = this.generateSessionId();
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
    // Check if we have Seq configuration - if not, log to console
    if (!this.seqUrl || !this.apiKey) {
      // Log to console with full details
      const consoleMethod = entry.level === 'error' ? 'error' : 
                           entry.level === 'warn' ? 'warn' : 
                           entry.level === 'info' ? 'info' : 'log';
      
      // eslint-disable-next-line no-console
      console[consoleMethod](
        `[${entry.level.toUpperCase()}] ${entry.message}`,
        {
          ...entry.properties,
          correlationId: entry.correlationId,
          sessionId: entry.sessionId,
          userId: entry.userId,
          environment: entry.environment,
          timestamp: entry.timestamp
        }
      );
      return;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['X-Seq-ApiKey'] = this.apiKey;
      }

      await fetch(`${this.seqUrl}/api/events/raw`, {
        method: 'POST',
        headers,
        body: JSON.stringify([entry]),
      });
    } catch (error) {
      // Fallback to console if Seq is unavailable
      // eslint-disable-next-line no-console
      console.error('Failed to send log to Seq:', error);
      // eslint-disable-next-line no-console
      console.log('Original log entry:', entry);
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