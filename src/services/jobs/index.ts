// Export all interfaces
export * from './interfaces';

// Export implementations
export { JobTrackerFactory } from './JobTrackerFactory';
export { LocalStorageJobStorage } from './LocalStorageJobStorage';
export { JobEventEmitter } from './JobEventEmitter';
export { JobRepository } from './JobRepository';
export { JobCleanupService } from './JobCleanupService';
export { JobTrackingService } from './JobTrackingService';

// Factory function to create a fully configured JobTrackingService
import { JobTrackingService } from './JobTrackingService';
import { JobRepository } from './JobRepository';
import { JobTrackerFactory } from './JobTrackerFactory';
import { LocalStorageJobStorage } from './LocalStorageJobStorage';
import { JobEventEmitter } from './JobEventEmitter';
import { JobCleanupService } from './JobCleanupService';

/**
 * Factory function to create a properly configured JobTrackingService
 * Follows Dependency Injection principle
 */
export function createJobTrackingService(): JobTrackingService {
  const storage = new LocalStorageJobStorage();
  const eventEmitter = new JobEventEmitter();
  const repository = new JobRepository(storage, eventEmitter);
  const factory = new JobTrackerFactory();
  const cleanupService = new JobCleanupService(repository);

  return new JobTrackingService(repository, factory, cleanupService, eventEmitter);
}

// Singleton instance for application use
let jobTrackingServiceInstance: JobTrackingService | null = null;

export function getJobTrackingService(): JobTrackingService {
  if (!jobTrackingServiceInstance) {
    jobTrackingServiceInstance = createJobTrackingService();
  }
  return jobTrackingServiceInstance;
}

// For testing purposes - allow injection of custom service
export function setJobTrackingService(service: JobTrackingService): void {
  jobTrackingServiceInstance = service;
}

export function resetJobTrackingService(): void {
  jobTrackingServiceInstance = null;
}


