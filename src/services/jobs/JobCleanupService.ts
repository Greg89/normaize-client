import { JOB_STATUS_GROUPS, JobStatusUtils } from '../../types';
import { logger } from '../../utils/logger';
import { IJobCleanupService, IJobRepository } from './interfaces';

/**
 * Service for cleaning up old and completed jobs
 * Follows Single Responsibility Principle
 */
export class JobCleanupService implements IJobCleanupService {
  constructor(private jobRepository: IJobRepository) {}

  async removeCompletedJobs(): Promise<number> {
    let removedCount = 0;
    
    for (const status of JOB_STATUS_GROUPS.COMPLETED) {
      const jobs = await this.jobRepository.getByStatus(status);
      for (const job of jobs) {
        await this.jobRepository.remove(job.jobId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.info('Removed completed jobs', { count: removedCount });
    }

    return removedCount;
  }

  async removeOldJobs(olderThanHours: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    const allJobs = await this.jobRepository.getAll();
    const jobsToRemove = allJobs.filter(job => 
      JobStatusUtils.isCompleted(job.status) && 
      job.lastUpdated < cutoffTime
    );

    for (const job of jobsToRemove) {
      await this.jobRepository.remove(job.jobId);
    }

    if (jobsToRemove.length > 0) {
      logger.info('Removed old completed jobs', { 
        count: jobsToRemove.length,
        olderThanHours 
      });
    }

    return jobsToRemove.length;
  }
}
