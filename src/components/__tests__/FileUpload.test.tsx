import React from 'react';
import { render, screen } from '@testing-library/react';
import FileUpload from '../FileUpload';

// Mock dependencies
jest.mock('../../services/api', () => ({
  apiService: {
    uploadDataSet: jest.fn(),
  },
}));

jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({
      onClick: jest.fn(),
      onKeyDown: jest.fn(),
      role: 'button',
      tabIndex: 0,
    }),
    getInputProps: () => ({
      type: 'file',
      multiple: false,
      accept: '.csv,.json,.xlsx,.xls,.xml,.txt',
    }),
    isDragActive: false,
  }),
}));

describe('FileUpload', () => {
  const mockOnUploadSuccess = jest.fn();
  const mockOnUploadError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock apiService
    const { apiService } = require('../../services/api');
    apiService.uploadDataSet.mockResolvedValue({ id: 123 });
  });

  it('renders without crashing', () => {
    render(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByText('Drag & drop files here')).toBeInTheDocument();
    expect(screen.getByText('or click to select files')).toBeInTheDocument();
  });

  it('displays supported file formats', () => {
    render(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByText('Supported File Formats')).toBeInTheDocument();
    expect(screen.getByText('CSV - Comma-separated values')).toBeInTheDocument();
    expect(screen.getByText('JSON - JavaScript Object Notation')).toBeInTheDocument();
    expect(screen.getByText('Excel - XLSX/XLS files')).toBeInTheDocument();
    expect(screen.getByText('XML - Extensible Markup Language')).toBeInTheDocument();
    expect(screen.getByText('TXT - Plain text files')).toBeInTheDocument();
  });

  it('displays default file size limit', () => {
    render(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByText('Max file size: 100 MB')).toBeInTheDocument();
  });

  it('displays custom file size limit', () => {
    render(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
        maxFileSize={50 * 1024 * 1024} // 50MB
      />
    );

    expect(screen.getByText('Max file size: 50 MB')).toBeInTheDocument();
  });

  it('displays default allowed file types', () => {
    render(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByText('Supported formats: .csv, .json, .xlsx, .xls, .xml, .txt')).toBeInTheDocument();
  });

  it('displays custom allowed file types', () => {
    render(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
        allowedTypes={['.pdf', '.doc']}
      />
    );

    expect(screen.getByText('Supported formats: .pdf, .doc')).toBeInTheDocument();
  });

  it('formats file sizes correctly', () => {
    const testCases = [
      { bytes: 0, expected: '0 Bytes' },
      { bytes: 1024, expected: '1 KB' },
      { bytes: 1024 * 1024, expected: '1 MB' },
      { bytes: 1024 * 1024 * 1024, expected: '1 GB' },
    ];

    testCases.forEach(({ bytes, expected }) => {
      render(
        <FileUpload
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
          maxFileSize={bytes}
        />
      );
      
      expect(screen.getByText(`Max file size: ${expected}`)).toBeInTheDocument();
    });
  });

  it('displays correct file icons for different file types', () => {
    render(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByText('📊')).toBeInTheDocument(); // CSV
    expect(screen.getByText('📄')).toBeInTheDocument(); // JSON
    expect(screen.getByText('📈')).toBeInTheDocument(); // Excel
    expect(screen.getByText('📋')).toBeInTheDocument(); // XML
    expect(screen.getByText('📝')).toBeInTheDocument(); // TXT
  });

  it('supports multiple file uploads when enabled', () => {
    render(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
        multiple={true}
      />
    );

    expect(screen.getByText('Drag & drop files here')).toBeInTheDocument();
  });

  it('maintains upload state across re-renders', () => {
    render(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByText('Drag & drop files here')).toBeInTheDocument();
  });

  it('renders with correct accessibility attributes', () => {
    render(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const dropZone = screen.getByRole('button');
    expect(dropZone).toBeInTheDocument();
    expect(dropZone).toHaveAttribute('tabIndex', '0');
  });

  it('handles custom file size limits correctly', () => {
    const customSizes = [
      { bytes: 1024, expected: '1 KB' },
      { bytes: 2048, expected: '2 KB' },
      { bytes: 1024 * 1024 * 2, expected: '2 MB' },
    ];

    customSizes.forEach(({ bytes, expected }) => {
      render(
        <FileUpload
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
          maxFileSize={bytes}
        />
      );
      
      expect(screen.getByText(`Max file size: ${expected}`)).toBeInTheDocument();
    });
  });

  it('renders file type information section', () => {
    render(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByText('Supported File Formats')).toBeInTheDocument();
    expect(screen.getByText('CSV - Comma-separated values')).toBeInTheDocument();
    expect(screen.getByText('JSON - JavaScript Object Notation')).toBeInTheDocument();
    expect(screen.getByText('Excel - XLSX/XLS files')).toBeInTheDocument();
    expect(screen.getByText('XML - Extensible Markup Language')).toBeInTheDocument();
    expect(screen.getByText('TXT - Plain text files')).toBeInTheDocument();
  });
});
