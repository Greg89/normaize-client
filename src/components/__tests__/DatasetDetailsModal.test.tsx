import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DatasetDetailsModal from '../DatasetDetailsModal';
import { DataSet } from '../../types';

// Mock the formatFileSize utility
jest.mock('../../utils/format', () => ({
  formatFileSize: (bytes: number) => `${bytes} bytes`,
}));

describe('DatasetDetailsModal', () => {
  const mockDataset: DataSet = {
    id: 1,
    name: 'Test Dataset',
    description: 'A test dataset for testing purposes',
    fileName: 'test-data.csv',
    fileType: 'CSV',
    fileSize: 1024 * 1024, // 1MB
    uploadedAt: '2024-01-15T10:30:00Z',
    rowCount: 1000,
    columnCount: 10,
    isProcessed: true,
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    expect(screen.queryByText('Dataset Details')).not.toBeInTheDocument();
  });

  it('renders nothing when dataset is null', () => {
    render(
      <DatasetDetailsModal
        dataset={null}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    expect(screen.queryByText('Dataset Details')).not.toBeInTheDocument();
  });

  it('renders modal when open with dataset', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    expect(screen.getByText('Dataset Details')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Dataset')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A test dataset for testing purposes')).toBeInTheDocument();
  });

  it('populates form fields with dataset data', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    expect(screen.getByDisplayValue('Test Dataset')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A test dataset for testing purposes')).toBeInTheDocument();
  });

  it('handles empty description gracefully', () => {
    const datasetWithoutDescription = { ...mockDataset, description: undefined };
    
    render(
      <DatasetDetailsModal
        dataset={datasetWithoutDescription}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('displays read-only dataset information correctly', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    expect(screen.getByText('test-data.csv')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('1048576 bytes')).toBeInTheDocument();
    expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Processed')).toBeInTheDocument();
  });

  it('displays pending status correctly', () => {
    const pendingDataset = { ...mockDataset, isProcessed: false };
    
    render(
      <DatasetDetailsModal
        dataset={pendingDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('allows editing name field', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Dataset');
    fireEvent.change(nameInput, { target: { value: 'Updated Dataset Name' } });
    
    expect(screen.getByDisplayValue('Updated Dataset Name')).toBeInTheDocument();
  });

  it('allows editing description field', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    const descriptionInput = screen.getByDisplayValue('A test dataset for testing purposes');
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
    
    expect(screen.getByDisplayValue('Updated description')).toBeInTheDocument();
  });

  it('calls onSave with updated values when save button is clicked', async () => {
    mockOnSave.mockResolvedValue(true);
    
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Dataset');
    const descriptionInput = screen.getByDisplayValue('A test dataset for testing purposes');
    
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'New Name',
        description: 'New Description',
      });
    });
  });

  it('closes modal when save is successful', async () => {
    mockOnSave.mockResolvedValue(true);
    
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('does not close modal when save fails', async () => {
    mockOnSave.mockResolvedValue(false);
    
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
    
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(screen.getByText('Dataset Details')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets form to original values when cancel is clicked', () => {
    const { rerender } = render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Dataset');
    const descriptionInput = screen.getByDisplayValue('A test dataset for testing purposes');
    
    // Change values
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
    fireEvent.change(descriptionInput, { target: { value: 'Changed Description' } });
    
    // Verify changes
    expect(screen.getByDisplayValue('Changed Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Changed Description')).toBeInTheDocument();
    
    // Cancel should reset to original values
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Re-render to see the reset values
    rerender(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );
    
    expect(screen.getByDisplayValue('Test Dataset')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A test dataset for testing purposes')).toBeInTheDocument();
  });

  it('calls onClose when close button (X) is clicked', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' }); // SVG button
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables save button when name is empty', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Dataset');
    const saveButton = screen.getByText('Save Changes');
    
    // Clear the name
    fireEvent.change(nameInput, { target: { value: '' } });
    
    expect(saveButton).toBeDisabled();
  });

  it('disables save button when name is only whitespace', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Dataset');
    const saveButton = screen.getByText('Save Changes');
    
    // Set name to only whitespace
    fireEvent.change(nameInput, { target: { value: '   ' } });
    
    expect(saveButton).toBeDisabled();
  });

  it('disables all interactive elements when loading', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={true}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Dataset');
    const descriptionInput = screen.getByDisplayValue('A test dataset for testing purposes');
    const saveButton = screen.getByText('Saving...');
    const cancelButton = screen.getByText('Cancel');
    const closeButton = screen.getByRole('button', { name: '' });

    expect(nameInput).toBeDisabled();
    expect(descriptionInput).toBeDisabled();
    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });

  it('shows loading text on save button when loading', () => {
    render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={true}
      />
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
  });

  it('updates form when dataset changes', () => {
    const { rerender } = render(
      <DatasetDetailsModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    const newDataset = {
      ...mockDataset,
      name: 'New Dataset Name',
      description: 'New dataset description',
    };

    rerender(
      <DatasetDetailsModal
        dataset={newDataset}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    expect(screen.getByDisplayValue('New Dataset Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New dataset description')).toBeInTheDocument();
  });

  it('handles large file names with truncation', () => {
    const datasetWithLongFileName = {
      ...mockDataset,
      fileName: 'very-long-file-name-that-exceeds-normal-length-and-should-be-truncated.csv',
    };

    render(
      <DatasetDetailsModal
        dataset={datasetWithLongFileName}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    expect(screen.getByText('very-long-file-name-that-exceeds-normal-length-and-should-be-truncated.csv')).toBeInTheDocument();
  });

  it('handles large numbers in row count', () => {
    const datasetWithLargeRowCount = {
      ...mockDataset,
      rowCount: 999999999,
    };

    render(
      <DatasetDetailsModal
        dataset={datasetWithLargeRowCount}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    expect(screen.getByText('999,999,999')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const datasetWithZeroValues = {
      ...mockDataset,
      rowCount: 0,
      columnCount: 0,
      fileSize: 0,
    };

    render(
      <DatasetDetailsModal
        dataset={datasetWithZeroValues}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={false}
      />
    );

    // Check for specific zero values in context
    expect(screen.getByText('Rows:').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('Columns:').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('0 bytes')).toBeInTheDocument();
  });
});
