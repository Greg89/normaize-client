import { useState, useEffect, useCallback } from 'react';
import { ErrorHandler } from '../utils/errorHandling';
import { apiService } from '../services/api';

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
export function useDataSets() {
  const apiCall = useCallback(() => apiService.getDataSets(), []);
  return useApi(apiCall, []);
}

export function useAnalyses() {
  const apiCall = useCallback(() => apiService.getAnalyses(), []);
  return useApi(apiCall, []);
}

export function useAnalysis(id: number) {
  const apiCall = useCallback(() => apiService.getAnalysis(id), [id]);
  return useApi(apiCall, [id]);
} 