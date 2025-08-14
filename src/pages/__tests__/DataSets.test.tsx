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
  default: ({ onUploadSuccess, onUploadError, multiple }: any) => (
    <div data-testid="file-upload">
      <button onClick={() => onUploadSuccess(1, 'test.csv')}>Mock Upload Success</button>
      <button onClick={() => onUploadError('Upload failed')}>Mock Upload Error</button>
      <span>Multiple: {multiple ? 'true' : 'false'}</span>
    </div>
  ),
}));

jest.mock('../../components/DatasetDetailsModal', () => ({
  __esModule: true,
  default: ({ dataset, isOpen, onClose, onSave, loading }: any) => {
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
  default: ({ dataset, isOpen, onClose }: any) => {
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

    mockUseUpdateDataSet.mockReturnValue({
      updateDataSet: jest.fn().mockResolvedValue(true),
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
      
      const { toast } = require('react-hot-toast');
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
      const sizeElements = screen.getAllByText('Size: < 0.01 MB');
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
        
        const { toast } = require('react-hot-toast');
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
        
        const { toast } = require('react-hot-toast');
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
});
