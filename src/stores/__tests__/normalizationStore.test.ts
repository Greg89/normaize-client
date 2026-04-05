import { useNormalizationStore } from '../normalizationStore';

describe('useNormalizationStore', () => {
  // Reset to initial state before each test.
  beforeEach(() => {
    useNormalizationStore.getState().reset();
  });

  describe('initial state', () => {
    it('starts on the select step', () => {
      expect(useNormalizationStore.getState().activeStep).toBe('select');
    });

    it('starts with no selected tool', () => {
      expect(useNormalizationStore.getState().selectedTool).toBeNull();
    });

    it('starts with data-cleaning category expanded', () => {
      const { expandedCategories } = useNormalizationStore.getState();
      expect(expandedCategories.has('data-cleaning')).toBe(true);
    });

    it('starts with only one category expanded', () => {
      expect(useNormalizationStore.getState().expandedCategories.size).toBe(1);
    });
  });

  describe('setActiveStep', () => {
    it('changes to workflow step', () => {
      useNormalizationStore.getState().setActiveStep('workflow');
      expect(useNormalizationStore.getState().activeStep).toBe('workflow');
    });

    it('changes back to select step', () => {
      useNormalizationStore.getState().setActiveStep('workflow');
      useNormalizationStore.getState().setActiveStep('select');
      expect(useNormalizationStore.getState().activeStep).toBe('select');
    });
  });

  describe('selectTool', () => {
    it('sets selected tool', () => {
      useNormalizationStore.getState().selectTool('remove-duplicates');
      expect(useNormalizationStore.getState().selectedTool).toBe('remove-duplicates');
    });

    it('clears selected tool when passed null', () => {
      useNormalizationStore.getState().selectTool('remove-duplicates');
      useNormalizationStore.getState().selectTool(null);
      expect(useNormalizationStore.getState().selectedTool).toBeNull();
    });
  });

  describe('toggleCategory', () => {
    it('adds a category that was not expanded', () => {
      useNormalizationStore.getState().toggleCategory('formatting');
      expect(useNormalizationStore.getState().expandedCategories.has('formatting')).toBe(true);
    });

    it('removes a category that was expanded', () => {
      useNormalizationStore.getState().toggleCategory('data-cleaning');
      expect(useNormalizationStore.getState().expandedCategories.has('data-cleaning')).toBe(false);
    });

    it('toggle twice returns to original state', () => {
      useNormalizationStore.getState().toggleCategory('formatting');
      useNormalizationStore.getState().toggleCategory('formatting');
      expect(useNormalizationStore.getState().expandedCategories.has('formatting')).toBe(false);
    });

    it('produces a new Set instance on each toggle (immutable update)', () => {
      const before = useNormalizationStore.getState().expandedCategories;
      useNormalizationStore.getState().toggleCategory('formatting');
      const after = useNormalizationStore.getState().expandedCategories;
      // Must be a different reference so Zustand detects the change
      expect(after).not.toBe(before);
    });

    it('does not mutate the previous Set', () => {
      const before = useNormalizationStore.getState().expandedCategories;
      const sizeBefore = before.size;
      useNormalizationStore.getState().toggleCategory('new-category');
      // Original reference should be unchanged
      expect(before.size).toBe(sizeBefore);
    });
  });

  describe('resetWorkflow', () => {
    it('returns to select step', () => {
      useNormalizationStore.getState().setActiveStep('workflow');
      useNormalizationStore.getState().resetWorkflow();
      expect(useNormalizationStore.getState().activeStep).toBe('select');
    });

    it('clears selected tool', () => {
      useNormalizationStore.getState().selectTool('remove-duplicates');
      useNormalizationStore.getState().resetWorkflow();
      expect(useNormalizationStore.getState().selectedTool).toBeNull();
    });

    it('preserves expanded categories (user sidebar preference)', () => {
      useNormalizationStore.getState().toggleCategory('formatting');
      useNormalizationStore.getState().resetWorkflow();
      // Category preference should survive a workflow reset
      expect(useNormalizationStore.getState().expandedCategories.has('formatting')).toBe(true);
    });
  });

  describe('reset', () => {
    it('restores all fields to initial state', () => {
      useNormalizationStore.getState().setActiveStep('workflow');
      useNormalizationStore.getState().selectTool('some-tool');
      useNormalizationStore.getState().toggleCategory('new-category');

      useNormalizationStore.getState().reset();

      const state = useNormalizationStore.getState();
      expect(state.activeStep).toBe('select');
      expect(state.selectedTool).toBeNull();
      expect(state.expandedCategories.has('data-cleaning')).toBe(true);
      expect(state.expandedCategories.has('new-category')).toBe(false);
    });

    it('creates a fresh Set on reset (not the same reference)', () => {
      const before = useNormalizationStore.getState().expandedCategories;
      useNormalizationStore.getState().reset();
      const after = useNormalizationStore.getState().expandedCategories;
      expect(after).not.toBe(before);
    });
  });
});
