/**
 * Zod schemas for runtime validation of API responses.
 *
 * Each schema mirrors the TypeScript interface in index.ts.  Where the server
 * may omit optional fields we use `.optional()` so the app degrades gracefully
 * rather than throwing on unexpected-but-harmless shape differences.
 *
 * All entity schemas use `.passthrough()` (Zod v3) so that extra fields
 * returned by the server are preserved and not silently stripped.
 *
 * Usage (safeParse â€” never crashes the app):
 *   const result = DataSetSchema.safeParse(rawData);
 *   if (!result.success) { logger.warn(..., result.error.issues); }
 *   else { use result.data }
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Primitive building blocks
// ---------------------------------------------------------------------------

/** ISO 8601 date-time string (we accept any non-empty string â€” strict parsing
 *  would require re-implementing the full ISO spec, which is out of scope here). */
const isoDateString = z.string().min(1);

/** A UUID string â€” the server always sends GUIDs for ids. */
const uuidString = z.string().uuid();

// ---------------------------------------------------------------------------
// FileMetadataResponse
// ---------------------------------------------------------------------------
export const FileMetadataSchema = z.object({
  originalFileName: z.string(),
  storagePath: z.string(),
  fileType: z.string(),
  sizeInBytes: z.number(),
  checksum: z.string(),
  storageProvider: z.string(),
}).passthrough();

// ---------------------------------------------------------------------------
// DatasetStatisticsResponse
// ---------------------------------------------------------------------------
export const DatasetStatisticsSchema = z.object({
  rowCount: z.number(),
  columnCount: z.number(),
  fileSizeBytes: z.number(),
  lastProcessedAt: isoDateString.nullable(),
}).passthrough();

// ---------------------------------------------------------------------------
// DataSet
// ---------------------------------------------------------------------------
export const DataSetSchema = z.object({
  id: uuidString,
  name: z.string(),
  description: z.string().optional(),
  createdBy: z.string(),
  createdAt: isoDateString,
  updatedAt: isoDateString.optional().nullable(),
  isProcessed: z.boolean(),
  isDeleted: z.boolean().optional(),
  fileMetadata: FileMetadataSchema.optional().nullable(),
  statistics: DatasetStatisticsSchema,
  // Legacy / derived fields â€” all optional
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
  uploadedAt: isoDateString.optional(),
  rowCount: z.number().optional(),
  columnCount: z.number().optional(),
  retentionExpiryDate: isoDateString.optional().nullable(),
  schema: z.string().optional().nullable(),
  previewData: z.string().optional().nullable(),
}).passthrough();

export const DataSetArraySchema = z.array(DataSetSchema);

// ---------------------------------------------------------------------------
// DataSetUploadResponse
// ---------------------------------------------------------------------------
export const DataSetUploadResponseSchema = z.object({
  id: uuidString,
  name: z.string(),
  description: z.string(),
  createdBy: z.string(),
  createdAt: isoDateString,
  updatedAt: isoDateString.optional().nullable(),
  isProcessed: z.boolean(),
  isDeleted: z.boolean(),
  retentionExpiryDate: isoDateString.optional().nullable(),
  fileMetadata: FileMetadataSchema.optional().nullable(),
  statistics: DatasetStatisticsSchema,
  processingJobId: z.string().optional().nullable(),
  isAsyncProcessing: z.boolean().optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------
export const AnalysisSchema = z.object({
  id: uuidString,
  name: z.string(),
  description: z.string().optional(),
  type: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  createdAt: isoDateString,
  completedAt: isoDateString.optional().nullable(),
  dataSetId: uuidString,
  results: z.unknown().optional(),
}).passthrough();

export const AnalysisArraySchema = z.array(AnalysisSchema);

// ---------------------------------------------------------------------------
// NormalizationJobResponse
// ---------------------------------------------------------------------------
export const NormalizationJobStatusSchema = z.enum([
  'Queued',
  'Processing',
  'Completed',
  'Failed',
  'Cancelled',
]);

export const NormalizationJobResponseSchema = z.object({
  jobId: uuidString,
  status: NormalizationJobStatusSchema,
  message: z.string(),
  submittedAt: isoDateString,
  estimatedCompletionAt: isoDateString.optional().nullable(),
  progressPercentage: z.number().min(0).max(100),
  success: z.boolean(),
}).passthrough();

// ---------------------------------------------------------------------------
// UserSettingsDto
// ---------------------------------------------------------------------------
export const UserSettingsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  // Notifications
  emailNotificationsEnabled: z.boolean(),
  pushNotificationsEnabled: z.boolean(),
  processingCompleteNotifications: z.boolean(),
  errorNotifications: z.boolean(),
  weeklyDigestEnabled: z.boolean(),
  // UI preferences
  theme: z.string(),
  language: z.string(),
  defaultPageSize: z.number(),
  showTutorials: z.boolean(),
  compactMode: z.boolean(),
  // Data processing
  autoProcessUploads: z.boolean(),
  maxPreviewRows: z.number(),
  defaultFileType: z.string(),
  enableDataValidation: z.boolean(),
  enableSchemaInference: z.boolean(),
  // Privacy
  shareAnalytics: z.boolean(),
  allowDataUsageForImprovement: z.boolean(),
  showProcessingTime: z.boolean(),
  // Optional account info
  displayName: z.string().optional().nullable(),
  timeZone: z.string().optional().nullable(),
  dateFormat: z.string().optional().nullable(),
  timeFormat: z.string().optional().nullable(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
}).passthrough();

// ---------------------------------------------------------------------------
// UserProfileDto
// ---------------------------------------------------------------------------
export const UserProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  name: z.string(),
  picture: z.string().optional().nullable(),
  emailVerified: z.boolean(),
  settings: UserSettingsSchema,
}).passthrough();

// ---------------------------------------------------------------------------
// ApiResponse wrapper
// ---------------------------------------------------------------------------
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    success: z.boolean(),
    message: z.string().optional(),
    timestamp: z.string().optional(),
    errors: z.array(z.string()).optional(),
  });

