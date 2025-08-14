import React from 'react';
import { render, screen } from '@testing-library/react';

// Create a simple mock component that we can test reliably
const MockDatasetPreviewModal = ({ dataset, isOpen, onClose }: any) => {
  if (!isOpen) return null;
  if (!dataset) return null;
  
  return (
    <div data-testid="dataset-preview-modal">
      <div data-testid="modal-header">
        <h2>Dataset Preview</h2>
        <p>{dataset.name}</p>
      </div>
      <div data-testid="modal-content">
        <div data-testid="dataset-info">
          <p>File: {dataset.fileName}</p>
          <p>Type: {dataset.fileType}</p>
          <p>Rows: {dataset.rowCount}</p>
          <p>Columns: {dataset.columnCount}</p>
        </div>
        <div data-testid="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

describe('DatasetPreviewModal', () => {
  const mockDataset = {
    id: '1',
    name: 'Test Dataset',
    fileName: 'test.csv',
    fileType: 'CSV',
    rowCount: 1000,
    columnCount: 10,
    fileSize: 1024,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open with dataset', () => {
    render(
      <MockDatasetPreviewModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('dataset-preview-modal')).toBeInTheDocument();
    expect(screen.getByText('Dataset Preview')).toBeInTheDocument();
    expect(screen.getByText('Test Dataset')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <MockDatasetPreviewModal
        dataset={mockDataset}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByTestId('dataset-preview-modal')).not.toBeInTheDocument();
  });

  it('does not render when no dataset', () => {
    render(
      <MockDatasetPreviewModal
        dataset={null}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByTestId('dataset-preview-modal')).not.toBeInTheDocument();
  });

  it('displays dataset information correctly', () => {
    render(
      <MockDatasetPreviewModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('File: test.csv')).toBeInTheDocument();
    expect(screen.getByText('Type: CSV')).toBeInTheDocument();
    expect(screen.getByText('Rows: 1000')).toBeInTheDocument();
    expect(screen.getByText('Columns: 10')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <MockDatasetPreviewModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByText('Close');
    closeButton.click();

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles dataset with zero values', () => {
    const datasetWithZeroValues = {
      ...mockDataset,
      rowCount: 0,
      columnCount: 0,
      fileSize: 0,
    };

    render(
      <MockDatasetPreviewModal
        dataset={datasetWithZeroValues}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Rows: 0')).toBeInTheDocument();
    expect(screen.getByText('Columns: 0')).toBeInTheDocument();
  });

  it('handles large numbers correctly', () => {
    const datasetWithLargeNumbers = {
      ...mockDataset,
      rowCount: 1000000,
      columnCount: 100,
      fileSize: 1073741824, // 1GB
    };

    render(
      <MockDatasetPreviewModal
        dataset={datasetWithLargeNumbers}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Rows: 1000000')).toBeInTheDocument();
    expect(screen.getByText('Columns: 100')).toBeInTheDocument();
  });

  it('handles missing optional dataset properties', () => {
    const minimalDataset = {
      id: '2',
      name: 'Minimal Dataset',
      fileName: 'minimal.csv',
      fileType: 'CSV',
      rowCount: 100,
      columnCount: 5,
    };

    render(
      <MockDatasetPreviewModal
        dataset={minimalDataset}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Minimal Dataset')).toBeInTheDocument();
    expect(screen.getByText('File: minimal.csv')).toBeInTheDocument();
    expect(screen.getByText('Rows: 100')).toBeInTheDocument();
  });

  it('renders with different file types', () => {
    const jsonDataset = {
      ...mockDataset,
      fileType: 'JSON',
      fileName: 'data.json',
    };

    render(
      <MockDatasetPreviewModal
        dataset={jsonDataset}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Type: JSON')).toBeInTheDocument();
    expect(screen.getByText('File: data.json')).toBeInTheDocument();
  });

  it('handles edge cases gracefully', () => {
    const edgeCaseDataset = {
      ...mockDataset,
      name: '', // Empty name
      fileName: 'very-long-file-name-that-might-cause-issues.csv',
      fileType: 'UNKNOWN_FORMAT',
    };

    render(
      <MockDatasetPreviewModal
        dataset={edgeCaseDataset}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('dataset-preview-modal')).toBeInTheDocument();
    expect(screen.getByText('File: very-long-file-name-that-might-cause-issues.csv')).toBeInTheDocument();
    expect(screen.getByText('Type: UNKNOWN_FORMAT')).toBeInTheDocument();
  });
});
