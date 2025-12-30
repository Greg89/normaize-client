import { DataSet } from '../types';

/**
 * Helper functions to work with the new DDD API DataSet structure
 * while maintaining backward compatibility with legacy properties
 */

/**
 * Get the file name from dataset
 */
export function getFileName(dataset: DataSet): string {
  return dataset.fileMetadata?.originalFileName || dataset.fileName || 'Unknown';
}

/**
 * Get the file type from dataset
 */
export function getFileType(dataset: DataSet): string {
  return dataset.fileMetadata?.fileType || dataset.fileType || 'Unknown';
}

/**
 * Get the file size from dataset
 */
export function getFileSize(dataset: DataSet): number {
  return dataset.fileMetadata?.sizeInBytes || dataset.fileSize || 0;
}

/**
 * Get the upload date from dataset
 */
export function getUploadedAt(dataset: DataSet): string {
  return dataset.createdAt || dataset.uploadedAt || new Date().toISOString();
}

/**
 * Get the row count from dataset
 */
export function getRowCount(dataset: DataSet): number {
  return dataset.statistics?.rowCount || dataset.rowCount || 0;
}

/**
 * Get the column count from dataset
 */
export function getColumnCount(dataset: DataSet): number {
  return dataset.statistics?.columnCount || dataset.columnCount || 0;
}

/**
 * Get the storage provider from dataset
 */
export function getStorageProvider(dataset: DataSet): string {
  return dataset.fileMetadata?.storageProvider || 'Unknown';
}

/**
 * Get the storage path from dataset
 */
export function getStoragePath(dataset: DataSet): string {
  return dataset.fileMetadata?.storagePath || 'Unknown';
}

/**
 * Normalize a dataset to ensure all legacy properties are populated
 * This is useful when receiving new DDD API responses and needing to work with legacy code
 */
export function normalizeDataSet(dataset: DataSet): DataSet {
  return {
    ...dataset,
    // Ensure legacy properties are set from new structure
    fileName: getFileName(dataset),
    fileType: getFileType(dataset),
    fileSize: getFileSize(dataset),
    uploadedAt: getUploadedAt(dataset),
    rowCount: getRowCount(dataset),
    columnCount: getColumnCount(dataset),
  };
}
