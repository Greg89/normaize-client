import { JobTracker } from '../../types';
import { logger } from '../../utils/logger';
import { IJobEventEmitter } from './interfaces';

/**
 * Event emitter for job updates
 * Follows Single Responsibility Principle and Observer pattern
 */
export class JobEventEmitter implements IJobEventEmitter {
  private listeners: Set<(jobs: JobTracker[]) => void> = new Set();

  subscribe(listener: (jobs: JobTracker[]) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(jobs: JobTracker[]): void {
    this.listeners.forEach(listener => {
      try {
        listener(jobs);
      } catch (error) {
        logger.error('Error notifying job event listener', { error });
      }
    });
  }

  getListenerCount(): number {
    return this.listeners.size;
  }

  clear(): void {
    this.listeners.clear();
  }
}
