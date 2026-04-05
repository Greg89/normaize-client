import { create } from 'zustand';

type NormalizationStep = 'select' | 'workflow';

interface NormalizationStore {
  // The active step in the normalization wizard.
  // Persists across navigation — if the user leaves and comes back,
  // they return to where they left off.
  activeStep: NormalizationStep;
  // Which normalization tool is selected in the sidebar.
  selectedTool: string | null;
  // Which sidebar categories are expanded (toggle accordion state).
  expandedCategories: Set<string>;

  setActiveStep: (step: NormalizationStep) => void;
  selectTool: (toolId: string | null) => void;
  // Toggles a category open/closed. Always produces a new Set so
  // Zustand's shallow equality check detects the change correctly.
  toggleCategory: (categoryId: string) => void;
  // Returns to the dataset selection step and clears the active tool,
  // but preserves sidebar category state (user preference).
  resetWorkflow: () => void;
  reset: () => void;
}

const initialExpandedCategories = () => new Set<string>(['data-cleaning']);

const initialState = {
  activeStep: 'select' as NormalizationStep,
  selectedTool: null as string | null,
  expandedCategories: initialExpandedCategories(),
};

export const useNormalizationStore = create<NormalizationStore>((set) => ({
  ...initialState,

  setActiveStep: (step) => set({ activeStep: step }),

  selectTool: (toolId) => set({ selectedTool: toolId }),

  toggleCategory: (categoryId) =>
    set((state) => {
      const next = new Set(state.expandedCategories);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return { expandedCategories: next };
    }),

  resetWorkflow: () => set({ activeStep: 'select', selectedTool: null }),

  reset: () =>
    set({ ...initialState, expandedCategories: initialExpandedCategories() }),
}));
