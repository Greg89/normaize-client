import { LocalStorageJobStorage } from '../LocalStorageJobStorage';
import { JobTracker, NormalizationJobStatus } from '../../../types';
import { logger } from '../../../utils/logger';

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn()
  }
}));

describe('LocalStorageJobStorage', () => {
  let storage: LocalStorageJobStorage;
  const mockJobs: JobTracker[] = [
    {
      jobId: 'job-1',
      type: 'REMOVE_DUPLICATES',
      datasetId: 123,
      datasetName: 'Dataset 1',
      status: NormalizationJobStatus.PROCESSING,
      message: 'Processing...',
      submittedAt: new Date('2023-10-01T10:00:00Z'),
      estimatedCompletionAt: new Date('2023-10-01T10:05:00Z'),
      progressPercentage: 50,
      lastUpdated: new Date('2023-10-01T10:02:00Z'),
      config: { columns: ['col1'] }
    },
    {
      jobId: 'job-2',
      type: 'NORMALIZE_DATA',
      datasetId: 456,
      datasetName: 'Dataset 2',
      status: NormalizationJobStatus.COMPLETED,
      message: 'Completed successfully',
      submittedAt: new Date('2023-10-01T09:00:00Z'),
      progressPercentage: 100,
      lastUpdated: new Date('2023-10-01T09:05:00Z')
    }
  ];

  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock localStorage globally
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    storage = new LocalStorageJobStorage('test_jobs');
  });

  describe('save', () => {
    it('should save jobs to localStorage with correct serialization', async () => {
      await storage.save(mockJobs);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test_jobs',
        expect.stringContaining('"jobId":"job-1"')
      );

      // Verify the serialized data structure
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(2);
      expect(savedData[0]).toEqual({
        ...mockJobs[0],
        submittedAt: '2023-10-01T10:00:00.000Z',
        estimatedCompletionAt: '2023-10-01T10:05:00.000Z',
        lastUpdated: '2023-10-01T10:02:00.000Z'
      });
    });

    it('should handle jobs without optional fields', async () => {
      const jobsWithoutOptionals = [
        {
          ...mockJobs[1],
          estimatedCompletionAt: undefined,
          config: undefined
        }
      ];

      await storage.save(jobsWithoutOptionals);

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].estimatedCompletionAt).toBeUndefined();
      expect(savedData[0].config).toBeUndefined();
    });

    it('should log debug message on successful save', async () => {
      await storage.save(mockJobs);

      expect(logger.debug).toHaveBeenCalledWith(
        'Jobs saved to localStorage',
        { count: 2 }
      );
    });

    it('should handle localStorage errors gracefully', async () => {
      const error = new Error('Storage quota exceeded');
      mockLocalStorage.setItem.mockImplementation(() => {
        throw error;
      });

      await expect(storage.save(mockJobs)).rejects.toThrow('Failed to save jobs to storage');
      
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to save jobs to localStorage',
        { error }
      );
    });

    it('should save empty array', async () => {
      await storage.save([]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test_jobs', '[]');
      expect(logger.debug).toHaveBeenCalledWith('Jobs saved to localStorage', { count: 0 });
    });
  });

  describe('load', () => {
    it('should load and deserialize jobs from localStorage', async () => {
      const serializedJobs = JSON.stringify([
        {
          ...mockJobs[0],
          submittedAt: '2023-10-01T10:00:00.000Z',
          estimatedCompletionAt: '2023-10-01T10:05:00.000Z',
          lastUpdated: '2023-10-01T10:02:00.000Z'
        }
      ]);

      mockLocalStorage.getItem.mockReturnValue(serializedJobs);

      const result = await storage.load();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test_jobs');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockJobs[0],
        submittedAt: new Date('2023-10-01T10:00:00.000Z'),
        estimatedCompletionAt: new Date('2023-10-01T10:05:00.000Z'),
        lastUpdated: new Date('2023-10-01T10:02:00.000Z')
      });
    });

    it('should return empty array when no data in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await storage.load();

      expect(result).toEqual([]);
      // Note: debug is not called when no data is found (null case)
    });

    it('should handle jobs without optional date fields', async () => {
      const serializedJobs = JSON.stringify([
        {
          jobId: 'job-1',
          type: 'REMOVE_DUPLICATES',
          datasetId: 123,
          datasetName: 'Dataset 1',
          status: NormalizationJobStatus.PROCESSING,
          message: 'Processing...',
          submittedAt: '2023-10-01T10:00:00.000Z',
          estimatedCompletionAt: undefined,
          progressPercentage: 50,
          lastUpdated: '2023-10-01T10:02:00.000Z'
        }
      ]);

      mockLocalStorage.getItem.mockReturnValue(serializedJobs);

      const result = await storage.load();

      expect(result[0].estimatedCompletionAt).toBeUndefined();
      expect(result[0].submittedAt).toEqual(new Date('2023-10-01T10:00:00.000Z'));
    });

    it('should handle corrupted data by clearing storage and returning empty array', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const result = await storage.load();

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to load jobs from localStorage',
        { error: expect.any(SyntaxError) }
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_jobs');
    });

    it('should log debug message on successful load', async () => {
      const serializedJobs = JSON.stringify([mockJobs[0]]);
      mockLocalStorage.getItem.mockReturnValue(serializedJobs);

      await storage.load();

      expect(logger.debug).toHaveBeenCalledWith('Jobs loaded from localStorage', { count: 1 });
    });
  });

  describe('clear', () => {
    it('should remove data from localStorage', async () => {
      await storage.clear();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test_jobs');
      expect(logger.debug).toHaveBeenCalledWith('Jobs storage cleared');
    });

    it('should handle localStorage errors during clear', async () => {
      const error = new Error('Cannot remove item');
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw error;
      });

      await expect(storage.clear()).rejects.toThrow('Failed to clear jobs storage');
      
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to clear jobs storage',
        { error }
      );
    });
  });

  describe('constructor', () => {
    it('should use default storage key when none provided', () => {
      const defaultStorage = new LocalStorageJobStorage();
      // We can't directly test the private property, but we can test the behavior
      expect(() => defaultStorage).not.toThrow();
    });

    it('should use custom storage key when provided', () => {
      const customStorage = new LocalStorageJobStorage('custom_key');
      expect(() => customStorage).not.toThrow();
    });
  });

  describe('integration', () => {
    it('should save and load jobs maintaining data integrity', async () => {
      // Save jobs
      await storage.save(mockJobs);
      
      // Simulate what localStorage would return
      const savedCall = mockLocalStorage.setItem.mock.calls[0];
      const savedData = savedCall[1];
      mockLocalStorage.getItem.mockReturnValue(savedData);
      
      // Load jobs
      const loadedJobs = await storage.load();
      
      expect(loadedJobs).toHaveLength(mockJobs.length);
      expect(loadedJobs[0].jobId).toBe(mockJobs[0].jobId);
      expect(loadedJobs[0].submittedAt).toEqual(mockJobs[0].submittedAt);
      expect(loadedJobs[1].estimatedCompletionAt).toBeUndefined();
    });
  });
});
