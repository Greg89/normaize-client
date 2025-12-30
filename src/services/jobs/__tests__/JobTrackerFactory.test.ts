import { JobTrackerFactory } from '../JobTrackerFactory';
import { NormalizationJobResponse, NormalizationJobStatus, JobTracker } from '../../../types';

describe('JobTrackerFactory', () => {
  let factory: JobTrackerFactory;

  beforeEach(() => {
    factory = new JobTrackerFactory();
  });

  describe('createFromResponse', () => {
    const mockResponse: NormalizationJobResponse = {
      jobId: 'test-job-123',
      status: NormalizationJobStatus.QUEUED,
      message: 'Job queued for processing',
      submittedAt: '2023-10-01T10:00:00Z',
      estimatedCompletionAt: '2023-10-01T10:05:00Z',
      progressPercentage: 0,
      success: true
    };

    it('should create a JobTracker from a complete response', () => {
      const result = factory.createFromResponse(
        mockResponse,
        'REMOVE_DUPLICATES',
        123,
        'Test Dataset',
        { columns: ['col1', 'col2'] }
      );

      expect(result).toEqual({
        jobId: 'test-job-123',
        type: 'REMOVE_DUPLICATES',
        datasetId: 123,
        datasetName: 'Test Dataset',
        status: NormalizationJobStatus.QUEUED,
        message: 'Job queued for processing',
        submittedAt: new Date('2023-10-01T10:00:00Z'),
        estimatedCompletionAt: new Date('2023-10-01T10:05:00Z'),
        progressPercentage: 0,
        lastUpdated: expect.any(Date),
        config: { columns: ['col1', 'col2'] }
      });
    });

    it('should create a JobTracker without estimated completion time', () => {
      const responseWithoutEstimate = {
        ...mockResponse,
        estimatedCompletionAt: undefined
      };

      const result = factory.createFromResponse(
        responseWithoutEstimate,
        'NORMALIZE_DATA',
        456,
        'Another Dataset'
      );

      expect(result.estimatedCompletionAt).toBeUndefined();
      expect(result.datasetId).toBe(456);
      expect(result.type).toBe('NORMALIZE_DATA');
    });

    it('should create a JobTracker without config', () => {
      const result = factory.createFromResponse(
        mockResponse,
        'TRANSFORM_DATA',
        789,
        'Transform Dataset'
      );

      expect(result.config).toBeUndefined();
      expect(result.type).toBe('TRANSFORM_DATA');
    });

    it('should handle different job statuses', () => {
      const statuses = [
        NormalizationJobStatus.QUEUED,
        NormalizationJobStatus.PROCESSING,
        NormalizationJobStatus.COMPLETED,
        NormalizationJobStatus.FAILED,
        NormalizationJobStatus.CANCELLED
      ];

      statuses.forEach(status => {
        const response = { ...mockResponse, status };
        const result = factory.createFromResponse(response, 'REMOVE_DUPLICATES', 123, 'Test');
        expect(result.status).toBe(status);
      });
    });

    it('should set lastUpdated to current time', () => {
      const before = new Date();
      const result = factory.createFromResponse(mockResponse, 'REMOVE_DUPLICATES', 123, 'Test');
      const after = new Date();

      expect(result.lastUpdated.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.lastUpdated.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('updateFromResponse', () => {
    const originalJob: JobTracker = {
      jobId: 'test-job-123',
      type: 'REMOVE_DUPLICATES',
      datasetId: 123,
      datasetName: 'Test Dataset',
      status: NormalizationJobStatus.QUEUED,
      message: 'Job queued for processing',
      submittedAt: new Date('2023-10-01T10:00:00Z'),
      estimatedCompletionAt: new Date('2023-10-01T10:05:00Z'),
      progressPercentage: 0,
      lastUpdated: new Date('2023-10-01T10:00:00Z'),
      config: { columns: ['col1', 'col2'] }
    };

    const updateResponse: NormalizationJobResponse = {
      jobId: 'test-job-123',
      status: NormalizationJobStatus.PROCESSING,
      message: 'Job is processing',
      submittedAt: '2023-10-01T10:00:00Z',
      estimatedCompletionAt: '2023-10-01T10:03:00Z',
      progressPercentage: 50,
      success: true
    };

    it('should update job with new response data', () => {
      const result = factory.updateFromResponse(originalJob, updateResponse);

      expect(result).toEqual({
        ...originalJob,
        status: NormalizationJobStatus.PROCESSING,
        message: 'Job is processing',
        progressPercentage: 50,
        estimatedCompletionAt: new Date('2023-10-01T10:03:00Z'),
        lastUpdated: expect.any(Date)
      });
    });

    it('should preserve original job metadata', () => {
      const result = factory.updateFromResponse(originalJob, updateResponse);

      expect(result.jobId).toBe(originalJob.jobId);
      expect(result.type).toBe(originalJob.type);
      expect(result.datasetId).toBe(originalJob.datasetId);
      expect(result.datasetName).toBe(originalJob.datasetName);
      expect(result.submittedAt).toBe(originalJob.submittedAt);
      expect(result.config).toBe(originalJob.config);
    });

    it('should update lastUpdated timestamp', () => {
      const before = new Date();
      const result = factory.updateFromResponse(originalJob, updateResponse);
      const after = new Date();

      expect(result.lastUpdated.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.lastUpdated.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(result.lastUpdated).not.toBe(originalJob.lastUpdated);
    });

    it('should handle removal of estimated completion time', () => {
      const updateWithoutEstimate = {
        ...updateResponse,
        estimatedCompletionAt: undefined
      };

      const result = factory.updateFromResponse(originalJob, updateWithoutEstimate);

      expect(result.estimatedCompletionAt).toBeUndefined();
    });

    it('should handle status transitions', () => {
      const statusTransitions = [
        { from: NormalizationJobStatus.QUEUED, to: NormalizationJobStatus.PROCESSING },
        { from: NormalizationJobStatus.PROCESSING, to: NormalizationJobStatus.COMPLETED },
        { from: NormalizationJobStatus.PROCESSING, to: NormalizationJobStatus.FAILED },
        { from: NormalizationJobStatus.QUEUED, to: NormalizationJobStatus.CANCELLED }
      ];

      statusTransitions.forEach(({ from, to }) => {
        const job = { ...originalJob, status: from };
        const response = { ...updateResponse, status: to };
        const result = factory.updateFromResponse(job, response);
        
        expect(result.status).toBe(to);
      });
    });
  });
});



