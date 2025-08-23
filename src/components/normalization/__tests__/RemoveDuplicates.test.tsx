import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
  isDeleted: false
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

  it('allows selecting columns', () => {
    renderRemoveDuplicates();

    const nameCheckbox = screen.getByLabelText('name');
    fireEvent.click(nameCheckbox);

    expect(nameCheckbox).toBeChecked();
  });

  it('shows keep strategy options', () => {
    renderRemoveDuplicates();

    expect(screen.getByText('Which Duplicate to Keep')).toBeInTheDocument();
    expect(screen.getByText('Keep first occurrence')).toBeInTheDocument();
    expect(screen.getByText('Keep last occurrence')).toBeInTheDocument();
  });

  it('shows configuration summary', () => {
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

  it('updates configuration summary when columns are selected', () => {
    renderRemoveDuplicates();

    // Select email column
    const emailCheckbox = screen.getByLabelText('email');
    fireEvent.click(emailCheckbox);

    // Check that summary updates - should find email in the summary section
    const summarySection = screen.getByText('Configuration Summary').closest('div');
    expect(summarySection).toHaveTextContent('email');
  });
});
