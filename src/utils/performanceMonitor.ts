import { logger } from './logger';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private marks: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing an operation
  startTimer(operation: string): void {
    this.marks.set(operation, performance.now());
  }

  // End timing an operation and log it
  endTimer(operation: string, additionalData?: Record<string, unknown>): void {
    const startTime = this.marks.get(operation);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.marks.delete(operation);
      
      logger.info(`Performance: ${operation}`, {
        actionType: 'performance',
        operation,
        duration: Math.round(duration),
        ...additionalData
      });
    }
  }

  // Monitor page load performance
  monitorPageLoad(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            logger.info('Page Load Performance', {
              actionType: 'performance',
              operation: 'page_load',
              domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
              loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
              totalLoadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
              url: window.location.href,
            });
          }
        }, 0);
      });
    }
  }

  // Monitor long tasks (blocking operations)
  monitorLongTasks(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const longTask = entry as PerformanceEntry;
            if (longTask.duration > 50) { // Log tasks longer than 50ms
              logger.warn('Long Task Detected', {
                actionType: 'performance',
                operation: 'long_task',
                duration: Math.round(longTask.duration),
                startTime: Math.round(longTask.startTime),
                name: longTask.name,
                entryType: longTask.entryType,
                url: window.location.href,
              });
            }
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        // PerformanceObserver might not be supported in all browsers
        logger.debug('PerformanceObserver not supported');
      }
    }
  }

  // Monitor memory usage (if available)
  monitorMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      logger.info('Memory Usage', {
        actionType: 'performance',
        operation: 'memory_usage',
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
        url: window.location.href,
      });
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 