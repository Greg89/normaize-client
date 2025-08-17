import { apiService } from '../api';

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

      await expect(apiService['request']('/test')).rejects.toThrow('Authentication required - redirecting to login');
      expect(mockForceReAuth).toHaveBeenCalled();
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
      expect(() => apiService['validateResponse'](null as unknown)).toThrow('Invalid response format: response is not an object');
      expect(() => apiService['validateResponse']('string' as unknown)).toThrow('Invalid response format: response is not an object');
    });

    it('should reject response without success field', () => {
      const invalidResponse = {
        data: { test: 'data' }
      };

      expect(() => apiService['validateResponse'](invalidResponse as unknown)).toThrow('Invalid response format: success field is missing or not boolean');
    });

    it('should reject unsuccessful response with errors', () => {
      const errorResponse = {
        success: false,
        errors: ['Error 1', 'Error 2']
      };

      expect(() => apiService['validateResponse'](errorResponse)).toThrow('API Error: Error 1, Error 2');
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

      await expect(apiService.deleteDataSet(1)).resolves.toBeUndefined();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/datasets/1'),
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

      const result = await apiService.updateDataSet(1, updates);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/datasets/1'),
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

      const result = await apiService.getDataSetPreview(1);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/datasets/1/preview'),
        expect.any(Object)
      );
      expect(result).toEqual(mockPreview);
    });
  });

  describe('Analysis endpoints', () => {
    const mockAnalysis = {
      id: 1,
      name: 'Test Analysis',
      description: 'Test Description',
      type: 'classification',
      dataSetId: 1,
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
        dataSetId: 1,
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

      const result = await apiService.getAnalysis(1);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analyses/1'),
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
    const mockUserProfile = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'default.png',
      preferences: {},
      notifications: {},
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
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
      const updates = { name: 'Updated Name', preferences: { theme: 'dark' } };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { ...mockUserProfile, ...updates }
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
    });
  });

  describe('File upload', () => {
    it('should upload dataset file', async () => {
      const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
      const mockUploadResponse = {
        dataSetId: 123,
        message: 'Upload successful',
        success: true
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockUploadResponse,
          message: 'Upload successful'
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
      expect(result).toEqual({
        id: 123,
        message: 'Upload successful',
        success: true
      });
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
