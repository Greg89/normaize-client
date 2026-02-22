import { renderHook, act, waitFor } from '@testing-library/react';
import { useApi, useDataSets, useAnalyses, useAnalysis, useDeleteDataSet, useUpdateDataSet, useResetDataSet, useDatasetPreview } from '../useApi';
import { apiService } from '../../services/api';
import { ErrorHandler } from '../../utils/errorHandling';
import { ResetType, DataSet, Analysis } from '../../types';

const TEST_DATASET_ID = '550e8400-e29b-41d4-a716-446655440010';
const TEST_ANALYSIS_ID = '550e8400-e29b-41d4-a716-446655440001';

const makeDataset = (overrides: Partial<DataSet> = {}): DataSet => {
  const now = '2026-01-01T00:00:00Z';
  return {
    id: TEST_DATASET_ID,
    name: 'Dataset 1',
    createdBy: 'test-user',
    createdAt: now,
    isProcessed: true,
    isDeleted: false,
    statistics: {
      rowCount: 0,
      columnCount: 0,
      fileSizeBytes: 0,
      lastProcessedAt: now,
    },
    ...overrides,
  };
};

const makeAnalysis = (overrides: Partial<Analysis> = {}): Analysis => {
  const now = '2026-01-01T00:00:00Z';
  return {
    id: TEST_ANALYSIS_ID,
    name: 'Analysis 1',
    type: 'test',
    status: 'completed',
    createdAt: now,
    dataSetId: TEST_DATASET_ID,
    ...overrides,
  };
};

// Mock the API service
jest.mock('../../services/api', () => ({
  apiService: {
    getDataSets: jest.fn(),
    getAnalyses: jest.fn(),
    getAnalysis: jest.fn(),
    deleteDataSet: jest.fn(),
    updateDataSet: jest.fn(),
    resetDataSet: jest.fn(),
    getDataSetPreview: jest.fn(),
  },
}));

// Mock the error handler
jest.mock('../../utils/errorHandling', () => ({
  ErrorHandler: {
    handle: jest.fn(),
  },
  extractErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback,
}));

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generic useApi hook', () => {
    it('should initialize with loading state', () => {
      const mockApiCall = jest.fn().mockResolvedValue('test data');
      
      const { result } = renderHook(() => useApi(mockApiCall));
      
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should fetch data on mount', async () => {
      const mockApiCall = jest.fn().mockResolvedValue('test data');
      
      const { result } = renderHook(() => useApi(mockApiCall));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toBe('test data');
      expect(result.current.error).toBe(null);
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      const mockApiCall = jest.fn().mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useApi(mockApiCall));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe('API Error');
      expect(result.current.data).toBe(null);
      expect(ErrorHandler.handle).toHaveBeenCalledWith(mockError, 'useApi');
    });

    it('should handle non-Error objects', async () => {
      const mockApiCall = jest.fn().mockRejectedValue('String error');
      
      const { result } = renderHook(() => useApi(mockApiCall));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe('An error occurred');
      expect(ErrorHandler.handle).toHaveBeenCalledWith('String error', 'useApi');
    });

    it('should refetch data when refetch is called', async () => {
      const mockApiCall = jest.fn()
        .mockResolvedValueOnce('first data')
        .mockResolvedValueOnce('second data');
      
      const { result } = renderHook(() => useApi(mockApiCall));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toBe('first data');
      
      act(() => {
        result.current.refetch();
      });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toBe('second data');
      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });

    it('should set data manually', async () => {
      const mockApiCall = jest.fn().mockResolvedValue('initial data');
      
      const { result } = renderHook(() => useApi(mockApiCall));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      act(() => {
        result.current.setData('manual data');
      });
      
      expect(result.current.data).toBe('manual data');
    });

    it('should update when dependencies change', async () => {
      const mockApiCall1 = jest.fn().mockResolvedValue('data 1');
      const mockApiCall2 = jest.fn().mockResolvedValue('data 2');
      
      const { result, rerender } = renderHook(
        ({ dep }) => useApi(dep === 1 ? mockApiCall1 : mockApiCall2, [dep]),
        { initialProps: { dep: 1 } }
      );
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toBe('data 1');
      expect(mockApiCall1).toHaveBeenCalledTimes(1);
      
      rerender({ dep: 2 });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toBe('data 2');
      expect(mockApiCall2).toHaveBeenCalledTimes(1);
    });
  });

  describe('useDataSets hook', () => {
    it('should fetch datasets', async () => {
      const mockDatasets = [makeDataset()];
      (apiService.getDataSets as jest.Mock).mockResolvedValue(mockDatasets);
      
      const { result } = renderHook(() => useDataSets());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockDatasets);
      expect(apiService.getDataSets).toHaveBeenCalledWith(false);
    });

    it('should fetch datasets with includeDeleted parameter', async () => {
      const mockDatasets = [makeDataset()];
      (apiService.getDataSets as jest.Mock).mockResolvedValue(mockDatasets);
      
      const { result } = renderHook(() => useDataSets(true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockDatasets);
      expect(apiService.getDataSets).toHaveBeenCalledWith(true);
    });
  });

  describe('useAnalyses hook', () => {
    it('should fetch analyses', async () => {
      const mockAnalyses = [makeAnalysis()];
      (apiService.getAnalyses as jest.Mock).mockResolvedValue(mockAnalyses);
      
      const { result } = renderHook(() => useAnalyses());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockAnalyses);
      expect(apiService.getAnalyses).toHaveBeenCalled();
    });
  });

  describe('useAnalysis hook', () => {
    it('should fetch analysis by id', async () => {
      const mockAnalysis = { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Analysis 1' };
      (apiService.getAnalysis as jest.Mock).mockResolvedValue(mockAnalysis);
      
      const { result } = renderHook(() => useAnalysis('550e8400-e29b-41d4-a716-446655440001'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockAnalysis);
      expect(apiService.getAnalysis).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440001');
    });

    it('should refetch when id changes', async () => {
      const mockAnalysis1 = { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Analysis 1' };
      const mockAnalysis2 = { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Analysis 2' };
      
      (apiService.getAnalysis as jest.Mock)
        .mockResolvedValueOnce(mockAnalysis1)
        .mockResolvedValueOnce(mockAnalysis2);
      
      const { result, rerender } = renderHook(
        ({ id }) => useAnalysis(id),
        { initialProps: { id: '550e8400-e29b-41d4-a716-446655440001' } }
      );
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockAnalysis1);
      
      rerender({ id: '550e8400-e29b-41d4-a716-446655440002' });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockAnalysis2);
      expect(apiService.getAnalysis).toHaveBeenCalledTimes(2);
    });
  });

  describe('useDeleteDataSet hook', () => {
    it('should delete dataset successfully', async () => {
      (apiService.deleteDataSet as jest.Mock).mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useDeleteDataSet());
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      
      const deleteResult = await act(async () => {
        return await result.current.deleteDataSet(TEST_DATASET_ID);
      });
      
      expect(deleteResult).toBe(true);
      expect(apiService.deleteDataSet).toHaveBeenCalledWith(TEST_DATASET_ID);
    });

    it('should handle delete errors', async () => {
      const mockError = new Error('Delete failed');
      (apiService.deleteDataSet as jest.Mock).mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useDeleteDataSet());
      
      const deleteResult = await act(async () => {
        return await result.current.deleteDataSet(TEST_DATASET_ID);
      });
      
      expect(deleteResult).toBe(false);
      expect(result.current.error).toBe('Delete failed');
      expect(result.current.loading).toBe(false);
    });

    it('should handle non-Error objects in delete', async () => {
      (apiService.deleteDataSet as jest.Mock).mockRejectedValue('String error');
      
      const { result } = renderHook(() => useDeleteDataSet());
      
      const deleteResult = await act(async () => {
        return await result.current.deleteDataSet(TEST_DATASET_ID);
      });
      
      expect(deleteResult).toBe(false);
      expect(result.current.error).toBe('Failed to delete dataset');
    });
  });

  describe('useUpdateDataSet hook', () => {
    it('should update dataset successfully', async () => {
      const mockDataset = makeDataset({ id: TEST_DATASET_ID, name: 'Updated Dataset' });
      (apiService.updateDataSet as jest.Mock).mockResolvedValue(mockDataset);
      
      const { result } = renderHook(() => useUpdateDataSet());
      
      const updateResult = await result.current.updateDataSet(TEST_DATASET_ID, { name: 'Updated Dataset' });
      
      expect(updateResult).toEqual(mockDataset);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(apiService.updateDataSet).toHaveBeenCalledWith(TEST_DATASET_ID, { name: 'Updated Dataset' });
    });

    it('should handle update errors', async () => {
      const mockError = new Error('Update failed');
      (apiService.updateDataSet as jest.Mock).mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useUpdateDataSet());
      
      const updateResult = await result.current.updateDataSet(TEST_DATASET_ID, { name: 'Updated Dataset' });
      
      expect(updateResult).toBe(null);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Update failed');
      });
    });

    it('should handle non-Error objects in update', async () => {
      (apiService.updateDataSet as jest.Mock).mockRejectedValue('String error');
      
      const { result } = renderHook(() => useUpdateDataSet());
      
      const updateResult = await result.current.updateDataSet(TEST_DATASET_ID, { name: 'Updated Dataset' });
      
      expect(updateResult).toBe(null);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to update dataset');
      });
    });
  });

  describe('useResetDataSet hook', () => {
    it('should reset dataset successfully', async () => {
      const mockDataset = makeDataset({ id: TEST_DATASET_ID, name: 'Reset Dataset' });
      (apiService.resetDataSet as jest.Mock).mockResolvedValue(mockDataset);
      
      const { result } = renderHook(() => useResetDataSet());
      
      const resetResult = await result.current.resetDataSet(TEST_DATASET_ID, { resetType: ResetType.REPROCESS, reason: 'Test reset' });
      
      expect(resetResult).toEqual(mockDataset);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(apiService.resetDataSet).toHaveBeenCalledWith(TEST_DATASET_ID, { resetType: ResetType.REPROCESS, reason: 'Test reset' });
    });

    it('should handle reset errors', async () => {
      const mockError = new Error('Reset failed');
      (apiService.resetDataSet as jest.Mock).mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useResetDataSet());
      
      const resetResult = await result.current.resetDataSet(TEST_DATASET_ID, { resetType: ResetType.REPROCESS, reason: 'Test reset' });
      
      expect(resetResult).toBe(null);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Reset failed');
      });
    });

    it('should handle non-Error objects in reset', async () => {
      (apiService.resetDataSet as jest.Mock).mockRejectedValue('String error');
      
      const { result } = renderHook(() => useResetDataSet());
      
      const resetResult = await result.current.resetDataSet(TEST_DATASET_ID, { resetType: ResetType.REPROCESS, reason: 'Test reset' });
      
      expect(resetResult).toBe(null);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to reset dataset');
      });
    });
  });

  describe('useDatasetPreview hook', () => {
    it('should get dataset preview successfully', async () => {
      const mockPreview = [{ column1: 'value1' }];
      (apiService.getDataSetPreview as jest.Mock).mockResolvedValue(mockPreview);
      
      const { result } = renderHook(() => useDatasetPreview());
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      
      const previewResult = await act(async () => {
        return await result.current.getPreview(TEST_DATASET_ID);
      });
      
      expect(previewResult).toEqual(mockPreview);
      expect(apiService.getDataSetPreview).toHaveBeenCalledWith(TEST_DATASET_ID);
    });

    it('should handle preview errors', async () => {
      const mockError = new Error('Preview failed');
      (apiService.getDataSetPreview as jest.Mock).mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useDatasetPreview());
      
      const previewResult = await act(async () => {
        return await result.current.getPreview(TEST_DATASET_ID);
      });
      
      expect(previewResult).toBe(null);
      expect(result.current.error).toBe('Preview failed');
      expect(result.current.loading).toBe(false);
    });

    it('should handle non-Error objects in preview', async () => {
      (apiService.getDataSetPreview as jest.Mock).mockRejectedValue('String error');
      
      const { result } = renderHook(() => useDatasetPreview());
      
      const previewResult = await act(async () => {
        return await result.current.getPreview(TEST_DATASET_ID);
      });
      
      expect(previewResult).toBe(null);
      expect(result.current.error).toBe('Failed to load preview data');
    });
  });
});
