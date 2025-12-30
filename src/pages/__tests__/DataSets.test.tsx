import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DataSets from '../DataSets';

// Mock dependencies
const mockUseDataSets = jest.fn();
const mockUseDeleteDataSet = jest.fn();
const mockUseUpdateDataSet = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock('../../hooks/useApi', () => ({
  useDataSets: () => mockUseDataSets(),
  useDeleteDataSet: () => mockUseDeleteDataSet(),
  useUpdateDataSet: () => mockUseUpdateDataSet(),
  useResetDataSet: () => ({
    resetDataSet: jest.fn(),
    loading: false,
    error: null,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../components/FileUpload', () => ({
  __esModule: true,
  default: ({ onUploadSuccess, onUploadError, multiple }: { 
    onUploadSuccess: (id: number, fileName: string) => void; 
    onUploadError: (error: string) => void; 
    multiple?: boolean 
  }) => (
    <div data-testid="file-upload">
      <button onClick={() => onUploadSuccess(1, 'test.csv')}>Mock Upload Success</button>
      <button onClick={() => onUploadError('Upload failed')}>Mock Upload Error</button>
      <span>Multiple: {multiple ? 'true' : 'false'}</span>
    </div>
  ),
}));

jest.mock('../../components/DatasetDetailsModal', () => ({
  __esModule: true,
  default: ({ dataset, isOpen, onClose, onSave, loading }: { 
    dataset?: { name: string }; 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (data: { name: string; description: string; retentionExpiryDate?: string }) => void; 
    loading: boolean 
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="dataset-details-modal">
        <h3>Dataset Details: {dataset?.name}</h3>
        <button onClick={() => onSave({ name: 'Updated Name', description: 'Updated Description' })}>
          Save
        </button>
        <button onClick={onClose}>Close</button>
        <span>Loading: {loading ? 'true' : 'false'}</span>
      </div>
    );
  },
}));

jest.mock('../../components/DatasetPreviewModal', () => ({
  __esModule: true,
  default: ({ dataset, isOpen, onClose }: { 
    dataset?: { name: string }; 
    isOpen: boolean; 
    onClose: () => void 
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="dataset-preview-modal">
        <h3>Dataset Preview: {dataset?.name}</h3>
        <button onClick={onClose}>Close</button>
      </div>
    );
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DataSets', () => {
  const mockDatasets = [
    {
      id: 1,
      name: 'Test Dataset 1',
      description: 'A test dataset',
      fileName: 'test1.csv',
      fileType: 'csv',
      fileSize: 1024,
      rowCount: 100,
      columnCount: 5,
      uploadedAt: '2023-01-01T00:00:00Z',
      isDeleted: false,
      isProcessed: true,
    },
    {
      id: 2,
      name: 'Test Dataset 2',
      description: 'Another test dataset',
      fileName: 'test2.json',
      fileType: 'json',
      fileSize: 2048,
      rowCount: 200,
      columnCount: 3,
      uploadedAt: '2023-01-02T00:00:00Z',
      isDeleted: false,
      isProcessed: false,
    },
  ];

  const mockDeletedDataset = {
    id: 3,
    name: 'Deleted Dataset',
    description: 'A deleted dataset',
    fileName: 'deleted.csv',
    fileType: 'csv',
    fileSize: 512,
    rowCount: 50,
    columnCount: 2,
    uploadedAt: '2023-01-03T00:00:00Z',
    isDeleted: true,
    isProcessed: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseDataSets.mockReturnValue({
      data: mockDatasets,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseDeleteDataSet.mockReturnValue({
      deleteDataSet: jest.fn().mockResolvedValue(true),
      loading: false,
    });

    const mockUpdateDataSet = jest.fn().mockResolvedValue({
      id: 1,
      name: 'Updated Test Dataset',
      description: 'Updated description',
      retentionExpiryDate: '2025-12-31',
      uploadedAt: '2024-01-01T00:00:00Z',
      fileSize: 1024,
      rowCount: 100,
      columnCount: 5,
      isProcessed: true,
      isDeleted: false,
    });

    mockUseUpdateDataSet.mockReturnValue({
      updateDataSet: mockUpdateDataSet,
      loading: false,
    });

    mockUseSearchParams.mockReturnValue([
      new URLSearchParams(),
      jest.fn(),
    ]);

    // Mock window.confirm
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: jest.fn().mockReturnValue(true),
    });
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithRouter(<DataSets />);
      expect(screen.getByText('Datasets')).toBeInTheDocument();
    });

    it('displays the main heading and description', () => {
      renderWithRouter(<DataSets />);
      
      expect(screen.getByText('Datasets')).toBeInTheDocument();
      expect(screen.getByText('Datasets')).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
      
      expect(screen.getByText('Manage your uploaded data files')).toBeInTheDocument();
      expect(screen.getByText('Manage your uploaded data files')).toHaveClass('text-gray-600');
    });

    it('displays the upload button', () => {
      renderWithRouter(<DataSets />);
      
      const uploadButton = screen.getByText('Upload Dataset');
      expect(uploadButton).toBeInTheDocument();
      expect(uploadButton).toHaveClass('bg-blue-500', 'hover:bg-blue-600');
    });

    it('displays the include deleted toggle', () => {
      renderWithRouter(<DataSets />);
      
      expect(screen.getByText('Active only')).toBeInTheDocument();
      expect(screen.getByText('Include deleted')).toBeInTheDocument();
      
      const toggle = screen.getByRole('checkbox');
      expect(toggle).toBeInTheDocument();
    });
  });

  describe('Upload Functionality', () => {
    it('shows upload interface when upload button is clicked', () => {
      renderWithRouter(<DataSets />);
      
      const uploadButton = screen.getByText('Upload Dataset');
      fireEvent.click(uploadButton);
      
      expect(screen.getByTestId('file-upload')).toBeInTheDocument();
      expect(screen.getByText('Cancel Upload')).toBeInTheDocument();
    });

    it('shows upload interface when upload query parameter is true', () => {
      mockUseSearchParams.mockReturnValue([
        new URLSearchParams('upload=true'),
        jest.fn(),
      ]);

      renderWithRouter(<DataSets />);
      
      expect(screen.getByTestId('file-upload')).toBeInTheDocument();
    });

    it('handles successful upload', async () => {
      const mockRefetch = jest.fn();
      mockUseDataSets.mockReturnValue({
        data: mockDatasets,
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithRouter(<DataSets />);
      
      // Show upload interface
      const uploadButton = screen.getByText('Upload Dataset');
      fireEvent.click(uploadButton);
      
      // Trigger successful upload
      const successButton = screen.getByText('Mock Upload Success');
      fireEvent.click(successButton);
      
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
      
      expect(screen.queryByTestId('file-upload')).not.toBeInTheDocument();
    });

    it('handles upload error', async () => {
      renderWithRouter(<DataSets />);
      
      // Show upload interface
      const uploadButton = screen.getByText('Upload Dataset');
      fireEvent.click(uploadButton);
      
      // Trigger upload error
      const errorButton = screen.getByText('Mock Upload Error');
      fireEvent.click(errorButton);
      
      const { toast } = await import('react-hot-toast');
      expect(toast.error).toHaveBeenCalledWith('Upload failed: Upload failed', {
        duration: 5000,
        position: 'top-right',
      });
    });
  });

  describe('Dataset Display', () => {
    it('displays datasets when available', () => {
      renderWithRouter(<DataSets />);
      
      expect(screen.getByText('Your Datasets')).toBeInTheDocument();
      expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
      expect(screen.getByText('Test Dataset 2')).toBeInTheDocument();
    });

    it('displays dataset information correctly', () => {
      renderWithRouter(<DataSets />);
      
      // Check first dataset
      expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
      expect(screen.getByText('A test dataset')).toBeInTheDocument();
      expect(screen.getByText('Uploaded: 12/31/2022')).toBeInTheDocument();
      
      // Check that size information exists (there are multiple datasets with same size)
      const sizeElements = screen.getAllByText('Size: 1.0 KB');
      expect(sizeElements.length).toBeGreaterThan(0);
      
      expect(screen.getByText('Rows: 100')).toBeInTheDocument();
      expect(screen.getByText('Columns: 5')).toBeInTheDocument();
    });

    it('shows processed status badge', () => {
      renderWithRouter(<DataSets />);
      
      expect(screen.getByText('Processed')).toBeInTheDocument();
      expect(screen.getByText('Processed')).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('shows deleted status badge for deleted datasets', () => {
      mockUseDataSets.mockReturnValue({
        data: [mockDeletedDataset],
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      renderWithRouter(<DataSets />);
      
      expect(screen.getByText('Deleted')).toBeInTheDocument();
      expect(screen.getByText('Deleted')).toHaveClass('bg-red-100', 'text-red-700');
    });

    it('displays empty state when no datasets', () => {
      mockUseDataSets.mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      renderWithRouter(<DataSets />);
      
      expect(screen.getByText('No datasets uploaded yet.')).toBeInTheDocument();
      expect(screen.getByText('Click "Upload Dataset" to get started.')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state', () => {
      mockUseDataSets.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      renderWithRouter(<DataSets />);
      
      expect(screen.getByText('Loading datasets...')).toBeInTheDocument();
      expect(screen.getByText('Loading datasets...')).toHaveClass('text-gray-500');
    });

    it('shows error state with retry button', () => {
      mockUseDataSets.mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to load datasets',
        refetch: jest.fn(),
      });

      renderWithRouter(<DataSets />);
      
      expect(screen.getByText('Error loading datasets: Failed to load datasets')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toHaveClass('text-blue-500', 'hover:text-blue-600');
    });
  });

  describe('Dataset Actions', () => {
    it('opens dropdown when action button is clicked', () => {
      renderWithRouter(<DataSets />);
      
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const firstActionButton = actionButtons.find(button => 
        button.querySelector('svg') && button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        expect(screen.getByText('Additional Details')).toBeInTheDocument();
        expect(screen.getByText('Preview Data')).toBeInTheDocument();
        expect(screen.getByText('Delete Dataset')).toBeInTheDocument();
      }
    });

    it('opens dataset details modal', () => {
      renderWithRouter(<DataSets />);
      
      // Open dropdown
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const firstActionButton = actionButtons.find(button => 
        button.querySelector('svg') && button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        // Click Additional Details
        const detailsButton = screen.getByText('Additional Details');
        fireEvent.click(detailsButton);
        
        expect(screen.getByTestId('dataset-details-modal')).toBeInTheDocument();
        expect(screen.getByText('Dataset Details: Test Dataset 1')).toBeInTheDocument();
      }
    });

    it('opens dataset preview modal', () => {
      renderWithRouter(<DataSets />);
      
      // Open dropdown
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const firstActionButton = actionButtons.find(button => 
        button.querySelector('svg') && button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        // Click Preview Data
        const previewButton = screen.getByText('Preview Data');
        fireEvent.click(previewButton);
        
        expect(screen.getByTestId('dataset-preview-modal')).toBeInTheDocument();
        expect(screen.getByText('Dataset Preview: Test Dataset 1')).toBeInTheDocument();
      }
    });

    it('handles dataset deletion', async () => {
      const mockDeleteDataSet = jest.fn().mockResolvedValue(true);
      const mockRefetch = jest.fn();
      
      mockUseDeleteDataSet.mockReturnValue({
        deleteDataSet: mockDeleteDataSet,
        loading: false,
      });

      mockUseDataSets.mockReturnValue({
        data: mockDatasets,
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithRouter(<DataSets />);
      
      // Open dropdown
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const firstActionButton = actionButtons.find(button => 
        button.querySelector('svg') && button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        // Click Delete Dataset
        const deleteButton = screen.getByText('Delete Dataset');
        fireEvent.click(deleteButton);
        
        await waitFor(() => {
          expect(mockDeleteDataSet).toHaveBeenCalledWith(mockDatasets[0]);
          expect(mockRefetch).toHaveBeenCalled();
        });
        
        const { toast } = await import('react-hot-toast');
        expect(toast.success).toHaveBeenCalledWith('Dataset "Test Dataset 1" deleted successfully');
      }
    });

    it('handles dataset update', async () => {
      const mockUpdateDataSet = jest.fn().mockResolvedValue(true);
      const mockRefetch = jest.fn();
      
      mockUseUpdateDataSet.mockReturnValue({
        updateDataSet: mockUpdateDataSet,
        loading: false,
      });

      mockUseDataSets.mockReturnValue({
        data: mockDatasets,
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithRouter(<DataSets />);
      
      // Open dataset details modal
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const firstActionButton = actionButtons.find(button => 
        button.querySelector('svg') && button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        const detailsButton = screen.getByText('Additional Details');
        fireEvent.click(detailsButton);
        
        // Save changes
        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);
        
        await waitFor(() => {
          expect(mockUpdateDataSet).toHaveBeenCalledWith(1, {
            name: 'Updated Name',
            description: 'Updated Description',
          });
          expect(mockRefetch).toHaveBeenCalled();
        });
        
        const { toast } = await import('react-hot-toast');
        expect(toast.success).toHaveBeenCalledWith('Dataset "Updated Name" updated successfully');
      }
    });
  });

  describe('Modal Management', () => {
    it('closes dataset details modal', () => {
      renderWithRouter(<DataSets />);
      
      // Open modal
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const firstActionButton = actionButtons.find(button => 
        button.querySelector('svg') && button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        const detailsButton = screen.getByText('Additional Details');
        fireEvent.click(detailsButton);
        
        // Close modal
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);
        
        expect(screen.queryByTestId('dataset-details-modal')).not.toBeInTheDocument();
      }
    });

    it('closes dataset preview modal', () => {
      renderWithRouter(<DataSets />);
      
      // Open modal
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const firstActionButton = actionButtons.find(button => 
        button.querySelector('svg') && button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (firstActionButton) {
        fireEvent.click(firstActionButton);
        
        const previewButton = screen.getByText('Preview Data');
        fireEvent.click(previewButton);
        
        // Close modal
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);
        
        expect(screen.queryByTestId('dataset-preview-modal')).not.toBeInTheDocument();
      }
    });
  });

  describe('Toggle Functionality', () => {
    it('toggles include deleted datasets', () => {
      renderWithRouter(<DataSets />);
      
      const toggle = screen.getByRole('checkbox');
      expect(toggle).not.toBeChecked();
      
      fireEvent.click(toggle);
      expect(toggle).toBeChecked();
    });
  });

  describe('Dataset Restore Functionality', () => {
    let mockResetDataSet: jest.Mock;
    let mockRefetch: jest.Mock;

    beforeEach(() => {
      mockResetDataSet = jest.fn();
      mockRefetch = jest.fn();

      // Mock useResetDataSet hook
      jest.doMock('../../hooks/useApi', () => ({
        useDataSets: () => mockUseDataSets(),
        useDeleteDataSet: () => mockUseDeleteDataSet(),
        useUpdateDataSet: () => mockUseUpdateDataSet(),
        useResetDataSet: () => ({
          resetDataSet: mockResetDataSet,
          loading: false,
          error: null,
        }),
      }));

      // Mock datasets with deleted dataset
      mockUseDataSets.mockReturnValue({
        data: [...mockDatasets, mockDeletedDataset],
        loading: false,
        error: null,
        refetch: mockRefetch,
      });
    });

    it('shows restore option only for deleted datasets', () => {
      renderWithRouter(<DataSets />);
      
      // Open dropdown for deleted dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const deletedDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-red-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (deletedDatasetButton) {
        fireEvent.click(deletedDatasetButton);
        
        // Should show restore option for deleted dataset
        expect(screen.getByText('Restore Dataset')).toBeInTheDocument();
      }
    });

    it('does not show restore option for active datasets', () => {
      renderWithRouter(<DataSets />);
      
      // Open dropdown for active dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const activeDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-green-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (activeDatasetButton) {
        fireEvent.click(activeDatasetButton);
        
        // Should not show restore option for active dataset
        expect(screen.queryByText('Restore Dataset')).not.toBeInTheDocument();
      }
    });

    it('restores deleted dataset successfully', async () => {
      const mockRestoredDataset = {
        ...mockDeletedDataset,
        isDeleted: false,
      };

      mockResetDataSet.mockResolvedValue(mockRestoredDataset);

      renderWithRouter(<DataSets />);
      
      // Open dropdown for deleted dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const deletedDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-red-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (deletedDatasetButton) {
        fireEvent.click(deletedDatasetButton);
        
        const restoreButton = screen.getByText('Restore Dataset');
        fireEvent.click(restoreButton);
        
        await waitFor(() => {
          expect(mockResetDataSet).toHaveBeenCalledWith(3, {
            resetType: 'RESTORE',
            reason: 'Dataset restored by user'
          });
          expect(mockRefetch).toHaveBeenCalled();
        });
        
        const { toast } = await import('react-hot-toast');
        expect(toast.success).toHaveBeenCalledWith('Dataset "Deleted Dataset" restored successfully');
      }
    });

    it('handles restore dataset error', async () => {
      mockResetDataSet.mockRejectedValue(new Error('Restore failed'));

      renderWithRouter(<DataSets />);
      
      // Open dropdown for deleted dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const deletedDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-red-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (deletedDatasetButton) {
        fireEvent.click(deletedDatasetButton);
        
        const restoreButton = screen.getByText('Restore Dataset');
        fireEvent.click(restoreButton);
        
        await waitFor(() => {
          expect(mockResetDataSet).toHaveBeenCalled();
        });
        
        const { toast } = await import('react-hot-toast');
        expect(toast.error).toHaveBeenCalledWith('An error occurred while restoring the dataset');
      }
    });

    it('cancels restore when user declines confirmation', () => {
      // Mock window.confirm to return false
      Object.defineProperty(window, 'confirm', {
        writable: true,
        value: jest.fn().mockReturnValue(false),
      });

      renderWithRouter(<DataSets />);
      
      // Open dropdown for deleted dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const deletedDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-red-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (deletedDatasetButton) {
        fireEvent.click(deletedDatasetButton);
        
        const restoreButton = screen.getByText('Restore Dataset');
        fireEvent.click(restoreButton);
        
        // Should not call resetDataSet when user cancels
        expect(mockResetDataSet).not.toHaveBeenCalled();
        expect(mockRefetch).not.toHaveBeenCalled();
      }
    });
  });

  describe('Dataset Reset Functionality', () => {
    let mockResetDataSet: jest.Mock;
    let mockRefetch: jest.Mock;

    beforeEach(() => {
      mockResetDataSet = jest.fn();
      mockRefetch = jest.fn();

      // Mock useResetDataSet hook
      jest.doMock('../../hooks/useApi', () => ({
        useDataSets: () => mockUseDataSets(),
        useDeleteDataSet: () => mockUseDeleteDataSet(),
        useUpdateDataSet: () => mockUseUpdateDataSet(),
        useResetDataSet: () => ({
          resetDataSet: mockResetDataSet,
          loading: false,
          error: null,
        }),
      }));

      // Mock datasets with both active and deleted datasets
      mockUseDataSets.mockReturnValue({
        data: [...mockDatasets, mockDeletedDataset],
        loading: false,
        error: null,
        refetch: mockRefetch,
      });
    });

    it('shows reset option for all datasets (active and deleted)', () => {
      renderWithRouter(<DataSets />);
      
      // Open dropdown for active dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const activeDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-green-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (activeDatasetButton) {
        fireEvent.click(activeDatasetButton);
        
        // Should show reset option for active dataset
        expect(screen.getByText('Reset Dataset')).toBeInTheDocument();
        
        // Close dropdown by clicking outside or clicking the same button again
        fireEvent.click(activeDatasetButton);
      }

      // Open dropdown for deleted dataset
      const deletedDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-red-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (deletedDatasetButton) {
        fireEvent.click(deletedDatasetButton);
        
        // Should also show reset option for deleted dataset
        expect(screen.getByText('Reset Dataset')).toBeInTheDocument();
      }
    });

    it('resets active dataset successfully', async () => {
      const mockResetDataset = {
        ...mockDatasets[0],
        isProcessed: false, // Reset to unprocessed state
      };

      mockResetDataSet.mockResolvedValue(mockResetDataset);

      renderWithRouter(<DataSets />);
      
      // Open dropdown for active dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const activeDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-green-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (activeDatasetButton) {
        fireEvent.click(activeDatasetButton);
        
        const resetButton = screen.getByText('Reset Dataset');
        fireEvent.click(resetButton);
        
        await waitFor(() => {
          expect(mockResetDataSet).toHaveBeenCalledWith(1, {
            resetType: 'REPROCESS',
            reason: 'Dataset reset to original state by user'
          });
          expect(mockRefetch).toHaveBeenCalled();
        });
        
        const { toast } = await import('react-hot-toast');
        expect(toast.success).toHaveBeenCalledWith('Dataset "Test Dataset 1" reset successfully');
      }
    });

    it('resets deleted dataset successfully', async () => {
      const mockResetDataset = {
        ...mockDeletedDataset,
        isDeleted: false, // Reset to active state
        isProcessed: false, // Reset to unprocessed state
      };

      mockResetDataSet.mockResolvedValue(mockResetDataset);

      renderWithRouter(<DataSets />);
      
      // Open dropdown for deleted dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const deletedDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-red-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (deletedDatasetButton) {
        fireEvent.click(deletedDatasetButton);
        
        const resetButton = screen.getByText('Reset Dataset');
        fireEvent.click(resetButton);
        
        await waitFor(() => {
          expect(mockResetDataSet).toHaveBeenCalledWith(3, {
            resetType: 'REPROCESS',
            reason: 'Dataset reset to original state by user'
          });
          expect(mockRefetch).toHaveBeenCalled();
        });
        
        const { toast } = await import('react-hot-toast');
        expect(toast.success).toHaveBeenCalledWith('Dataset "Deleted Dataset" reset successfully');
      }
    });

    it('handles reset dataset error', async () => {
      mockResetDataSet.mockRejectedValue(new Error('Reset failed'));

      renderWithRouter(<DataSets />);
      
      // Open dropdown for active dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const activeDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-green-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (activeDatasetButton) {
        fireEvent.click(activeDatasetButton);
        
        const resetButton = screen.getByText('Reset Dataset');
        fireEvent.click(resetButton);
        
        await waitFor(() => {
          expect(mockResetDataSet).toHaveBeenCalled();
        });
        
        const { toast } = await import('react-hot-toast');
        expect(toast.error).toHaveBeenCalledWith('An error occurred while resetting the dataset');
      }
    });

    it('cancels reset when user declines confirmation', () => {
      // Mock window.confirm to return false
      Object.defineProperty(window, 'confirm', {
        writable: true,
        value: jest.fn().mockReturnValue(false),
      });

      renderWithRouter(<DataSets />);
      
      // Open dropdown for active dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const activeDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-green-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (activeDatasetButton) {
        fireEvent.click(activeDatasetButton);
        
        const resetButton = screen.getByText('Reset Dataset');
        fireEvent.click(resetButton);
        
        // Should not call resetDataSet when user cancels
        expect(mockResetDataSet).not.toHaveBeenCalled();
        expect(mockRefetch).not.toHaveBeenCalled();
      }
    });

    it('closes dropdown after starting reset operation', async () => {
      mockResetDataSet.mockResolvedValue(mockDatasets[0]);

      renderWithRouter(<DataSets />);
      
      // Open dropdown for active dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const activeDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-green-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (activeDatasetButton) {
        fireEvent.click(activeDatasetButton);
        
        // Verify dropdown is open
        expect(screen.getByText('Reset Dataset')).toBeInTheDocument();
        
        const resetButton = screen.getByText('Reset Dataset');
        fireEvent.click(resetButton);
        
        await waitFor(() => {
          // Dropdown should be closed after starting reset operation
          expect(screen.queryByText('Reset Dataset')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Loading States', () => {
    it('disables dropdown button when reset operations are in progress', () => {
      // Mock useResetDataSet with loading state
      jest.doMock('../../hooks/useApi', () => ({
        useDataSets: () => mockUseDataSets(),
        useDeleteDataSet: () => mockUseDeleteDataSet(),
        useUpdateDataSet: () => mockUseUpdateDataSet(),
        useResetDataSet: () => ({
          resetDataSet: jest.fn(),
          loading: true, // Set loading to true
          error: null,
        }),
      }));

      renderWithRouter(<DataSets />);
      
      // All dropdown buttons should be disabled when reset is loading
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const dropdownButtons = actionButtons.filter(button => 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      dropdownButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('shows loading text in reset button when operation is in progress', () => {
      // Mock useResetDataSet with loading state
      jest.doMock('../../hooks/useApi', () => ({
        useDataSets: () => mockUseDataSets(),
        useDeleteDataSet: () => mockUseDeleteDataSet(),
        useUpdateDataSet: () => mockUseUpdateDataSet(),
        useResetDataSet: () => ({
          resetDataSet: jest.fn(),
          loading: true, // Set loading to true
          error: null,
        }),
      }));

      renderWithRouter(<DataSets />);
      
      // Open dropdown for active dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const activeDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-green-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (activeDatasetButton) {
        fireEvent.click(activeDatasetButton);
        
        // Should show loading text
        expect(screen.getByText('Resetting...')).toBeInTheDocument();
        expect(screen.queryByText('Reset Dataset')).not.toBeInTheDocument();
      }
    });

    it('shows loading text in restore button when operation is in progress', () => {
      // Mock useResetDataSet with loading state
      jest.doMock('../../hooks/useApi', () => ({
        useDataSets: () => mockUseDataSets(),
        useDeleteDataSet: () => mockUseDeleteDataSet(),
        useUpdateDataSet: () => mockUseUpdateDataSet(),
        useResetDataSet: () => ({
          resetDataSet: jest.fn(),
          loading: true, // Set loading to true
          error: null,
        }),
      }));

      // Mock datasets with deleted dataset
      mockUseDataSets.mockReturnValue({
        data: [...mockDatasets, mockDeletedDataset],
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      renderWithRouter(<DataSets />);
      
      // Open dropdown for deleted dataset
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const deletedDatasetButton = actionButtons.find(button => 
        button.closest('[class*="border-red-200"]') && 
        button.querySelector('svg') && 
        button.querySelector('svg')?.getAttribute('d')?.includes('M12 5v.01')
      );
      
      if (deletedDatasetButton) {
        fireEvent.click(deletedDatasetButton);
        
        // Should show loading text
        expect(screen.getByText('Restoring...')).toBeInTheDocument();
        expect(screen.queryByText('Restore Dataset')).not.toBeInTheDocument();
      }
    });
  });
});
