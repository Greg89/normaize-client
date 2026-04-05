import { create } from 'zustand';
import { DataSet } from '../types';

// Which modal (if any) is currently open for a dataset
type ActiveModal = 'details' | 'preview' | null;

interface DatasetStore {
  // The dataset currently selected for a modal interaction.
  // Shared across DataSets page and any component that needs it.
  selectedDataset: DataSet | null;
  activeModal: ActiveModal;
  showUploadPanel: boolean;

  // Opens a modal AND selects the dataset atomically — prevents them
  // ever being out of sync (no separate setSelectedDataset + setShowModal calls).
  openModal: (type: 'details' | 'preview', dataset: DataSet) => void;
  // Closes the modal and clears the selection together.
  closeModal: () => void;
  // Updates the selected dataset in-place (e.g., after a save) without
  // touching the modal type, so the modal stays open with fresh data.
  selectDataset: (dataset: DataSet | null) => void;
  setShowUploadPanel: (show: boolean) => void;
  reset: () => void;
}

const initialState = {
  selectedDataset: null as DataSet | null,
  activeModal: null as ActiveModal,
  showUploadPanel: false,
};

export const useDatasetStore = create<DatasetStore>((set) => ({
  ...initialState,

  openModal: (type, dataset) => set({ activeModal: type, selectedDataset: dataset }),

  closeModal: () => set({ activeModal: null, selectedDataset: null }),

  selectDataset: (dataset) => set({ selectedDataset: dataset }),

  setShowUploadPanel: (show) => set({ showUploadPanel: show }),

  reset: () => set(initialState),
}));
