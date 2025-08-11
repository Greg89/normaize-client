import { logger } from './logger';

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
}

// Custom navigation timing interface for additional metrics
interface NavigationTiming {
  navigationStart: number;
  loadEventEnd: number;
  domContentLoadedEventEnd: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  pageLoadTime: number;
  domContentLoaded: number;
}

class PerformanceMonitor {
  private navigationObserver: PerformanceObserver | null = null;
  private paintObserver: PerformanceObserver | null = null;
  private layoutShiftObserver: PerformanceObserver | null = null;
  private firstInputObserver: PerformanceObserver | null = null;

  constructor() {
    this.initializeObservers();
    this.trackPageLoad();
  }

  private initializeObservers(): void {
    try {
      // Navigation timing observer
      if ('PerformanceObserver' in window) {
        this.navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.handleNavigationTiming(entry as PerformanceNavigationTiming);
            }
          });
        });
        this.navigationObserver.observe({ entryTypes: ['navigation'] });

        // Paint timing observer
        this.paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-paint') {
              this.trackFirstPaint(entry.startTime);
            }
            if (entry.name === 'first-contentful-paint') {
              this.trackFirstContentfulPaint(entry.startTime);
            }
          });
        });
        this.paintObserver.observe({ entryTypes: ['paint'] });

        // Layout shift observer
        this.layoutShiftObserver = new PerformanceObserver((list) => {
          let cumulativeLayoutShift = 0;
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              cumulativeLayoutShift += (entry as any).value;
            }
          });
          this.trackCumulativeLayoutShift(cumulativeLayoutShift);
        });
        this.layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

        // First input delay observer
        this.firstInputObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const eventEntry = entry as PerformanceEventTiming;
            this.trackFirstInputDelay(eventEntry.processingStart - eventEntry.startTime);
          });
        });
        this.firstInputObserver.observe({ entryTypes: ['first-input'] });
      }
    } catch (error) {
      logger.warn('Performance monitoring initialization failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  private trackPageLoad(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.measurePageLoad();
      });
    } else {
      this.measurePageLoad();
    }

    window.addEventListener('load', () => {
      this.measurePageLoad();
    });
  }

  private measurePageLoad(): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const metrics: PerformanceMetrics = {
          pageLoadTime: navigation.loadEventEnd - performance.timeOrigin,
          domContentLoaded: navigation.domContentLoadedEventEnd - performance.timeOrigin,
        };

        // Log performance metrics
        logger.info('Page Load Performance Metrics', {
          ...metrics,
          url: window.location.href,
          userAgent: navigator.userAgent,
        });

        // Track in analytics if available
        this.trackPerformanceAnalytics(metrics);
      }
    }
  }

  private handleNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics: NavigationTiming = {
      navigationStart: performance.timeOrigin,
      loadEventEnd: entry.loadEventEnd,
      domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
      pageLoadTime: entry.loadEventEnd - performance.timeOrigin,
      domContentLoaded: entry.domContentLoadedEventEnd - performance.timeOrigin,
    };

    logger.info('Navigation Timing Metrics', metrics as unknown as Record<string, unknown>);
  }

  private trackFirstPaint(startTime: number): void {
    logger.info('First Paint', { startTime });
  }

  private trackFirstContentfulPaint(startTime: number): void {
    logger.info('First Contentful Paint', { startTime });
  }

  private trackCumulativeLayoutShift(value: number): void {
    logger.info('Cumulative Layout Shift', { value });
  }

  private trackFirstInputDelay(delay: number): void {
    logger.info('First Input Delay', { delay });
  }

  private trackPerformanceAnalytics(metrics: PerformanceMetrics): void {
    // Send to analytics service if configured
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', {
        event_category: 'performance',
        page_load_time: metrics.pageLoadTime,
        dom_content_loaded: metrics.domContentLoaded,
        page: window.location.pathname,
      });
    }
  }

  // Track custom performance marks
  mark(name: string): void {
    if ('performance' in window) {
      performance.mark(name);
      logger.debug('Performance mark created', { name });
    }
  }

  // Measure time between two marks
  measure(name: string, startMark: string, endMark: string): void {
    if ('performance' in window) {
      try {
        const measure = performance.measure(name, startMark, endMark);
        logger.info('Performance measure', {
          name,
          duration: measure.duration,
          startMark,
          endMark,
        });
      } catch (error) {
        logger.warn('Failed to create performance measure', { name, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  // Track component render time
  trackComponentRender(componentName: string, renderTime: number): void {
    logger.info('Component Render Performance', {
      component: componentName,
      renderTime,
      url: window.location.href,
    });
  }

  // Track API call performance
  trackApiPerformance(endpoint: string, duration: number, status: number): void {
    logger.info('API Performance', {
      endpoint,
      duration,
      status,
      url: window.location.href,
    });
  }

  // Get current performance metrics
  getCurrentMetrics(): PerformanceMetrics | null {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        return {
          pageLoadTime: navigation.loadEventEnd - performance.timeOrigin,
          domContentLoaded: navigation.domContentLoadedEventEnd - performance.timeOrigin,
        };
      }
    }
    return null;
  }

  // Cleanup observers
  disconnect(): void {
    if (this.navigationObserver) {
      this.navigationObserver.disconnect();
    }
    if (this.paintObserver) {
      this.paintObserver.disconnect();
    }
    if (this.layoutShiftObserver) {
      this.layoutShiftObserver.disconnect();
    }
    if (this.firstInputObserver) {
      this.firstInputObserver.disconnect();
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor; 