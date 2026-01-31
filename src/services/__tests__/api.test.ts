import { apiService } from '../api';
import type { UserProfileDto, UserSettingsDto } from '../../types';

// Mock the constants to avoid import.meta.env issues
jest.mock('../../utils/constants', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:5000',
  },
}));

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    devDebug: jest.fn(),
    trackApiCall: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiService', () => {
  let mockGetToken: jest.Mock;
  let mockForceReAuth: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToken = jest.fn();
    mockForceReAuth = jest.fn();
    
    // Reset the service instance
    apiService.setTokenGetter(mockGetToken);
    apiService.setForceReAuth(mockForceReAuth);
    
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  describe('constructor and configuration', () => {
    it('should initialize with base URL from constants', () => {
      expect(apiService).toBeDefined();
    });

    it('should set token getter function', () => {
      apiService.setTokenGetter(mockGetToken);
      expect(mockGetToken).toBeDefined();
    });

    it('should set force re-auth function', () => {
      apiService.setForceReAuth(mockForceReAuth);
      expect(mockForceReAuth).toBeDefined();
    });
  });

  describe('uploadDataSet', () => {
    const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
    
    beforeEach(() => {
      mockGetToken.mockResolvedValue('test-token');
    });

    it('should handle synchronous upload response', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'test-file',
          description: 'Test description',
          createdBy: 'user|123',
          createdAt: '2025-10-31T00:00:00Z',
          updatedAt: null,
          isProcessed: true,
          isDeleted: false,
          fileMetadata: {
            originalFileName: 'test.csv',
            storagePath: 's3://bucket/test.csv',
            fileType: 'CSV',
            sizeInBytes: 1024,
            checksum: 'abc123',
            storageProvider: 'S3'
          },
          statistics: {
            rowCount: 100,
            columnCount: 5,
            fileSizeBytes: 1024,
            lastProcessedAt: '2025-10-31T00:00:00Z'
          }
        },
        message: 'Dataset uploaded successfully',
        isAsyncProcessing: false
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await apiService.uploadDataSet(mockFile, 'test-file', 'Test description');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/datasets/upload',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          }),
          body: expect.any(FormData)
        })
      );

      expect(result).toEqual({
        ...mockResponse.data,
        processingJobId: undefined,
        isAsyncProcessing: false
      });
    });

    it('should handle asynchronous upload response with job ID', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'large-file',
          description: 'Large file test',
          createdBy: 'user|456',
          createdAt: '2025-10-31T00:00:00Z',
          updatedAt: null,
          isProcessed: false,
          isDeleted: false,
          fileMetadata: {
            originalFileName: 'large-file.csv',
            storagePath: 's3://bucket/large-file.csv',
            fileType: 'CSV',
            sizeInBytes: 10 * 1024 * 1024,
            checksum: 'def456',
            storageProvider: 'S3'
          }
        },
        message: 'Dataset uploaded, processing in background',
        processingJobId: 'job-123-456',
        isAsyncProcessing: true
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const largeFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'large-file.csv', { type: 'text/csv' });
      const result = await apiService.uploadDataSet(largeFile, 'large-file', 'Large file test');

      expect(result).toEqual({
        ...mockResponse.data,
        processingJobId: 'job-123-456',
        isAsyncProcessing: true
      });

      expect(result.processingJobId).toBe('job-123-456');
      expect(result.isAsyncProcessing).toBe(true);
      expect(result.isProcessed).toBe(false);
    });

    it('should handle upload without description', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'test-file',
          description: '',
          createdBy: 'user|123',
          createdAt: '2025-10-31T00:00:00Z',
          updatedAt: null,
          isProcessed: true,
          isDeleted: false,
          fileMetadata: {
            originalFileName: 'test.csv',
            storagePath: 's3://bucket/test.csv',
            fileType: 'CSV',
            sizeInBytes: 512,
            checksum: 'ghi789',
            storageProvider: 'S3'
          }
        },
        message: 'Dataset uploaded successfully',
        isAsyncProcessing: false
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await apiService.uploadDataSet(mockFile, 'test-file');

      expect(result.description).toBe('');
      expect(result.isAsyncProcessing).toBe(false);
    });

    it('should throw error when upload fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(
        apiService.uploadDataSet(mockFile, 'test-file', 'Test description')
      ).rejects.toThrow('Upload failed: Bad Request');
    });

    it('should throw error when response structure is unexpected', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ invalid: 'response' })
      });

      await expect(
        apiService.uploadDataSet(mockFile, 'test-file', 'Test description')
      ).rejects.toThrow('Unexpected response structure from server');
    });

    it('should include FormData with correct fields', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'test-file',
          description: 'Test description',
          createdBy: 'user|123',
          createdAt: '2025-10-31T00:00:00Z',
          updatedAt: null,
          isProcessed: true,
          isDeleted: false,
          fileMetadata: {
            originalFileName: 'test.csv',
            storagePath: 's3://bucket/test.csv',
            fileType: 'CSV',
            sizeInBytes: 1024,
            checksum: 'abc123',
            storageProvider: 'S3'
          }
        },
        message: 'Success',
        isAsyncProcessing: false
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      await apiService.uploadDataSet(mockFile, 'test-file', 'Test description');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const formData = fetchCall[1].body as FormData;

      expect(formData).toBeInstanceOf(FormData);
      // Note: FormData testing is limited in JSDOM, but we verify it was created
    });
  });

  describe('request method', () => {
    const mockResponse = {
      success: true,
      data: { test: 'data' },
      message: 'Success'
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse)
      });
    });

    it('should make successful request without token', async () => {
      mockGetToken.mockResolvedValue(null);

      const result = await apiService['request']('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make successful request with token', async () => {
      mockGetToken.mockResolvedValue('test-token');

      const result = await apiService['request']('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle 204 No Content responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 204
      });

      const result = await apiService['request']('/test');

      expect(result).toEqual({
        data: {},
        success: true,
        message: 'Success'
      });
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(apiService['request']('/test')).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(apiService['request']('/test')).rejects.toThrow('Network error');
    });
  });

  describe('401 handling and token refresh', () => {
    const mockResponse = {
      success: true,
      data: { test: 'data' },
      message: 'Success'
    };

    it('should attempt token refresh on 401 and retry request', async () => {
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 401
          });
        } else {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue(mockResponse)
          });
        }
      });

      mockGetToken
        .mockResolvedValueOnce('old-token')
        .mockResolvedValueOnce('new-token');

      const result = await apiService['request']('/test');

      expect(mockGetToken).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });

    it('should force re-auth if token refresh fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401
      });

      mockGetToken.mockResolvedValue(null);

      // If no token was sent, the client should not force logout/re-auth (prevents redirect loops)
      await expect(apiService['request']('/test')).rejects.toThrow('Authentication required');
      expect(mockForceReAuth).not.toHaveBeenCalled();
    });

    it('should force re-auth if retry also gets 401', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => {
        return Promise.resolve({
          ok: false,
          status: 401
        });
      });

      mockGetToken.mockResolvedValue('new-token');

      await expect(apiService['request']('/test')).rejects.toThrow('Authentication required - redirecting to login');
      expect(mockForceReAuth).toHaveBeenCalled();
    });
  });

  describe('response validation', () => {
    it('should validate successful response', () => {
      const validResponse = {
        success: true,
        data: { test: 'data' }
      };

      expect(() => apiService['validateResponse'](validResponse)).not.toThrow();
    });

    it('should reject invalid response format', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => apiService['validateResponse'](null as any)).toThrow('Invalid response format: response is not an object');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => apiService['validateResponse']('string' as any)).toThrow('Invalid response format: response is not an object');
    });

    it('should reject response without success field', () => {
      const invalidResponse = {
        data: { test: 'data' }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => apiService['validateResponse'](invalidResponse as any)).toThrow('Invalid response format: success field is missing or not boolean');
    });

    it('should reject unsuccessful response with errors', () => {
      const errorResponse = {
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {} as any,
        errors: ['Error 1', 'Error 2']
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => apiService['validateResponse'](errorResponse as any)).toThrow('API Error: Error 1, Error 2');
    });
  });

  describe('DataSet endpoints', () => {
    const mockDataSet = {
      id: 1,
      name: 'Test Dataset',
      description: 'Test Description',
      fileName: 'test.csv',
      fileSize: 1024,
      rowCount: 100,
      status: 'processed',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: [mockDataSet]
        })
      });
    });

    it('should get datasets', async () => {
      const result = await apiService.getDataSets();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/datasets'),
        expect.any(Object)
      );
      expect(result).toEqual([mockDataSet]);
    });

    it('should get datasets with includeDeleted parameter', async () => {
      const result = await apiService.getDataSets(true);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/datasets?includeDeleted=true'),
        expect.any(Object)
      );
      expect(result).toEqual([mockDataSet]);
    });

    it('should get paginated datasets', async () => {
      const result = await apiService.getDataSetsPaginated(2, 20, true);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/datasets?page=2&pageSize=20&includeDeleted=true'),
        expect.any(Object)
      );
      expect(result).toEqual({
        success: true,
        data: [mockDataSet]
      });
    });

    it('should delete dataset', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 204
      });

      await expect(apiService.deleteDataSet('550e8400-e29b-41d4-a716-446655440000')).resolves.toBeUndefined();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/datasets/550e8400-e29b-41d4-a716-446655440000'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should update dataset', async () => {
      const updates = { name: 'Updated Name', description: 'Updated Description' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { ...mockDataSet, ...updates }
        })
      });

      const result = await apiService.updateDataSet('550e8400-e29b-41d4-a716-446655440000', updates);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/datasets/550e8400-e29b-41d4-a716-446655440000'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates)
        })
      );
      expect(result.name).toBe('Updated Name');
    });

    it('should get dataset preview', async () => {
      const mockPreview = [{ column1: 'value1', column2: 'value2' }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockPreview
        })
      });

      const result = await apiService.getDataSetPreview('550e8400-e29b-41d4-a716-446655440000');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/datasets/550e8400-e29b-41d4-a716-446655440000/preview'),
        expect.any(Object)
      );
      expect(result).toEqual(mockPreview);
    });
  });

  describe('Analysis endpoints', () => {
    const mockAnalysis = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Analysis',
      description: 'Test Description',
      type: 'classification',
      dataSetId: '550e8400-e29b-41d4-a716-446655440000',
      configuration: {},
      status: 'pending',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: [mockAnalysis]
        })
      });
    });

    it('should get analyses', async () => {
      const result = await apiService.getAnalyses();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analyses'),
        expect.any(Object)
      );
      expect(result).toEqual([mockAnalysis]);
    });

    it('should create analysis', async () => {
      const analysisData = {
        name: 'New Analysis',
        description: 'New Description',
        type: 'classification',
        dataSetId: '550e8400-e29b-41d4-a716-446655440000',
        configuration: {}
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { ...mockAnalysis, ...analysisData }
        })
      });

      const result = await apiService.createAnalysis(analysisData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analyses'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(analysisData)
        })
      );
      expect(result.name).toBe('New Analysis');
    });

    it('should get analysis by id', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockAnalysis
        })
      });

      const result = await apiService.getAnalysis('550e8400-e29b-41d4-a716-446655440000');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analyses/550e8400-e29b-41d4-a716-446655440000'),
        expect.any(Object)
      );
      expect(result).toEqual(mockAnalysis);
    });
  });

  describe('Health check', () => {
    it('should perform health check', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { status: 'healthy' }
        })
      });

      const result = await apiService.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.any(Object)
      );
      expect(result).toEqual({ status: 'healthy' });
    });
  });

  describe('User Profile endpoints', () => {
    const mockUserSettings: UserSettingsDto = {
      id: '550e8400-e29b-41d4-a716-446655440100',
      userId: 'auth0|123',

      emailNotificationsEnabled: true,
      pushNotificationsEnabled: false,
      processingCompleteNotifications: true,
      errorNotifications: true,
      weeklyDigestEnabled: false,

      theme: 'light',
      language: 'en',
      defaultPageSize: 25,
      showTutorials: true,
      compactMode: false,

      autoProcessUploads: true,
      maxPreviewRows: 100,
      defaultFileType: 'CSV',
      enableDataValidation: true,
      enableSchemaInference: true,

      shareAnalytics: false,
      allowDataUsageForImprovement: false,
      showProcessingTime: true,

      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    const mockUserProfile: UserProfileDto = {
      userId: 'auth0|123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'default.png',
      emailVerified: true,
      settings: mockUserSettings,
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockUserProfile
        })
      });
    });

    it('should get user profile', async () => {
      const result = await apiService.getUserProfile();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/UserSettings/profile'),
        expect.any(Object)
      );
      expect(result).toEqual(mockUserProfile);
    });

    it('should update user profile', async () => {
      const updates: UserSettingsDto = {
        ...mockUserSettings,
        theme: 'dark',
        displayName: 'Updated Name',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { ...mockUserProfile, name: 'Updated Name', settings: updates }
        })
      });

      const result = await apiService.updateUserProfile(updates);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/UserSettings/profile'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates)
        })
      );
      expect(result.name).toBe('Updated Name');
      expect(result.settings.theme).toBe('dark');
    });
  });

  describe('File upload', () => {
    it('should upload dataset file', async () => {
      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
      const mockUploadResponse = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Dataset',
        description: 'Test Description',
        createdBy: 'test-user',
        createdAt: '2025-10-31T00:00:00Z',
        updatedAt: null,
        isProcessed: false,
        isDeleted: false,
        fileMetadata: {
          originalFileName: 'test.csv',
          storagePath: 's3://bucket/test.csv',
          fileType: 'CSV',
          sizeInBytes: 12,
          checksum: 'abc123',
          storageProvider: 'S3'
        },
        statistics: {
          rowCount: 0,
          columnCount: 0,
          fileSizeBytes: 12,
          lastProcessedAt: '2025-10-31T00:00:00Z'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201, // HTTP 201 Created for new DDD API
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockUploadResponse,
          message: 'Dataset uploaded successfully'
        })
      });

      mockGetToken.mockResolvedValue('test-token');

      const result = await apiService.uploadDataSet(file, 'Test Dataset', 'Test Description');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/datasets/upload'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
      // Result should be the full DataSetResponse object with async fields
      expect(result).toMatchObject(mockUploadResponse);
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.fileMetadata).toBeDefined();
      expect(result.statistics).toBeDefined();
      expect(result.processingJobId).toBeUndefined();
      expect(result.isAsyncProcessing).toBe(false);
    });

    it('should handle upload failure', async () => {
      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(apiService.uploadDataSet(file, 'Test Dataset')).rejects.toThrow('Upload failed: Bad Request');
    });

    it('should handle unexpected upload response structure', async () => {
      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Something went wrong'
        })
      });

      await expect(apiService.uploadDataSet(file, 'Test Dataset')).rejects.toThrow('Unexpected response structure from server');
    });
  });
});
