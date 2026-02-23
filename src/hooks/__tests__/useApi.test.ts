import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDataSets, useAnalyses, useAnalysis, useDeleteDataSet, useUpdateDataSet, useResetDataSet, useDatasetPreview } from '../useApi';
import { apiService } from '../../services/api';
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

// Mock the error handler utilities
jest.mock('../../utils/errorHandling', () => ({
  ErrorHandler: {
    handle: jest.fn(),
  },
  extractErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback,
}));

// Create a fresh QueryClient per test to avoid cache bleed-through
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  function TestQueryClientProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return TestQueryClientProvider;
};

describe('useApi hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useDataSets hook', () => {
    it('should fetch datasets', async () => {
      const mockDatasets = [makeDataset()];
      (apiService.getDataSets as jest.Mock).mockResolvedValue(mockDatasets);
      
      const { result } = renderHook(() => useDataSets(), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockDatasets);
      expect(apiService.getDataSets).toHaveBeenCalledWith(false);
    });

    it('should fetch datasets with includeDeleted parameter', async () => {
      const mockDatasets = [makeDataset()];
      (apiService.getDataSets as jest.Mock).mockResolvedValue(mockDatasets);
      
      const { result } = renderHook(() => useDataSets(true), { wrapper: createWrapper() });
      
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
      
      const { result } = renderHook(() => useAnalyses(), { wrapper: createWrapper() });
      
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
      
      const { result } = renderHook(() => useAnalysis('550e8400-e29b-41d4-a716-446655440001'), { wrapper: createWrapper() });
      
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
        { initialProps: { id: '550e8400-e29b-41d4-a716-446655440001' }, wrapper: createWrapper() }
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
      
      const { result } = renderHook(() => useDeleteDataSet(), { wrapper: createWrapper() });
      
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
      
      const { result } = renderHook(() => useDeleteDataSet(), { wrapper: createWrapper() });
      
      const deleteResult = await act(async () => {
        return await result.current.deleteDataSet(TEST_DATASET_ID);
      });
      
      expect(deleteResult).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe('Delete failed');
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle non-Error objects in delete', async () => {
      (apiService.deleteDataSet as jest.Mock).mockRejectedValue('String error');
      
      const { result } = renderHook(() => useDeleteDataSet(), { wrapper: createWrapper() });
      
      const deleteResult = await act(async () => {
        return await result.current.deleteDataSet(TEST_DATASET_ID);
      });
      
      expect(deleteResult).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe('Failed to delete dataset');
      });
    });
  });

  describe('useUpdateDataSet hook', () => {
    it('should update dataset successfully', async () => {
      const mockDataset = makeDataset({ id: TEST_DATASET_ID, name: 'Updated Dataset' });
      (apiService.updateDataSet as jest.Mock).mockResolvedValue(mockDataset);
      
      const { result } = renderHook(() => useUpdateDataSet(), { wrapper: createWrapper() });
      
      const updateResult = await result.current.updateDataSet(TEST_DATASET_ID, { name: 'Updated Dataset' });
      
      expect(updateResult).toEqual(mockDataset);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(apiService.updateDataSet).toHaveBeenCalledWith(TEST_DATASET_ID, { name: 'Updated Dataset' });
    });

    it('should handle update errors', async () => {
      const mockError = new Error('Update failed');
      (apiService.updateDataSet as jest.Mock).mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useUpdateDataSet(), { wrapper: createWrapper() });
      
      const updateResult = await result.current.updateDataSet(TEST_DATASET_ID, { name: 'Updated Dataset' });
      
      expect(updateResult).toBe(null);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Update failed');
      });
    });

    it('should handle non-Error objects in update', async () => {
      (apiService.updateDataSet as jest.Mock).mockRejectedValue('String error');
      
      const { result } = renderHook(() => useUpdateDataSet(), { wrapper: createWrapper() });
      
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
      
      const { result } = renderHook(() => useResetDataSet(), { wrapper: createWrapper() });
      
      const resetResult = await result.current.resetDataSet(TEST_DATASET_ID, { resetType: ResetType.REPROCESS, reason: 'Test reset' });
      
      expect(resetResult).toEqual(mockDataset);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(apiService.resetDataSet).toHaveBeenCalledWith(TEST_DATASET_ID, { resetType: ResetType.REPROCESS, reason: 'Test reset' });
    });

    it('should handle reset errors', async () => {
      const mockError = new Error('Reset failed');
      (apiService.resetDataSet as jest.Mock).mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useResetDataSet(), { wrapper: createWrapper() });
      
      const resetResult = await result.current.resetDataSet(TEST_DATASET_ID, { resetType: ResetType.REPROCESS, reason: 'Test reset' });
      
      expect(resetResult).toBe(null);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Reset failed');
      });
    });

    it('should handle non-Error objects in reset', async () => {
      (apiService.resetDataSet as jest.Mock).mockRejectedValue('String error');
      
      const { result } = renderHook(() => useResetDataSet(), { wrapper: createWrapper() });
      
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
      
      const { result } = renderHook(() => useDatasetPreview(), { wrapper: createWrapper() });
      
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
      
      const { result } = renderHook(() => useDatasetPreview(), { wrapper: createWrapper() });
      
      const previewResult = await act(async () => {
        return await result.current.getPreview(TEST_DATASET_ID);
      });
      
      expect(previewResult).toBe(null);
      await waitFor(() => {
        expect(result.current.error).toBe('Preview failed');
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle non-Error objects in preview', async () => {
      (apiService.getDataSetPreview as jest.Mock).mockRejectedValue('String error');
      
      const { result } = renderHook(() => useDatasetPreview(), { wrapper: createWrapper() });
      
      const previewResult = await act(async () => {
        return await result.current.getPreview(TEST_DATASET_ID);
      });
      
      expect(previewResult).toBe(null);
      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load preview data');
      });
    });
  });
});
