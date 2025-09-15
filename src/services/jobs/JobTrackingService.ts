import { JobTracker, NormalizationJobResponse, NormalizationJobStatus, JOB_STATUS_GROUPS } from '../../types';
import { logger } from '../../utils/logger';
import { 
  IJobRepository, 
  IJobTrackerFactory, 
  IJobCleanupService,
  IJobEventEmitter 
} from './interfaces';

/**
 * Main service for job tracking operations
 * Follows Single Responsibility and Dependency Inversion principles
 * Acts as a facade for the job tracking subsystem
 */
export class JobTrackingService {
  constructor(
    private jobRepository: IJobRepository,
    private jobFactory: IJobTrackerFactory,
    private cleanupService: IJobCleanupService,
    private eventEmitter: IJobEventEmitter
  ) {
    // Cleanup old jobs on initialization
    this.performInitialCleanup();
  }

  /**
   * Create and track a new job
   */
  async createJob(
    jobResponse: NormalizationJobResponse,
    type: JobTracker['type'],
    datasetId: number,
    datasetName: string,
    config?: Record<string, unknown>
  ): Promise<JobTracker> {
    const job = this.jobFactory.createFromResponse(
      jobResponse,
      type,
      datasetId,
      datasetName,
      config
    );

    await this.jobRepository.add(job);
    return job;
  }

  /**
   * Update an existing job with new status information
   */
  async updateJob(jobResponse: NormalizationJobResponse): Promise<JobTracker | null> {
    const existingJob = await this.jobRepository.getById(jobResponse.jobId);
    if (!existingJob) {
      logger.warn('Attempted to update non-existent job', { jobId: jobResponse.jobId });
      return null;
    }

    const updatedJob = this.jobFactory.updateFromResponse(existingJob, jobResponse);
    await this.jobRepository.update(updatedJob);
    return updatedJob;
  }

  /**
   * Get a specific job by ID
   */
  async getJob(jobId: string): Promise<JobTracker | null> {
    return this.jobRepository.getById(jobId);
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<JobTracker[]> {
    return this.jobRepository.getAll();
  }

  /**
   * Get jobs by status
   */
  async getJobsByStatus(status: NormalizationJobStatus): Promise<JobTracker[]> {
    return this.jobRepository.getByStatus(status);
  }

  /**
   * Get jobs for a specific dataset
   */
  async getJobsForDataset(datasetId: number): Promise<JobTracker[]> {
    return this.jobRepository.getByDatasetId(datasetId);
  }

  /**
   * Remove a job from tracking
   */
  async removeJob(jobId: string): Promise<void> {
    await this.jobRepository.remove(jobId);
  }

  /**
   * Clear all completed jobs
   */
  async clearCompletedJobs(): Promise<number> {
    return this.cleanupService.removeCompletedJobs();
  }

  /**
   * Subscribe to job updates
   */
  subscribeToUpdates(listener: (jobs: JobTracker[]) => void): () => void {
    return this.eventEmitter.subscribe(listener);
  }

  /**
   * Check if there are any active jobs
   */
  async hasActiveJobs(): Promise<boolean> {
    for (const status of JOB_STATUS_GROUPS.ACTIVE) {
      const jobs = await this.jobRepository.getByStatus(status);
      if (jobs.length > 0) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get count of active jobs
   */
  async getActiveJobCount(): Promise<number> {
    let count = 0;
    
    for (const status of JOB_STATUS_GROUPS.ACTIVE) {
      const jobs = await this.jobRepository.getByStatus(status);
      count += jobs.length;
    }
    
    return count;
  }

  private async performInitialCleanup(): Promise<void> {
    try {
      // Remove jobs older than 24 hours
      await this.cleanupService.removeOldJobs(24);
    } catch (error) {
      logger.error('Failed to perform initial job cleanup', { error });
    }
  }
}
