import { JobTracker, NormalizationJobStatus } from '../../types';
import { logger } from '../../utils/logger';
import { IJobRepository, IJobStorage, IJobEventEmitter } from './interfaces';

/**
 * Repository for managing job data operations
 * Follows Single Responsibility and Dependency Inversion principles
 */
export class JobRepository implements IJobRepository {
  private jobs: Map<string, JobTracker> = new Map();

  constructor(
    private storage: IJobStorage,
    private eventEmitter: IJobEventEmitter
  ) {
    this.loadJobs();
  }

  async add(job: JobTracker): Promise<void> {
    this.jobs.set(job.jobId, job);
    await this.persistAndNotify();
    
    logger.info('Job added to repository', {
      jobId: job.jobId,
      type: job.type,
      datasetId: job.datasetId,
      status: job.status
    });
  }

  async update(job: JobTracker): Promise<void> {
    if (!this.jobs.has(job.jobId)) {
      throw new Error(`Job ${job.jobId} not found`);
    }

    this.jobs.set(job.jobId, job);
    await this.persistAndNotify();
    
    logger.debug('Job updated in repository', {
      jobId: job.jobId,
      status: job.status,
      progress: job.progressPercentage
    });
  }

  async remove(jobId: string): Promise<void> {
    const removed = this.jobs.delete(jobId);
    if (removed) {
      await this.persistAndNotify();
      logger.info('Job removed from repository', { jobId });
    }
  }

  async getById(jobId: string): Promise<JobTracker | null> {
    return this.jobs.get(jobId) || null;
  }

  async getAll(): Promise<JobTracker[]> {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async getByStatus(status: NormalizationJobStatus): Promise<JobTracker[]> {
    const allJobs = await this.getAll();
    return allJobs.filter(job => job.status === status);
  }

  async getByDatasetId(datasetId: number): Promise<JobTracker[]> {
    const allJobs = await this.getAll();
    return allJobs.filter(job => job.datasetId === datasetId);
  }

  private async loadJobs(): Promise<void> {
    try {
      const jobs = await this.storage.load();
      this.jobs.clear();
      jobs.forEach(job => this.jobs.set(job.jobId, job));
      logger.debug('Jobs loaded into repository', { count: this.jobs.size });
    } catch (error) {
      logger.error('Failed to load jobs into repository', { error });
    }
  }

  private async persistAndNotify(): Promise<void> {
    try {
      const jobs = await this.getAll();
      await this.storage.save(jobs);
      this.eventEmitter.emit(jobs);
    } catch (error) {
      logger.error('Failed to persist jobs', { error });
      throw error;
    }
  }
}


