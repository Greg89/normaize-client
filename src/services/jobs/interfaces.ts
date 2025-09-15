import { JobTracker, NormalizationJobResponse, NormalizationJobStatus } from '../../types';

/**
 * Interface for job storage operations (Single Responsibility)
 */
export interface IJobStorage {
  save(jobs: JobTracker[]): Promise<void>;
  load(): Promise<JobTracker[]>;
  clear(): Promise<void>;
}

/**
 * Interface for job repository operations (Single Responsibility)
 */
export interface IJobRepository {
  add(job: JobTracker): Promise<void>;
  update(job: JobTracker): Promise<void>;
  remove(jobId: string): Promise<void>;
  getById(jobId: string): Promise<JobTracker | null>;
  getAll(): Promise<JobTracker[]>;
  getByStatus(status: NormalizationJobStatus): Promise<JobTracker[]>;
  getByDatasetId(datasetId: number): Promise<JobTracker[]>;
}

/**
 * Interface for job event notifications (Single Responsibility)
 */
export interface IJobEventEmitter {
  subscribe(listener: (jobs: JobTracker[]) => void): () => void;
  emit(jobs: JobTracker[]): void;
}

/**
 * Interface for job cleanup operations (Single Responsibility)
 */
export interface IJobCleanupService {
  removeCompletedJobs(): Promise<number>;
  removeOldJobs(olderThanHours: number): Promise<number>;
}

/**
 * Factory interface for creating JobTracker instances (Dependency Inversion)
 */
export interface IJobTrackerFactory {
  createFromResponse(
    response: NormalizationJobResponse,
    type: JobTracker['type'],
    datasetId: number,
    datasetName: string,
    config?: Record<string, unknown>
  ): JobTracker;
  
  updateFromResponse(existing: JobTracker, response: NormalizationJobResponse): JobTracker;
}



