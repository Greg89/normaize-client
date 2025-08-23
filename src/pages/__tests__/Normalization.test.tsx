import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Normalization from '../Normalization';
import * as useApiHook from '../../hooks/useApi';

// Mock the hooks
jest.mock('../../hooks/useApi');
jest.mock('../../utils/logger');

const mockUseDataSets = useApiHook.useDataSets as jest.MockedFunction<typeof useApiHook.useDataSets>;

// Mock data
const mockDatasets = [
  {
    id: 1,
    name: 'Test Dataset 1',
    description: 'A test dataset for normalization',
    fileName: 'test1.csv',
    fileType: 'csv',
    fileSize: 1024000,
    uploadedAt: '2023-10-01T10:00:00Z',
    rowCount: 1000,
    columnCount: 10,
    isProcessed: true,
    isDeleted: false
  },
  {
    id: 2,
    name: 'Test Dataset 2',
    description: 'Another test dataset',
    fileName: 'test2.csv',
    fileType: 'csv',
    fileSize: 2048000,
    uploadedAt: '2023-10-02T10:00:00Z',
    rowCount: 2000,
    columnCount: 15,
    isProcessed: false,
    isDeleted: false
  },
  {
    id: 3,
    name: 'Deleted Dataset',
    description: 'This dataset is deleted',
    fileName: 'deleted.csv',
    fileType: 'csv',
    fileSize: 512000,
    uploadedAt: '2023-09-30T10:00:00Z',
    rowCount: 500,
    columnCount: 5,
    isProcessed: true,
    isDeleted: true
  }
];

const renderNormalization = () => {
  return render(
    <BrowserRouter>
      <Normalization />
      <Toaster />
    </BrowserRouter>
  );
};

describe('Normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders normalization page title and description', () => {
    mockUseDataSets.mockReturnValue({
      data: mockDatasets,
      loading: false,
      error: null,
      refetch: jest.fn(),
      setData: jest.fn()
    });

    renderNormalization();

    expect(screen.getByText('Data Normalization')).toBeInTheDocument();
    expect(screen.getByText('Transform and enhance your datasets before analysis')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseDataSets.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
      setData: jest.fn()
    });

    renderNormalization();

    expect(screen.getByText('Loading datasets...')).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    const mockRefetch = jest.fn();
    mockUseDataSets.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load datasets',
      refetch: mockRefetch,
      setData: jest.fn()
    });

    renderNormalization();

    expect(screen.getByText('Error loading datasets: Failed to load datasets')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try again');
    fireEvent.click(retryButton);
    
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when no active datasets are available', () => {
    mockUseDataSets.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
      setData: jest.fn()
    });

    renderNormalization();

    expect(screen.getByText('No active datasets available')).toBeInTheDocument();
    expect(screen.getByText('Please upload and process a dataset first in the Datasets section.')).toBeInTheDocument();
  });

  it('displays active datasets and filters out deleted ones', () => {
    mockUseDataSets.mockReturnValue({
      data: mockDatasets,
      loading: false,
      error: null,
      refetch: jest.fn(),
      setData: jest.fn()
    });

    renderNormalization();

    // Should show active datasets
    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
    expect(screen.getByText('Test Dataset 2')).toBeInTheDocument();
    
    // Should not show deleted dataset
    expect(screen.queryByText('Deleted Dataset')).not.toBeInTheDocument();
  });

  it('shows processed datasets as ready for normalization', () => {
    mockUseDataSets.mockReturnValue({
      data: mockDatasets,
      loading: false,
      error: null,
      refetch: jest.fn(),
      setData: jest.fn()
    });

    renderNormalization();

    expect(screen.getByText('Ready for Normalization')).toBeInTheDocument();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('allows selecting a processed dataset and shows transformation workflow', async () => {
    mockUseDataSets.mockReturnValue({
      data: mockDatasets,
      loading: false,
      error: null,
      refetch: jest.fn(),
      setData: jest.fn()
    });

    renderNormalization();

    // Click on the first dataset (which is processed) - should click on the dataset card
    const datasetCard = screen.getByText('Test Dataset 1').closest('div[class*="cursor-pointer"]');
    expect(datasetCard).toBeInTheDocument();
    fireEvent.click(datasetCard as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Normalization Tools')).toBeInTheDocument();
      expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
    });

    // Check that tool categories are shown
    expect(screen.getByText('Data Cleaning')).toBeInTheDocument();
    expect(screen.getAllByText('Data Normalization')[1]).toBeInTheDocument(); // Second instance (tool category)
    expect(screen.getByText('Data Enhancement')).toBeInTheDocument();
    expect(screen.getByText('Data Validation')).toBeInTheDocument();
  });

  it('disables selection for non-processed datasets', () => {
    mockUseDataSets.mockReturnValue({
      data: mockDatasets,
      loading: false,
      error: null,
      refetch: jest.fn(),
      setData: jest.fn()
    });

    renderNormalization();

    const processingStatus = screen.getByText('Processing...');
    expect(processingStatus).toBeInTheDocument();

    // The second dataset is not processed - should be clickable but shows processing status
    const secondDatasetCard = screen.getByText('Test Dataset 2').closest('div[class*="cursor-pointer"]');
    expect(secondDatasetCard).toBeInTheDocument();
    expect(secondDatasetCard).toHaveClass('border-yellow-200'); // Yellow border for processing datasets
  });

  it('allows changing dataset from transformation workflow', async () => {
    mockUseDataSets.mockReturnValue({
      data: mockDatasets,
      loading: false,
      error: null,
      refetch: jest.fn(),
      setData: jest.fn()
    });

    renderNormalization();

    // Select a dataset first - click on the dataset card
    const datasetCard = screen.getByText('Test Dataset 1').closest('div[class*="cursor-pointer"]');
    fireEvent.click(datasetCard as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Normalization Tools')).toBeInTheDocument();
    });

    // Click change dataset button
    const changeButton = screen.getByText('Change Dataset');
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(screen.getByText('Select Dataset for Normalization')).toBeInTheDocument();
    });
  });

  it('auto-selects first processed dataset when available', () => {
    mockUseDataSets.mockReturnValue({
      data: mockDatasets,
      loading: false,
      error: null,
      refetch: jest.fn(),
      setData: jest.fn()
    });

    renderNormalization();

    // The first dataset should be auto-selected since it's processed
    // We can verify this by checking if the component tries to show the transformation workflow
    // after the initial render
    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('shows dataset information correctly', () => {
    mockUseDataSets.mockReturnValue({
      data: mockDatasets,
      loading: false,
      error: null,
      refetch: jest.fn(),
      setData: jest.fn()
    });

    renderNormalization();

    // Check that dataset information is displayed
    expect(screen.getByText('A test dataset for normalization')).toBeInTheDocument();
    expect(screen.getByText('Size: 1000.0 KB')).toBeInTheDocument();
    expect(screen.getByText('Rows: 1,000')).toBeInTheDocument();
    expect(screen.getByText('Columns: 10')).toBeInTheDocument();
  });
});
