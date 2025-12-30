import { JobCleanupService } from '../JobCleanupService';
import { IJobRepository } from '../interfaces';
import { JobTracker, NormalizationJobStatus } from '../../../types';
import { logger } from '../../../utils/logger';

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn()
  }
}));

describe('JobCleanupService', () => {
  let cleanupService: JobCleanupService;
  let mockRepository: jest.Mocked<IJobRepository>;

  const createMockJob = (
    jobId: string,
    status: NormalizationJobStatus,
    lastUpdated: Date
  ): JobTracker => ({
    jobId,
    type: 'REMOVE_DUPLICATES',
    datasetId: 123,
    datasetName: 'Test Dataset',
    status,
    message: 'Test message',
    submittedAt: new Date('2023-10-01T10:00:00Z'),
    progressPercentage: status === NormalizationJobStatus.COMPLETED ? 100 : 50,
    lastUpdated
  });

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

    cleanupService = new JobCleanupService(mockRepository);
  });

  describe('removeCompletedJobs', () => {
    it('should remove all completed jobs', async () => {
      const completedJobs = [
        createMockJob('job-1', NormalizationJobStatus.COMPLETED, new Date()),
        createMockJob('job-2', NormalizationJobStatus.COMPLETED, new Date())
      ];
      const failedJobs = [
        createMockJob('job-3', NormalizationJobStatus.FAILED, new Date())
      ];
      const cancelledJobs = [
        createMockJob('job-4', NormalizationJobStatus.CANCELLED, new Date())
      ];

      mockRepository.getByStatus
        .mockResolvedValueOnce(completedJobs)
        .mockResolvedValueOnce(failedJobs)
        .mockResolvedValueOnce(cancelledJobs);

      const removedCount = await cleanupService.removeCompletedJobs();

      expect(removedCount).toBe(4);
      expect(mockRepository.getByStatus).toHaveBeenCalledWith(NormalizationJobStatus.COMPLETED);
      expect(mockRepository.getByStatus).toHaveBeenCalledWith(NormalizationJobStatus.FAILED);
      expect(mockRepository.getByStatus).toHaveBeenCalledWith(NormalizationJobStatus.CANCELLED);
      
      expect(mockRepository.remove).toHaveBeenCalledWith('job-1');
      expect(mockRepository.remove).toHaveBeenCalledWith('job-2');
      expect(mockRepository.remove).toHaveBeenCalledWith('job-3');
      expect(mockRepository.remove).toHaveBeenCalledWith('job-4');
      
      expect(logger.info).toHaveBeenCalledWith('Removed completed jobs', { count: 4 });
    });

    it('should handle empty completed jobs lists', async () => {
      mockRepository.getByStatus.mockResolvedValue([]);

      const removedCount = await cleanupService.removeCompletedJobs();

      expect(removedCount).toBe(0);
      expect(mockRepository.remove).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should handle mixed empty and non-empty status lists', async () => {
      const completedJobs = [
        createMockJob('job-1', NormalizationJobStatus.COMPLETED, new Date())
      ];

      mockRepository.getByStatus
        .mockResolvedValueOnce(completedJobs) // COMPLETED
        .mockResolvedValueOnce([]) // FAILED
        .mockResolvedValueOnce([]); // CANCELLED

      const removedCount = await cleanupService.removeCompletedJobs();

      expect(removedCount).toBe(1);
      expect(mockRepository.remove).toHaveBeenCalledWith('job-1');
      expect(logger.info).toHaveBeenCalledWith('Removed completed jobs', { count: 1 });
    });

    it('should continue removing jobs even if one removal fails', async () => {
      const jobs = [
        createMockJob('job-1', NormalizationJobStatus.COMPLETED, new Date()),
        createMockJob('job-2', NormalizationJobStatus.COMPLETED, new Date())
      ];

      mockRepository.getByStatus
        .mockResolvedValueOnce(jobs)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockRepository.remove
        .mockResolvedValueOnce(undefined) // job-1 succeeds
        .mockRejectedValueOnce(new Error('Remove failed')); // job-2 fails

      // Should still attempt to remove both jobs
      await expect(cleanupService.removeCompletedJobs()).rejects.toThrow('Remove failed');
      
      expect(mockRepository.remove).toHaveBeenCalledWith('job-1');
      expect(mockRepository.remove).toHaveBeenCalledWith('job-2');
    });

    it('should log correct count when jobs are removed', async () => {
      const jobs = [
        createMockJob('job-1', NormalizationJobStatus.COMPLETED, new Date()),
        createMockJob('job-2', NormalizationJobStatus.FAILED, new Date()),
        createMockJob('job-3', NormalizationJobStatus.CANCELLED, new Date())
      ];

      mockRepository.getByStatus
        .mockResolvedValueOnce([jobs[0]])
        .mockResolvedValueOnce([jobs[1]])
        .mockResolvedValueOnce([jobs[2]]);

      await cleanupService.removeCompletedJobs();

      expect(logger.info).toHaveBeenCalledWith('Removed completed jobs', { count: 3 });
    });
  });

  describe('removeOldJobs', () => {
    let originalDateNow: () => number;
    const fixedNow = new Date('2023-10-01T12:00:00Z').getTime();

    beforeEach(() => {
      originalDateNow = Date.now;
      Date.now = jest.fn(() => fixedNow);
    });

    afterEach(() => {
      Date.now = originalDateNow;
    });

    it('should remove completed jobs older than specified hours', async () => {
      // Fixed time is 2023-10-01T12:00:00Z
      // 24 hours ago would be 2023-09-30T12:00:00Z
      const oldCompletedJob = createMockJob(
        'old-completed',
        NormalizationJobStatus.COMPLETED,
        new Date('2023-09-30T10:00:00Z') // 26 hours ago - should be removed
      );
      const oldFailedJob = createMockJob(
        'old-failed',
        NormalizationJobStatus.FAILED,
        new Date('2023-09-30T11:00:00Z') // 25 hours ago - should be removed
      );
      const recentCompletedJob = createMockJob(
        'recent-completed',
        NormalizationJobStatus.COMPLETED,
        new Date('2023-10-01T11:00:00Z') // 1 hour ago - should NOT be removed
      );
      const activeJob = createMockJob(
        'active-job',
        NormalizationJobStatus.PROCESSING,
        new Date('2023-09-30T10:00:00Z') // 26 hours ago but active - should NOT be removed
      );

      mockRepository.getAll.mockResolvedValue([
        oldCompletedJob,
        oldFailedJob,
        recentCompletedJob,
        activeJob
      ]);

      const removedCount = await cleanupService.removeOldJobs(24);

      expect(removedCount).toBe(2);
      expect(mockRepository.remove).toHaveBeenCalledWith('old-completed');
      expect(mockRepository.remove).toHaveBeenCalledWith('old-failed');
      expect(mockRepository.remove).not.toHaveBeenCalledWith('recent-completed');
      expect(mockRepository.remove).not.toHaveBeenCalledWith('active-job');
      
      expect(logger.info).toHaveBeenCalledWith(
        'Removed old completed jobs',
        { count: 2, olderThanHours: 24 }
      );
    });

    it('should not remove active jobs regardless of age', async () => {
      const oldActiveJobs = [
        createMockJob('old-queued', NormalizationJobStatus.QUEUED, new Date('2023-09-30T10:00:00Z')),
        createMockJob('old-processing', NormalizationJobStatus.PROCESSING, new Date('2023-09-30T10:00:00Z'))
      ];

      mockRepository.getAll.mockResolvedValue(oldActiveJobs);

      const removedCount = await cleanupService.removeOldJobs(24);

      expect(removedCount).toBe(0);
      expect(mockRepository.remove).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should handle different time thresholds correctly', async () => {
      const jobs = [
        createMockJob('job-1h', NormalizationJobStatus.COMPLETED, new Date('2023-10-01T11:00:00Z')), // 1h ago
        createMockJob('job-6h', NormalizationJobStatus.COMPLETED, new Date('2023-10-01T06:00:00Z')), // 6h ago
        createMockJob('job-12h', NormalizationJobStatus.COMPLETED, new Date('2023-10-01T00:00:00Z')), // 12h ago
        createMockJob('job-25h', NormalizationJobStatus.COMPLETED, new Date('2023-09-30T11:00:00Z')) // 25h ago
      ];

      mockRepository.getAll.mockResolvedValue(jobs);

      // Test 2 hour threshold
      mockRepository.remove.mockClear();
      await cleanupService.removeOldJobs(2);
      expect(mockRepository.remove).toHaveBeenCalledTimes(3); // job-6h, job-12h, job-25h

      // Test 8 hour threshold
      mockRepository.remove.mockClear();
      await cleanupService.removeOldJobs(8);
      expect(mockRepository.remove).toHaveBeenCalledTimes(2); // job-12h, job-25h

      // Test 48 hour threshold
      mockRepository.remove.mockClear();
      await cleanupService.removeOldJobs(48);
      expect(mockRepository.remove).not.toHaveBeenCalled(); // No jobs older than 48h
    });

    it('should return 0 when no old jobs to remove', async () => {
      const recentJobs = [
        createMockJob('recent-1', NormalizationJobStatus.COMPLETED, new Date('2023-10-01T11:30:00Z')),
        createMockJob('recent-2', NormalizationJobStatus.FAILED, new Date('2023-10-01T11:45:00Z'))
      ];

      mockRepository.getAll.mockResolvedValue(recentJobs);

      const removedCount = await cleanupService.removeOldJobs(24);

      expect(removedCount).toBe(0);
      expect(mockRepository.remove).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should handle empty job list', async () => {
      mockRepository.getAll.mockResolvedValue([]);

      const removedCount = await cleanupService.removeOldJobs(24);

      expect(removedCount).toBe(0);
      expect(mockRepository.remove).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should continue removing jobs even if one removal fails', async () => {
      const oldJobs = [
        createMockJob('job-1', NormalizationJobStatus.COMPLETED, new Date('2023-09-30T10:00:00Z')),
        createMockJob('job-2', NormalizationJobStatus.COMPLETED, new Date('2023-09-30T11:00:00Z'))
      ];

      mockRepository.getAll.mockResolvedValue(oldJobs);
      mockRepository.remove
        .mockResolvedValueOnce(undefined) // job-1 succeeds
        .mockRejectedValueOnce(new Error('Remove failed')); // job-2 fails

      await expect(cleanupService.removeOldJobs(24)).rejects.toThrow('Remove failed');
      
      expect(mockRepository.remove).toHaveBeenCalledWith('job-1');
      expect(mockRepository.remove).toHaveBeenCalledWith('job-2');
    });

    it('should log with correct parameters', async () => {
      const oldJob = createMockJob(
        'old-job',
        NormalizationJobStatus.COMPLETED,
        new Date('2023-09-30T10:00:00Z')
      );

      mockRepository.getAll.mockResolvedValue([oldJob]);

      await cleanupService.removeOldJobs(12);

      expect(logger.info).toHaveBeenCalledWith(
        'Removed old completed jobs',
        { count: 1, olderThanHours: 12 }
      );
    });
  });

  describe('error handling', () => {
    it('should propagate repository errors from removeCompletedJobs', async () => {
      mockRepository.getByStatus.mockRejectedValue(new Error('Repository error'));

      await expect(cleanupService.removeCompletedJobs()).rejects.toThrow('Repository error');
    });

    it('should propagate repository errors from removeOldJobs', async () => {
      mockRepository.getAll.mockRejectedValue(new Error('Repository error'));

      await expect(cleanupService.removeOldJobs(24)).rejects.toThrow('Repository error');
    });

    it('should propagate individual remove errors', async () => {
      const jobs = [createMockJob('job-1', NormalizationJobStatus.COMPLETED, new Date())];
      
      mockRepository.getByStatus.mockResolvedValue(jobs);
      mockRepository.remove.mockRejectedValue(new Error('Remove failed'));

      await expect(cleanupService.removeCompletedJobs()).rejects.toThrow('Remove failed');
    });
  });
});