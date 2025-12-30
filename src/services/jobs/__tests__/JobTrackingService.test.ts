import { JobTrackingService } from '../JobTrackingService';
import { 
  IJobRepository, 
  IJobTrackerFactory, 
  IJobCleanupService,
  IJobEventEmitter 
} from '../interfaces';
import { JobTracker, NormalizationJobResponse, NormalizationJobStatus } from '../../../types';
import { logger } from '../../../utils/logger';

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('JobTrackingService', () => {
  let service: JobTrackingService;
  let mockRepository: jest.Mocked<IJobRepository>;
  let mockFactory: jest.Mocked<IJobTrackerFactory>;
  let mockCleanupService: jest.Mocked<IJobCleanupService>;
  let mockEventEmitter: jest.Mocked<IJobEventEmitter>;

  const mockJobResponse: NormalizationJobResponse = {
    jobId: 'job-123',
    status: NormalizationJobStatus.QUEUED,
    message: 'Job queued',
    submittedAt: '2023-10-01T10:00:00Z',
    progressPercentage: 0,
    success: true
  };

  const mockJob: JobTracker = {
    jobId: 'job-123',
    type: 'REMOVE_DUPLICATES',
    datasetId: 456,
    datasetName: 'Test Dataset',
    status: NormalizationJobStatus.QUEUED,
    message: 'Job queued',
    submittedAt: new Date('2023-10-01T10:00:00Z'),
    progressPercentage: 0,
    lastUpdated: new Date('2023-10-01T10:00:00Z'),
    config: { columns: ['col1', 'col2'] }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      add: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getById: jest.fn(),
      getAll: jest.fn(),
      getByStatus: jest.fn(),
      getByDatasetId: jest.fn()
    };

    mockFactory = {
      createFromResponse: jest.fn(),
      updateFromResponse: jest.fn()
    };

    mockCleanupService = {
      removeCompletedJobs: jest.fn(),
      removeOldJobs: jest.fn()
    };

    mockEventEmitter = {
      subscribe: jest.fn(),
      emit: jest.fn(),
      getListenerCount: jest.fn(),
      clear: jest.fn()
    };

    service = new JobTrackingService(
      mockRepository,
      mockFactory,
      mockCleanupService,
      mockEventEmitter
    );
  });

  describe('constructor', () => {
    it('should perform initial cleanup on instantiation', async () => {
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockCleanupService.removeOldJobs).toHaveBeenCalledWith(24);
    });

    it('should handle cleanup errors gracefully', async () => {
      mockCleanupService.removeOldJobs.mockRejectedValue(new Error('Cleanup failed'));
      
      // Should not throw during construction
      expect(() => new JobTrackingService(
        mockRepository,
        mockFactory,
        mockCleanupService,
        mockEventEmitter
      )).not.toThrow();

      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to perform initial job cleanup',
        { error: expect.any(Error) }
      );
    });
  });

  describe('createJob', () => {
    it('should create job using factory and add to repository', async () => {
      mockFactory.createFromResponse.mockReturnValue(mockJob);
      mockRepository.add.mockResolvedValue(undefined);

      const result = await service.createJob(
        mockJobResponse,
        'REMOVE_DUPLICATES',
        456,
        'Test Dataset',
        { columns: ['col1', 'col2'] }
      );

      expect(mockFactory.createFromResponse).toHaveBeenCalledWith(
        mockJobResponse,
        'REMOVE_DUPLICATES',
        456,
        'Test Dataset',
        { columns: ['col1', 'col2'] }
      );
      expect(mockRepository.add).toHaveBeenCalledWith(mockJob);
      expect(result).toBe(mockJob);
    });

    it('should create job without config', async () => {
      mockFactory.createFromResponse.mockReturnValue(mockJob);
      mockRepository.add.mockResolvedValue(undefined);

      await service.createJob(
        mockJobResponse,
        'NORMALIZE_DATA',
        789,
        'Another Dataset'
      );

      expect(mockFactory.createFromResponse).toHaveBeenCalledWith(
        mockJobResponse,
        'NORMALIZE_DATA',
        789,
        'Another Dataset',
        undefined
      );
    });

    it('should propagate repository errors', async () => {
      mockFactory.createFromResponse.mockReturnValue(mockJob);
      mockRepository.add.mockRejectedValue(new Error('Repository error'));

      await expect(service.createJob(
        mockJobResponse,
        'REMOVE_DUPLICATES',
        456,
        'Test Dataset'
      )).rejects.toThrow('Repository error');
    });
  });

  describe('updateJob', () => {
    it('should update existing job using factory and repository', async () => {
      const updatedJob = { ...mockJob, progressPercentage: 50 };
      
      mockRepository.getById.mockResolvedValue(mockJob);
      mockFactory.updateFromResponse.mockReturnValue(updatedJob);
      mockRepository.update.mockResolvedValue(undefined);

      const result = await service.updateJob(mockJobResponse);

      expect(mockRepository.getById).toHaveBeenCalledWith('job-123');
      expect(mockFactory.updateFromResponse).toHaveBeenCalledWith(mockJob, mockJobResponse);
      expect(mockRepository.update).toHaveBeenCalledWith(updatedJob);
      expect(result).toBe(updatedJob);
    });

    it('should return null and log warning for non-existent job', async () => {
      mockRepository.getById.mockResolvedValue(null);

      const result = await service.updateJob(mockJobResponse);

      expect(result).toBeNull();
      expect(mockFactory.updateFromResponse).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'Attempted to update non-existent job',
        { jobId: 'job-123' }
      );
    });

    it('should propagate repository errors', async () => {
      mockRepository.getById.mockResolvedValue(mockJob);
      mockFactory.updateFromResponse.mockReturnValue(mockJob);
      mockRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(service.updateJob(mockJobResponse)).rejects.toThrow('Update failed');
    });
  });

  describe('getJob', () => {
    it('should delegate to repository', async () => {
      mockRepository.getById.mockResolvedValue(mockJob);

      const result = await service.getJob('job-123');

      expect(mockRepository.getById).toHaveBeenCalledWith('job-123');
      expect(result).toBe(mockJob);
    });

    it('should return null for non-existent job', async () => {
      mockRepository.getById.mockResolvedValue(null);

      const result = await service.getJob('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getAllJobs', () => {
    it('should delegate to repository', async () => {
      const jobs = [mockJob];
      mockRepository.getAll.mockResolvedValue(jobs);

      const result = await service.getAllJobs();

      expect(mockRepository.getAll).toHaveBeenCalled();
      expect(result).toBe(jobs);
    });
  });

  describe('getJobsByStatus', () => {
    it('should delegate to repository', async () => {
      const jobs = [mockJob];
      mockRepository.getByStatus.mockResolvedValue(jobs);

      const result = await service.getJobsByStatus(NormalizationJobStatus.PROCESSING);

      expect(mockRepository.getByStatus).toHaveBeenCalledWith(NormalizationJobStatus.PROCESSING);
      expect(result).toBe(jobs);
    });
  });

  describe('getJobsForDataset', () => {
    it('should delegate to repository', async () => {
      const jobs = [mockJob];
      mockRepository.getByDatasetId.mockResolvedValue(jobs);

      const result = await service.getJobsForDataset(456);

      expect(mockRepository.getByDatasetId).toHaveBeenCalledWith(456);
      expect(result).toBe(jobs);
    });
  });

  describe('removeJob', () => {
    it('should delegate to repository', async () => {
      mockRepository.remove.mockResolvedValue(undefined);

      await service.removeJob('job-123');

      expect(mockRepository.remove).toHaveBeenCalledWith('job-123');
    });
  });

  describe('clearCompletedJobs', () => {
    it('should delegate to cleanup service', async () => {
      mockCleanupService.removeCompletedJobs.mockResolvedValue(5);

      const result = await service.clearCompletedJobs();

      expect(mockCleanupService.removeCompletedJobs).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });

  describe('subscribeToUpdates', () => {
    it('should delegate to event emitter', () => {
      const mockListener = jest.fn();
      const mockUnsubscribe = jest.fn();
      mockEventEmitter.subscribe.mockReturnValue(mockUnsubscribe);

      const unsubscribe = service.subscribeToUpdates(mockListener);

      expect(mockEventEmitter.subscribe).toHaveBeenCalledWith(mockListener);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('hasActiveJobs', () => {
    it('should return true when there are queued jobs', async () => {
      mockRepository.getByStatus
        .mockResolvedValueOnce([mockJob]) // QUEUED
        .mockResolvedValueOnce([]); // PROCESSING

      const result = await service.hasActiveJobs();

      expect(result).toBe(true);
      expect(mockRepository.getByStatus).toHaveBeenCalledWith(NormalizationJobStatus.QUEUED);
    });

    it('should return true when there are processing jobs', async () => {
      const processingJob = { ...mockJob, status: NormalizationJobStatus.PROCESSING };
      
      mockRepository.getByStatus
        .mockResolvedValueOnce([]) // QUEUED
        .mockResolvedValueOnce([processingJob]); // PROCESSING

      const result = await service.hasActiveJobs();

      expect(result).toBe(true);
      expect(mockRepository.getByStatus).toHaveBeenCalledWith(NormalizationJobStatus.PROCESSING);
    });

    it('should return false when there are no active jobs', async () => {
      mockRepository.getByStatus.mockResolvedValue([]);

      const result = await service.hasActiveJobs();

      expect(result).toBe(false);
      expect(mockRepository.getByStatus).toHaveBeenCalledWith(NormalizationJobStatus.QUEUED);
      expect(mockRepository.getByStatus).toHaveBeenCalledWith(NormalizationJobStatus.PROCESSING);
    });

    it('should stop checking after finding first active status', async () => {
      mockRepository.getByStatus.mockResolvedValueOnce([mockJob]);

      const result = await service.hasActiveJobs();

      expect(result).toBe(true);
      expect(mockRepository.getByStatus).toHaveBeenCalledTimes(1);
      expect(mockRepository.getByStatus).toHaveBeenCalledWith(NormalizationJobStatus.QUEUED);
    });
  });

  describe('getActiveJobCount', () => {
    it('should return sum of queued and processing jobs', async () => {
      const queuedJobs = [mockJob, { ...mockJob, jobId: 'job-2' }];
      const processingJobs = [{ ...mockJob, jobId: 'job-3', status: NormalizationJobStatus.PROCESSING }];

      mockRepository.getByStatus
        .mockResolvedValueOnce(queuedJobs) // QUEUED
        .mockResolvedValueOnce(processingJobs); // PROCESSING

      const result = await service.getActiveJobCount();

      expect(result).toBe(3);
      expect(mockRepository.getByStatus).toHaveBeenCalledWith(NormalizationJobStatus.QUEUED);
      expect(mockRepository.getByStatus).toHaveBeenCalledWith(NormalizationJobStatus.PROCESSING);
    });

    it('should return 0 when no active jobs', async () => {
      mockRepository.getByStatus.mockResolvedValue([]);

      const result = await service.getActiveJobCount();

      expect(result).toBe(0);
    });

    it('should handle mixed active job counts', async () => {
      mockRepository.getByStatus
        .mockResolvedValueOnce([mockJob]) // 1 queued
        .mockResolvedValueOnce([]); // 0 processing

      const result = await service.getActiveJobCount();

      expect(result).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should propagate errors from createJob', async () => {
      mockFactory.createFromResponse.mockImplementation(() => {
        throw new Error('Factory error');
      });

      await expect(service.createJob(
        mockJobResponse,
        'REMOVE_DUPLICATES',
        456,
        'Test Dataset'
      )).rejects.toThrow('Factory error');
    });

    it('should propagate errors from repository operations', async () => {
      mockRepository.getAll.mockRejectedValue(new Error('Repository error'));

      await expect(service.getAllJobs()).rejects.toThrow('Repository error');
    });

    it('should propagate errors from cleanup operations', async () => {
      mockCleanupService.removeCompletedJobs.mockRejectedValue(new Error('Cleanup error'));

      await expect(service.clearCompletedJobs()).rejects.toThrow('Cleanup error');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete job lifecycle', async () => {
      // Create job
      mockFactory.createFromResponse.mockReturnValue(mockJob);
      mockRepository.add.mockResolvedValue(undefined);

      const createdJob = await service.createJob(
        mockJobResponse,
        'REMOVE_DUPLICATES',
        456,
        'Test Dataset'
      );

      expect(createdJob).toBe(mockJob);

      // Update job
      const updatedResponse = { ...mockJobResponse, progressPercentage: 50 };
      const updatedJob = { ...mockJob, progressPercentage: 50 };
      
      mockRepository.getById.mockResolvedValue(mockJob);
      mockFactory.updateFromResponse.mockReturnValue(updatedJob);
      mockRepository.update.mockResolvedValue(undefined);

      const result = await service.updateJob(updatedResponse);
      expect(result).toBe(updatedJob);

      // Remove job
      mockRepository.remove.mockResolvedValue(undefined);
      await service.removeJob('job-123');

      expect(mockRepository.remove).toHaveBeenCalledWith('job-123');
    });

    it('should handle multiple concurrent operations', async () => {
      const job1 = { ...mockJob, jobId: 'job-1' };
      const job2 = { ...mockJob, jobId: 'job-2' };
      
      mockFactory.createFromResponse
        .mockReturnValueOnce(job1)
        .mockReturnValueOnce(job2);
      mockRepository.add.mockResolvedValue(undefined);

      // Create multiple jobs concurrently
      const promises = [
        service.createJob(mockJobResponse, 'REMOVE_DUPLICATES', 456, 'Dataset 1'),
        service.createJob(mockJobResponse, 'NORMALIZE_DATA', 789, 'Dataset 2')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(2);
      expect(mockRepository.add).toHaveBeenCalledTimes(2);
    });
  });
});
