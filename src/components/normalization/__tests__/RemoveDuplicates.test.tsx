import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toaster } from 'react-hot-toast';
import RemoveDuplicates from '../RemoveDuplicates';
import { DataSet } from '../../../types';

// Mock the problematic modules
jest.mock('../../../utils/logger');
jest.mock('../../../utils/constants', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:5000',
    TIMEOUT: 10000
  }
}));
jest.mock('../../../services/api');

// Mock the useRemoveDuplicates hook
const mockRemoveDuplicates = jest.fn();
jest.mock('../../../hooks/useApi', () => ({
  useRemoveDuplicates: () => ({
    removeDuplicates: mockRemoveDuplicates,
    loading: false,
    error: null,
  }),
}));

const mockDataset: DataSet = {
  id: 1,
  name: 'Test Dataset',
  description: 'A test dataset for duplicate removal',
  fileName: 'test.csv',
  fileType: 'csv',
  fileSize: 1024000,
  uploadedAt: '2023-10-01T10:00:00Z',
  rowCount: 1000,
  columnCount: 6,
  isProcessed: true,
  isDeleted: false,
  schema: JSON.stringify(['id', 'name', 'email', 'age', 'city', 'country'])
};

const renderRemoveDuplicates = () => {
  return render(
    <>
      <RemoveDuplicates dataset={mockDataset} />
      <Toaster />
    </>
  );
};

describe('RemoveDuplicates', () => {
  it('renders component with dataset information', () => {
    renderRemoveDuplicates();

    expect(screen.getByText('Remove Duplicates')).toBeInTheDocument();
    expect(screen.getByText(/Configure duplicate removal settings for/)).toBeInTheDocument();
    expect(screen.getAllByText('Test Dataset')).toHaveLength(2); // Once in header, once in summary
  });

  it('shows column selection options', () => {
    renderRemoveDuplicates();

    expect(screen.getByText('Select Columns for Comparison')).toBeInTheDocument();
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
  });

  it('has all columns selected by default', () => {
    renderRemoveDuplicates();

    const nameCheckbox = screen.getByLabelText('name');
    const emailCheckbox = screen.getByLabelText('email');
    const idCheckbox = screen.getByLabelText('id');

    expect(nameCheckbox).toBeChecked();
    expect(emailCheckbox).toBeChecked();
    expect(idCheckbox).toBeChecked();
  });

  it('allows deselecting columns', () => {
    renderRemoveDuplicates();

    const nameCheckbox = screen.getByLabelText('name');
    expect(nameCheckbox).toBeChecked(); // Initially checked

    fireEvent.click(nameCheckbox);
    expect(nameCheckbox).not.toBeChecked(); // Now unchecked
  });

  it('shows keep strategy options', () => {
    renderRemoveDuplicates();

    expect(screen.getByText('Which Duplicate to Keep')).toBeInTheDocument();
    expect(screen.getByText('Keep first occurrence')).toBeInTheDocument();
    expect(screen.getByText('Keep last occurrence')).toBeInTheDocument();
  });

  it('shows configuration summary with all columns selected by default', () => {
    renderRemoveDuplicates();

    expect(screen.getByText('Configuration Summary')).toBeInTheDocument();
    expect(screen.getByText('Dataset:')).toBeInTheDocument();
    expect(screen.getByText('Columns to compare:')).toBeInTheDocument();
    expect(screen.getByText('All columns')).toBeInTheDocument();
  });

  it('has execute button', () => {
    renderRemoveDuplicates();

    expect(screen.getByText('Execute Duplicate Removal')).toBeInTheDocument();
    // Preview button was removed per requirements
    expect(screen.queryByText('Preview Changes')).not.toBeInTheDocument();
  });

  it('updates configuration summary when columns are deselected', () => {
    renderRemoveDuplicates();

    // Initially shows "All columns"
    expect(screen.getByText('All columns')).toBeInTheDocument();

    // Deselect email column
    const emailCheckbox = screen.getByLabelText('email');
    fireEvent.click(emailCheckbox);

    // Check that summary updates to show specific columns (not "All columns")
    const summarySection = screen.getByText('Configuration Summary').closest('div');
    expect(summarySection).toHaveTextContent('id, name, age, city, country');
    expect(summarySection).not.toHaveTextContent('All columns');
  });

  it('has Select All and Deselect All buttons', () => {
    renderRemoveDuplicates();

    expect(screen.getByText('Select All')).toBeInTheDocument();
    expect(screen.getByText('Deselect All')).toBeInTheDocument();
  });

  it('Select All button selects all columns', () => {
    renderRemoveDuplicates();

    // First deselect a column
    const emailCheckbox = screen.getByLabelText('email');
    fireEvent.click(emailCheckbox);
    expect(emailCheckbox).not.toBeChecked();

    // Click Select All
    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    // All columns should be selected
    expect(emailCheckbox).toBeChecked();
    expect(screen.getByText('All columns')).toBeInTheDocument();
  });

  it('Deselect All button deselects all columns', () => {
    renderRemoveDuplicates();

    // Initially all columns are selected
    const emailCheckbox = screen.getByLabelText('email');
    expect(emailCheckbox).toBeChecked();

    // Click Deselect All
    const deselectAllButton = screen.getByText('Deselect All');
    fireEvent.click(deselectAllButton);

    // No columns should be selected
    expect(emailCheckbox).not.toBeChecked();
    expect(screen.getByText('No columns selected')).toBeInTheDocument();
  });

  it('shows validation error when no columns are selected and execute is clicked', async () => {
    renderRemoveDuplicates();

    // Deselect all columns first
    const deselectAllButton = screen.getByText('Deselect All');
    fireEvent.click(deselectAllButton);

    const executeButton = screen.getByText('Execute Duplicate Removal');
    fireEvent.click(executeButton);

    await waitFor(() => {
      // The toast error should be triggered
      expect(mockRemoveDuplicates).not.toHaveBeenCalled();
    });
  });

  it('calls API with all columns selected by default when execute is clicked', async () => {
    mockRemoveDuplicates.mockResolvedValue(true);
    renderRemoveDuplicates();

    // All columns are selected by default, so we can execute immediately
    const executeButton = screen.getByText('Execute Duplicate Removal');
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(mockRemoveDuplicates).toHaveBeenCalledWith(1, {
        columnNames: ['id', 'name', 'email', 'age', 'city', 'country'],
        keepFirstOccurrence: true,
        caseSensitive: true,
      });
    });
  });
});
