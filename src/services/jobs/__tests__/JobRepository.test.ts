import { JobRepository } from '../JobRepository';
import { IJobStorage, IJobEventEmitter } from '../interfaces';
import { JobTracker, NormalizationJobStatus } from '../../../types';
import { logger } from '../../../utils/logger';

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }
}));

describe('JobRepository', () => {
  let repository: JobRepository;
  let mockStorage: jest.Mocked<IJobStorage>;
  let mockEventEmitter: jest.Mocked<IJobEventEmitter>;

  const mockJob1: JobTracker = {
    jobId: 'job-1',
    type: 'REMOVE_DUPLICATES',
    datasetId: 123,
    datasetName: 'Dataset 1',
    status: NormalizationJobStatus.PROCESSING,
    message: 'Processing...',
    submittedAt: new Date('2023-10-01T10:00:00Z'),
    progressPercentage: 50,
    lastUpdated: new Date('2023-10-01T10:02:00Z')
  };

  const mockJob2: JobTracker = {
    jobId: 'job-2',
    type: 'NORMALIZE_DATA',
    datasetId: 456,
    datasetName: 'Dataset 2',
    status: NormalizationJobStatus.COMPLETED,
    message: 'Completed',
    submittedAt: new Date('2023-10-01T09:00:00Z'),
    progressPercentage: 100,
    lastUpdated: new Date('2023-10-01T09:05:00Z')
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocks
    mockStorage = {
      save: jest.fn().mockResolvedValue(undefined),
      load: jest.fn().mockResolvedValue([]),
      clear: jest.fn().mockResolvedValue(undefined)
    };

    mockEventEmitter = {
      subscribe: jest.fn(),
      emit: jest.fn(),
      getListenerCount: jest.fn(),
      clear: jest.fn()
    };

    repository = new JobRepository(mockStorage, mockEventEmitter);
  });

  describe('constructor', () => {
    it('should load jobs from storage on initialization', () => {
      expect(mockStorage.load).toHaveBeenCalled();
    });

    it('should handle storage load errors gracefully', async () => {
      const errorStorage = {
        ...mockStorage,
        load: jest.fn().mockRejectedValue(new Error('Storage error'))
      };

      // Should not throw
      expect(() => new JobRepository(errorStorage, mockEventEmitter)).not.toThrow();
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to load jobs into repository',
        { error: expect.any(Error) }
      );
    });
  });

  describe('add', () => {
    it('should add job and trigger persistence and notification', async () => {
      await repository.add(mockJob1);

      expect(mockStorage.save).toHaveBeenCalledWith([mockJob1]);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith([mockJob1]);
      expect(logger.info).toHaveBeenCalledWith(
        'Job added to repository',
        {
          jobId: 'job-1',
          type: 'REMOVE_DUPLICATES',
          datasetId: 123,
          status: NormalizationJobStatus.PROCESSING
        }
      );
    });

    it('should maintain job order by submission date (newest first)', async () => {
      const olderJob = { ...mockJob1, submittedAt: new Date('2023-10-01T08:00:00Z') };
      const newerJob = { ...mockJob2, submittedAt: new Date('2023-10-01T12:00:00Z') };

      await repository.add(olderJob);
      await repository.add(newerJob);

      const jobs = await repository.getAll();
      expect(jobs[0].jobId).toBe('job-2'); // newer job first
      expect(jobs[1].jobId).toBe('job-1'); // older job second
    });

    it('should handle storage errors during add', async () => {
      mockStorage.save.mockRejectedValue(new Error('Storage error'));

      await expect(repository.add(mockJob1)).rejects.toThrow('Storage error');
      expect(logger.error).toHaveBeenCalledWith('Failed to persist jobs', { error: expect.any(Error) });
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      // Pre-populate repository
      await repository.add(mockJob1);
      jest.clearAllMocks(); // Clear the mocks from add operation
    });

    it('should update existing job and trigger persistence and notification', async () => {
      const updatedJob = { ...mockJob1, progressPercentage: 75, message: 'Almost done' };

      await repository.update(updatedJob);

      expect(mockStorage.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        'Job updated in repository',
        {
          jobId: 'job-1',
          status: NormalizationJobStatus.PROCESSING,
          progress: 75
        }
      );
    });

    it('should throw error when trying to update non-existent job', async () => {
      const nonExistentJob = { ...mockJob2, jobId: 'non-existent' };

      await expect(repository.update(nonExistentJob)).rejects.toThrow('Job non-existent not found');
    });

    it('should handle storage errors during update', async () => {
      mockStorage.save.mockRejectedValue(new Error('Storage error'));
      const updatedJob = { ...mockJob1, progressPercentage: 75 };

      await expect(repository.update(updatedJob)).rejects.toThrow('Storage error');
    });
  });

  describe('remove', () => {
    beforeEach(async () => {
      await repository.add(mockJob1);
      await repository.add(mockJob2);
      jest.clearAllMocks();
    });

    it('should remove job and trigger persistence and notification', async () => {
      await repository.remove('job-1');

      const jobs = await repository.getAll();
      expect(jobs).toHaveLength(1);
      expect(jobs[0].jobId).toBe('job-2');
      
      expect(mockStorage.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Job removed from repository', { jobId: 'job-1' });
    });

    it('should be safe to remove non-existent job', async () => {
      await repository.remove('non-existent');

      const jobs = await repository.getAll();
      expect(jobs).toHaveLength(2); // No jobs removed
      expect(mockStorage.save).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    beforeEach(async () => {
      await repository.add(mockJob1);
      await repository.add(mockJob2);
    });

    it('should return job by ID', async () => {
      const job = await repository.getById('job-1');
      expect(job).toEqual(mockJob1);
    });

    it('should return null for non-existent job', async () => {
      const job = await repository.getById('non-existent');
      expect(job).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no jobs', async () => {
      const jobs = await repository.getAll();
      expect(jobs).toEqual([]);
    });

    it('should return all jobs sorted by submission date (newest first)', async () => {
      const job1 = { ...mockJob1, submittedAt: new Date('2023-10-01T10:00:00Z') };
      const job2 = { ...mockJob2, submittedAt: new Date('2023-10-01T11:00:00Z') };
      const job3 = { ...mockJob1, jobId: 'job-3', submittedAt: new Date('2023-10-01T09:00:00Z') };

      await repository.add(job1);
      await repository.add(job2);
      await repository.add(job3);

      const jobs = await repository.getAll();
      
      expect(jobs).toHaveLength(3);
      expect(jobs[0].submittedAt.getTime()).toBeGreaterThan(jobs[1].submittedAt.getTime());
      expect(jobs[1].submittedAt.getTime()).toBeGreaterThan(jobs[2].submittedAt.getTime());
    });
  });

  describe('getByStatus', () => {
    beforeEach(async () => {
      await repository.add(mockJob1); // PROCESSING
      await repository.add(mockJob2); // COMPLETED
      await repository.add({
        ...mockJob1,
        jobId: 'job-3',
        status: NormalizationJobStatus.FAILED
      });
      await repository.add({
        ...mockJob1,
        jobId: 'job-4',
        status: NormalizationJobStatus.PROCESSING
      });
    });

    it('should return jobs with specific status', async () => {
      const processingJobs = await repository.getByStatus(NormalizationJobStatus.PROCESSING);
      const completedJobs = await repository.getByStatus(NormalizationJobStatus.COMPLETED);
      const failedJobs = await repository.getByStatus(NormalizationJobStatus.FAILED);

      expect(processingJobs).toHaveLength(2);
      expect(completedJobs).toHaveLength(1);
      expect(failedJobs).toHaveLength(1);

      expect(processingJobs.every(job => job.status === NormalizationJobStatus.PROCESSING)).toBe(true);
      expect(completedJobs[0].status).toBe(NormalizationJobStatus.COMPLETED);
      expect(failedJobs[0].status).toBe(NormalizationJobStatus.FAILED);
    });

    it('should return empty array for status with no jobs', async () => {
      const queuedJobs = await repository.getByStatus(NormalizationJobStatus.QUEUED);
      expect(queuedJobs).toEqual([]);
    });
  });

  describe('getByDatasetId', () => {
    beforeEach(async () => {
      await repository.add(mockJob1); // datasetId: 123
      await repository.add(mockJob2); // datasetId: 456
      await repository.add({
        ...mockJob1,
        jobId: 'job-3',
        datasetId: 123
      });
      await repository.add({
        ...mockJob1,
        jobId: 'job-4',
        datasetId: 789
      });
    });

    it('should return jobs for specific dataset', async () => {
      const dataset123Jobs = await repository.getByDatasetId(123);
      const dataset456Jobs = await repository.getByDatasetId(456);
      const dataset789Jobs = await repository.getByDatasetId(789);

      expect(dataset123Jobs).toHaveLength(2);
      expect(dataset456Jobs).toHaveLength(1);
      expect(dataset789Jobs).toHaveLength(1);

      expect(dataset123Jobs.every(job => job.datasetId === 123)).toBe(true);
      expect(dataset456Jobs[0].datasetId).toBe(456);
      expect(dataset789Jobs[0].datasetId).toBe(789);
    });

    it('should return empty array for dataset with no jobs', async () => {
      const noJobs = await repository.getByDatasetId(999);
      expect(noJobs).toEqual([]);
    });
  });

  describe('persistence and notification coordination', () => {
    it('should call save and emit in correct order', async () => {
      const callOrder: string[] = [];
      
      mockStorage.save.mockImplementation(async () => {
        callOrder.push('save');
      });
      
      mockEventEmitter.emit.mockImplementation(() => {
        callOrder.push('emit');
      });

      await repository.add(mockJob1);

      expect(callOrder).toEqual(['save', 'emit']);
    });

    it('should not emit if save fails', async () => {
      mockStorage.save.mockRejectedValue(new Error('Save failed'));

      await expect(repository.add(mockJob1)).rejects.toThrow('Save failed');
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should propagate storage errors', async () => {
      mockStorage.save.mockRejectedValue(new Error('Storage full'));

      await expect(repository.add(mockJob1)).rejects.toThrow('Storage full');
      expect(logger.error).toHaveBeenCalledWith('Failed to persist jobs', { error: expect.any(Error) });
    });

    it('should handle event emitter errors gracefully', async () => {
      mockEventEmitter.emit.mockImplementation(() => {
        throw new Error('Emit failed');
      });

      // The repository should propagate storage errors but handle emitter errors
      await expect(repository.add(mockJob1)).rejects.toThrow();
      expect(mockStorage.save).toHaveBeenCalled();
    });
  });
});
