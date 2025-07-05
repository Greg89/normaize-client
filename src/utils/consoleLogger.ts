/* eslint-disable no-console */
// This file is specifically for console logging and is exempt from console rules

export class ConsoleLogger {
  static log(level: string, message: string, data?: Record<string, unknown>): void {
    const logMessage = `[${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'info':
        console.info(logMessage, data);
        break;
      default:
        console.log(logMessage, data);
    }
  }

  static error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  static warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  static info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  static debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }
} 