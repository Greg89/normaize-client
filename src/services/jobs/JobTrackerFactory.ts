import { JobTracker, NormalizationJobResponse } from '../../types';
import { IJobTrackerFactory } from './interfaces';

/**
 * Factory for creating and updating JobTracker instances
 * Follows Single Responsibility and Factory patterns
 */
export class JobTrackerFactory implements IJobTrackerFactory {
  createFromResponse(
    response: NormalizationJobResponse,
    type: JobTracker['type'],
    datasetId: string, // Changed to string
    datasetName: string,
    config?: Record<string, unknown>
  ): JobTracker {
    return {
      jobId: response.jobId,
      type,
      datasetId,
      datasetName,
      status: response.status,
      message: response.message,
      submittedAt: new Date(response.submittedAt),
      estimatedCompletionAt: response.estimatedCompletionAt 
        ? new Date(response.estimatedCompletionAt) 
        : undefined,
      progressPercentage: response.progressPercentage,
      lastUpdated: new Date(),
      config
    };
  }

  updateFromResponse(existing: JobTracker, response: NormalizationJobResponse): JobTracker {
    return {
      ...existing,
      status: response.status,
      message: response.message,
      progressPercentage: response.progressPercentage,
      estimatedCompletionAt: response.estimatedCompletionAt 
        ? new Date(response.estimatedCompletionAt) 
        : undefined,
      lastUpdated: new Date()
    };
  }
}



