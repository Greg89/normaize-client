import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '../utils/errorHandling';
import { apiService } from '../services/api';
import { DataSet, DataSetResetDto, RemoveDuplicateRowsRequest } from '../types';

// Typed query key factory — used for targeted cache invalidation
export const QUERY_KEYS = {
  datasets: (includeDeleted: boolean) => ['datasets', includeDeleted] as const,
  analyses: () => ['analyses'] as const,
  analysis: (id: string) => ['analysis', id] as const,
} as const;

function getErrorMessage(error: unknown, fallback = 'An error occurred'): string | null {
  if (!error) return null;
  return extractErrorMessage(error, fallback);
}

// ─── Query hooks ────────────────────────────────────────────────────────────
// All return { data, loading, error, refetch, setData } to match existing
// page-component and test-mock shapes.

export function useDataSets(includeDeleted = false) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: QUERY_KEYS.datasets(includeDeleted),
    queryFn: () => apiService.getDataSets(includeDeleted),
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: getErrorMessage(query.error),
    refetch: async () => { await query.refetch(); },
    setData: (data: DataSet[]) =>
      queryClient.setQueryData(QUERY_KEYS.datasets(includeDeleted), data),
  };
}

export function useAnalyses() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: QUERY_KEYS.analyses(),
    queryFn: () => apiService.getAnalyses(),
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: getErrorMessage(query.error),
    refetch: async () => { await query.refetch(); },
    setData: (data: Awaited<ReturnType<typeof apiService.getAnalyses>>) =>
      queryClient.setQueryData(QUERY_KEYS.analyses(), data),
  };
}

export function useAnalysis(id: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: QUERY_KEYS.analysis(id),
    queryFn: () => apiService.getAnalysis(id),
    enabled: !!id,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: getErrorMessage(query.error),
    refetch: async () => { await query.refetch(); },
    setData: (data: Awaited<ReturnType<typeof apiService.getAnalysis>>) =>
      queryClient.setQueryData(QUERY_KEYS.analysis(id), data),
  };
}

// ─── Mutation hooks ──────────────────────────────────────────────────────────
// Each mutation calls invalidateQueries on success so ALL dataset consumers
// (DataSets, Normalization, Dashboard) automatically see fresh data.

export function useDeleteDataSet() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => apiService.deleteDataSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });

  return {
    deleteDataSet: async (id: string): Promise<boolean> => {
      try {
        await mutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    loading: mutation.isPending,
    error: getErrorMessage(mutation.error, 'Failed to delete dataset'),
  };
}

export function useUpdateDataSet() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; description?: string; retentionExpiryDate?: string };
    }) => apiService.updateDataSet(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });

  return {
    updateDataSet: async (
      id: string,
      updates: { name?: string; description?: string; retentionExpiryDate?: string }
    ): Promise<DataSet | null> => {
      try {
        return await mutation.mutateAsync({ id, updates });
      } catch {
        return null;
      }
    },
    loading: mutation.isPending,
    error: getErrorMessage(mutation.error, 'Failed to update dataset'),
  };
}

export function useResetDataSet() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, resetDto }: { id: string; resetDto: DataSetResetDto }) =>
      apiService.resetDataSet(id, resetDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });

  return {
    resetDataSet: async (id: string, resetDto: DataSetResetDto): Promise<DataSet | null> => {
      try {
        return await mutation.mutateAsync({ id, resetDto });
      } catch {
        return null;
      }
    },
    loading: mutation.isPending,
    error: getErrorMessage(mutation.error, 'Failed to reset dataset'),
  };
}

export function useDatasetPreview() {
  const mutation = useMutation({
    mutationFn: (id: string) => apiService.getDataSetPreview(id),
  });

  return {
    getPreview: async (id: string): Promise<unknown | null> => {
      try {
        return await mutation.mutateAsync(id);
      } catch {
        return null;
      }
    },
    loading: mutation.isPending,
    error: getErrorMessage(mutation.error, 'Failed to load preview data'),
  };
}

export function useRemoveDuplicates() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      dataSetId,
      request,
    }: {
      dataSetId: string;
      request: RemoveDuplicateRowsRequest;
    }) => apiService.removeDuplicates(dataSetId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });

  return {
    removeDuplicates: async (
      dataSetId: string,
      request: RemoveDuplicateRowsRequest
    ): Promise<boolean> => {
      try {
        await mutation.mutateAsync({ dataSetId, request });
        return true;
      } catch {
        return false;
      }
    },
    loading: mutation.isPending,
    error: getErrorMessage(mutation.error, 'Failed to remove duplicates'),
  };
} 