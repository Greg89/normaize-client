import { useState, useEffect, useCallback, useRef } from 'react';
import { JobTracker, NormalizationJobResponse, JobStatusUtils } from '../types';
import { getJobTrackingService } from '../services/jobs';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';

interface UseJobTrackingOptions {
  pollInterval?: number; // in milliseconds, default 5000 (5 seconds)
  enablePolling?: boolean; // default true
}

interface UseJobTrackingReturn {
  jobs: JobTracker[];
  activeJobs: JobTracker[];
  completedJobs: JobTracker[];
  loading: boolean;
  error: string | null;
  createJob: (
    jobResponse: NormalizationJobResponse,
    type: JobTracker['type'],
    datasetId: string,
    datasetName: string,
    config?: Record<string, unknown>
  ) => Promise<JobTracker>;
  removeJob: (jobId: string) => Promise<void>;
  clearCompletedJobs: () => Promise<number>;
  hasActiveJobs: boolean;
  activeJobCount: number;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing job tracking operations
 * Follows Single Responsibility Principle
 */
export function useJobTracking(options: UseJobTrackingOptions = {}): UseJobTrackingReturn {
  const {
    pollInterval = 5000,
    enablePolling = true
  } = options;

  const [jobs, setJobs] = useState<JobTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const jobService = getJobTrackingService();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Derived state
  const activeJobs = jobs.filter(job => JobStatusUtils.isActive(job.status));
  const completedJobs = jobs.filter(job => JobStatusUtils.isCompleted(job.status));

  const hasActiveJobs = activeJobs.length > 0;
  const activeJobCount = activeJobs.length;

  // Load initial jobs and subscribe to updates
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const initialJobs = await jobService.getAllJobs();
        if (mountedRef.current) {
          setJobs(initialJobs);
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load jobs';
          setError(errorMessage);
          logger.error('Failed to load jobs in useJobTracking', { error: err });
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    // Subscribe to job updates
    const unsubscribe = jobService.subscribeToUpdates((updatedJobs) => {
      if (mountedRef.current) {
        setJobs(updatedJobs);
      }
    });

    loadJobs();

    return () => {
      unsubscribe();
    };
  }, [jobService]);

  // Polling for job status updates
  useEffect(() => {
    if (!enablePolling || activeJobs.length === 0) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const pollJobStatuses = async () => {
      try {
        // Poll status for all active jobs
        const statusPromises = activeJobs.map(job => 
          apiService.getJobStatus(job.jobId)
            .then(response => ({ job, response }))
            .catch(error => {
              logger.error('Failed to poll job status', { 
                jobId: job.jobId, 
                error 
              });
              return null;
            })
        );

        const results = await Promise.all(statusPromises);
        
        // Update jobs with new status
        for (const result of results) {
          if (result && mountedRef.current) {
            await jobService.updateJob(result.response);
          }
        }
      } catch (error) {
        logger.error('Error during job status polling', { error });
      }
    };

    // Start polling
    pollIntervalRef.current = setInterval(pollJobStatuses, pollInterval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [jobs, activeJobs, pollInterval, enablePolling, jobService]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const createJob = useCallback(async (
    jobResponse: NormalizationJobResponse,
    type: JobTracker['type'],
    datasetId: string,
    datasetName: string,
    config?: Record<string, unknown>
  ): Promise<JobTracker> => {
    try {
      return await jobService.createJob(jobResponse, type, datasetId, datasetName, config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
      setError(errorMessage);
      logger.error('Failed to create job', { error: err, jobId: jobResponse.jobId });
      throw err;
    }
  }, [jobService]);

  const removeJob = useCallback(async (jobId: string): Promise<void> => {
    try {
      await jobService.removeJob(jobId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove job';
      setError(errorMessage);
      throw err;
    }
  }, [jobService]);

  const clearCompletedJobs = useCallback(async (): Promise<number> => {
    try {
      return await jobService.clearCompletedJobs();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear completed jobs';
      setError(errorMessage);
      throw err;
    }
  }, [jobService]);

  const refetch = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const refreshedJobs = await jobService.getAllJobs();
      setJobs(refreshedJobs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh jobs';
      setError(errorMessage);
      logger.error('Failed to refetch jobs', { error: err });
    } finally {
      setLoading(false);
    }
  }, [jobService]);

  return {
    jobs,
    activeJobs,
    completedJobs,
    loading,
    error,
    createJob,
    removeJob,
    clearCompletedJobs,
    hasActiveJobs,
    activeJobCount,
    refetch
  };
}
