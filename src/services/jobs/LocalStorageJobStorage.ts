import { JobTracker, NormalizationJobStatus } from '../../types';
import { logger } from '../../utils/logger';
import { IJobStorage } from './interfaces';

/**
 * LocalStorage implementation of job storage
 * Follows Single Responsibility Principle
 */
export class LocalStorageJobStorage implements IJobStorage {
  private readonly storageKey: string;

  constructor(storageKey = 'normaize_active_jobs') {
    this.storageKey = storageKey;
  }

  async save(jobs: JobTracker[]): Promise<void> {
    try {
      const serializedJobs = jobs.map(job => ({
        ...job,
        submittedAt: job.submittedAt.toISOString(),
        estimatedCompletionAt: job.estimatedCompletionAt?.toISOString(),
        lastUpdated: job.lastUpdated.toISOString()
      }));
      
      localStorage.setItem(this.storageKey, JSON.stringify(serializedJobs));
      logger.debug('Jobs saved to localStorage', { count: jobs.length });
    } catch (error) {
      logger.error('Failed to save jobs to localStorage', { error });
      throw new Error('Failed to save jobs to storage');
    }
  }

  async load(): Promise<JobTracker[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return [];
      }

      const jobsData = JSON.parse(stored);
      const jobs = jobsData.map((jobData: Record<string, unknown>): JobTracker => ({
        jobId: jobData['jobId'] as string,
        type: jobData['type'] as JobTracker['type'],
        datasetId: Number(jobData['datasetId']),
        datasetName: jobData['datasetName'] as string,
        status: jobData['status'] as NormalizationJobStatus,
        submittedAt: new Date(jobData['submittedAt'] as string),
        estimatedCompletionAt: jobData['estimatedCompletionAt'] 
          ? new Date(jobData['estimatedCompletionAt'] as string)
          : undefined,
        lastUpdated: new Date(jobData['lastUpdated'] as string),
        message: jobData['message'] as string,
        progressPercentage: Number(jobData['progressPercentage'])
      }));

      logger.debug('Jobs loaded from localStorage', { count: jobs.length });
      return jobs;
    } catch (error) {
      logger.error('Failed to load jobs from localStorage', { error });
      // Clear corrupted data
      await this.clear();
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
      logger.debug('Jobs storage cleared');
    } catch (error) {
      logger.error('Failed to clear jobs storage', { error });
      throw new Error('Failed to clear jobs storage');
    }
  }
}
