import { useDatasetStore } from '../datasetStore';
import { DataSet } from '../../types';

// Minimal DataSet shape for testing — only fields the store cares about
const mockDataset: DataSet = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Sales Data',
  description: 'Monthly sales figures',
  createdBy: 'auth0|user123',
  createdAt: '2025-10-31T00:00:00Z',
  updatedAt: null,
  uploadedAt: '2025-10-31T00:00:00Z',
  isProcessed: true,
  isDeleted: false,
  fileMetadata: {
    originalFileName: 'sales.csv',
    storagePath: 's3://bucket/sales.csv',
    fileType: 'CSV',
    sizeInBytes: 2048,
    checksum: 'abc123',
    storageProvider: 'S3',
  },
  statistics: {
    rowCount: 100,
    columnCount: 5,
    fileSizeBytes: 2048,
    lastProcessedAt: '2025-10-31T00:00:00Z',
  },
};

describe('useDatasetStore', () => {
  // Reset to initial state before each test so tests don't bleed into each other.
  beforeEach(() => {
    useDatasetStore.getState().reset();
  });

  describe('initial state', () => {
    it('starts with no selected dataset', () => {
      expect(useDatasetStore.getState().selectedDataset).toBeNull();
    });

    it('starts with no active modal', () => {
      expect(useDatasetStore.getState().activeModal).toBeNull();
    });

    it('starts with upload panel hidden', () => {
      expect(useDatasetStore.getState().showUploadPanel).toBe(false);
    });
  });

  describe('openModal', () => {
    it('sets modal type and selects the dataset atomically', () => {
      useDatasetStore.getState().openModal('details', mockDataset);

      const state = useDatasetStore.getState();
      expect(state.activeModal).toBe('details');
      expect(state.selectedDataset).toEqual(mockDataset);
    });

    it('opens a preview modal correctly', () => {
      useDatasetStore.getState().openModal('preview', mockDataset);

      expect(useDatasetStore.getState().activeModal).toBe('preview');
    });

    it('switching modal type updates both fields', () => {
      useDatasetStore.getState().openModal('details', mockDataset);
      useDatasetStore.getState().openModal('preview', mockDataset);

      expect(useDatasetStore.getState().activeModal).toBe('preview');
    });
  });

  describe('closeModal', () => {
    it('clears both activeModal and selectedDataset', () => {
      useDatasetStore.getState().openModal('details', mockDataset);
      useDatasetStore.getState().closeModal();

      const state = useDatasetStore.getState();
      expect(state.activeModal).toBeNull();
      expect(state.selectedDataset).toBeNull();
    });
  });

  describe('selectDataset', () => {
    it('updates selected dataset without touching activeModal', () => {
      useDatasetStore.getState().openModal('details', mockDataset);
      const updated: DataSet = { ...mockDataset, name: 'Updated Sales Data' };

      useDatasetStore.getState().selectDataset(updated);

      const state = useDatasetStore.getState();
      expect(state.selectedDataset?.name).toBe('Updated Sales Data');
      // Modal stays open — this is the key behaviour after an in-place save
      expect(state.activeModal).toBe('details');
    });

    it('accepts null to deselect', () => {
      useDatasetStore.getState().selectDataset(mockDataset);
      useDatasetStore.getState().selectDataset(null);

      expect(useDatasetStore.getState().selectedDataset).toBeNull();
    });
  });

  describe('setShowUploadPanel', () => {
    it('shows the upload panel', () => {
      useDatasetStore.getState().setShowUploadPanel(true);
      expect(useDatasetStore.getState().showUploadPanel).toBe(true);
    });

    it('hides the upload panel', () => {
      useDatasetStore.getState().setShowUploadPanel(true);
      useDatasetStore.getState().setShowUploadPanel(false);
      expect(useDatasetStore.getState().showUploadPanel).toBe(false);
    });
  });

  describe('reset', () => {
    it('restores all fields to initial state', () => {
      useDatasetStore.getState().openModal('details', mockDataset);
      useDatasetStore.getState().setShowUploadPanel(true);

      useDatasetStore.getState().reset();

      const state = useDatasetStore.getState();
      expect(state.selectedDataset).toBeNull();
      expect(state.activeModal).toBeNull();
      expect(state.showUploadPanel).toBe(false);
    });
  });
});
