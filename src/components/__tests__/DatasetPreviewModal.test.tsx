import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DatasetPreviewModal from '../DatasetPreviewModal';
import { DataSet } from '../../types';
import { apiService } from '../../services/api';

jest.mock('../../services/api', () => ({
  apiService: {
    getDataSetPreview: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    devDebug: jest.fn(),
  },
}));

// Keep preview tests stable and decoupled from helper logic
jest.mock('../../utils/datasetHelpers', () => ({
  getRowCount: () => 1234,
  getFileType: () => 'CSV',
}));

describe('DatasetPreviewModal', () => {
  const mockDataset: DataSet = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Dataset',
    description: 'A test dataset',
    createdBy: 'test-user',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: undefined,
    isProcessed: true,
    isDeleted: false,
    fileMetadata: {
      originalFileName: 'test.csv',
      storagePath: 's3://bucket/test.csv',
      fileType: 'CSV',
      sizeInBytes: 1024,
      checksum: 'abc123',
      storageProvider: 'S3',
    },
    statistics: {
      rowCount: 1234,
      columnCount: 2,
      fileSizeBytes: 1024,
      lastProcessedAt: '2024-01-15T10:30:00Z',
    },
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });
 
  it('renders nothing when closed', () => {
    render(
      <DatasetPreviewModal dataset={mockDataset} isOpen={false} onClose={mockOnClose} />
    );

    expect(screen.queryByText('Dataset Preview')).not.toBeInTheDocument();
  });

  it('does not call API when dataset is null', async () => {
    render(<DatasetPreviewModal dataset={null} isOpen={true} onClose={mockOnClose} />);

    expect(await screen.findByText('Dataset Preview')).toBeInTheDocument();
    expect(apiService.getDataSetPreview).not.toHaveBeenCalled();
    expect(screen.getByText('No Preview Data')).toBeInTheDocument();
  });

  it('renders preview rows from server-shaped payload (rows/columns + ColumnInfo[])', async () => {
    (apiService.getDataSetPreview as jest.Mock).mockResolvedValue({
      dataSetId: mockDataset.id,
      columns: [
        { name: 'First', dataType: 'string', index: 0, allowNull: false },
        { name: 'Age', dataType: 'number', index: 1, allowNull: true },
      ],
      rows: [
        { First: 'Alice', Age: 30 },
        { First: 'Bob', Age: null },
      ],
      totalRows: 1234,
      previewRows: 2,
    });

    render(
      <DatasetPreviewModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Modal shell renders immediately
    expect(await screen.findByText('Dataset Preview')).toBeInTheDocument();
    expect(screen.getByText('Test Dataset')).toBeInTheDocument();

    // Table headers and data should appear after async load
    expect(await screen.findByText('First')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();

    // Nulls render as '-'
    await waitFor(() => {
      expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('parses wrapped shapes (response.data.rows/columns)', async () => {
    (apiService.getDataSetPreview as jest.Mock).mockResolvedValue({
      data: {
        rows: [{ A: 'x' }],
        columns: ['A'],
      },
    });

    render(
      <DatasetPreviewModal
        dataset={mockDataset}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(await screen.findByText('A')).toBeInTheDocument();
    expect(screen.getByText('x')).toBeInTheDocument();
  });
});
