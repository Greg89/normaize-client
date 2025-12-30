import { useState, useEffect, useCallback } from 'react';
import { ErrorHandler } from '../utils/errorHandling';
import { apiService } from '../services/api';
import { DataSet, DataSetResetDto, RemoveDuplicateRowsRequest } from '../types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  setData: (data: T) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = []
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const memoizedApiCall = useCallback(apiCall, [apiCall, ...dependencies]);

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await memoizedApiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      ErrorHandler.handle(error, 'useApi');
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      }));
    }
  }, [memoizedApiCall]);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  useEffect(() => {
    // Only fetch on mount, not on every error
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
    setData,
  };
}

// Specific hooks for common API calls
export function useDataSets(includeDeleted = false) {
  const apiCall = useCallback(() => apiService.getDataSets(includeDeleted), [includeDeleted]);
  return useApi(apiCall, [includeDeleted]);
}

export function useAnalyses() {
  const apiCall = useCallback(() => apiService.getAnalyses(), []);
  return useApi(apiCall, []);
}

export function useAnalysis(id: string) { // Changed to string
  const apiCall = useCallback(() => apiService.getAnalysis(id), [id]);
  return useApi(apiCall, [id]);
}

export function useDeleteDataSet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDataSet = useCallback(async (id: string): Promise<boolean> => { // Changed to string
    setLoading(true);
    setError(null);
    
    try {
      await apiService.deleteDataSet(id);
      setLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete dataset';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, []);

  return {
    deleteDataSet,
    loading,
    error,
  };
}

export function useUpdateDataSet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDataSet = useCallback(async (id: string, updates: { name?: string; description?: string; retentionExpiryDate?: string }): Promise<DataSet | null> => { // Changed to string
    setLoading(true);
    setError(null);
    
    try {
      const updatedDataset = await apiService.updateDataSet(id, updates);
      
      setLoading(false);
      return updatedDataset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update dataset';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  return {
    updateDataSet,
    loading,
    error,
  };
}

export function useResetDataSet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetDataSet = useCallback(async (id: string, resetDto: DataSetResetDto): Promise<DataSet | null> => { // Changed to string
    setLoading(true);
    setError(null);
    
    try {
      const resetDataset = await apiService.resetDataSet(id, resetDto);
      
      setLoading(false);
      return resetDataset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset dataset';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  return {
    resetDataSet,
    loading,
    error,
  };
}

export function useDatasetPreview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPreview = useCallback(async (id: string): Promise<unknown | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getDataSetPreview(id);
      setLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preview data';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  return {
    getPreview,
    loading,
    error,
  };
}

export function useRemoveDuplicates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeDuplicates = useCallback(async (dataSetId: string, request: RemoveDuplicateRowsRequest): Promise<boolean> => { // Changed to string
    setLoading(true);
    setError(null);
    
    try {
      await apiService.removeDuplicates(dataSetId, request);
      setLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove duplicates';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, []);

  return {
    removeDuplicates,
    loading,
    error,
  };
} 