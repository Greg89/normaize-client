import {
  FileMetadataSchema,
  DatasetStatisticsSchema,
  DataSetSchema,
  DataSetArraySchema,
  DataSetUploadResponseSchema,
  AnalysisSchema,
  AnalysisArraySchema,
  NormalizationJobResponseSchema,
  NormalizationJobStatusSchema,
  UserSettingsSchema,
  UserProfileSchema,
  ApiResponseSchema,
} from '../schemas';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const fileMetadata = {
  originalFileName: 'data.csv',
  storagePath: 's3://bucket/data.csv',
  fileType: 'CSV',
  sizeInBytes: 2048,
  checksum: 'abc123',
  storageProvider: 'S3',
};

const statistics = {
  rowCount: 100,
  columnCount: 5,
  fileSizeBytes: 2048,
  lastProcessedAt: '2026-01-01T00:00:00Z',
};

const validDataSet = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'My Dataset',
  description: 'Test dataset',
  createdBy: 'auth0|user123',
  createdAt: '2026-01-01T00:00:00Z',
  isProcessed: true,
  statistics,
};

const validAnalysis = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'My Analysis',
  type: 'descriptive',
  status: 'completed' as const,
  createdAt: '2026-01-01T00:00:00Z',
  dataSetId: '550e8400-e29b-41d4-a716-446655440000',
};

const validJob = {
  jobId: '550e8400-e29b-41d4-a716-446655440002',
  status: 'Queued' as const,
  message: 'Job submitted',
  submittedAt: '2026-01-01T00:00:00Z',
  progressPercentage: 0,
  success: true,
};

const validSettings = {
  id: '550e8400-e29b-41d4-a716-446655440003',
  userId: 'auth0|user123',
  emailNotificationsEnabled: true,
  pushNotificationsEnabled: false,
  processingCompleteNotifications: true,
  errorNotifications: true,
  weeklyDigestEnabled: false,
  theme: 'light',
  language: 'en',
  defaultPageSize: 25,
  showTutorials: true,
  compactMode: false,
  autoProcessUploads: true,
  maxPreviewRows: 100,
  defaultFileType: 'CSV',
  enableDataValidation: true,
  enableSchemaInference: true,
  shareAnalytics: false,
  allowDataUsageForImprovement: false,
  showProcessingTime: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const validUserProfile = {
  userId: 'auth0|user123',
  email: 'user@example.com',
  name: 'Test User',
  emailVerified: true,
  settings: validSettings,
};

// ---------------------------------------------------------------------------
// FileMetadataSchema
// ---------------------------------------------------------------------------

describe('FileMetadataSchema', () => {
  it('parses a valid file metadata object', () => {
    expect(FileMetadataSchema.safeParse(fileMetadata).success).toBe(true);
  });

  it('fails when sizeInBytes is a string', () => {
    expect(FileMetadataSchema.safeParse({ ...fileMetadata, sizeInBytes: 'big' }).success).toBe(false);
  });

  it('fails when required field is missing', () => {
    const { checksum, ...partial } = fileMetadata;
    void checksum;
    expect(FileMetadataSchema.safeParse(partial).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DatasetStatisticsSchema
// ---------------------------------------------------------------------------

describe('DatasetStatisticsSchema', () => {
  it('parses a valid statistics object', () => {
    expect(DatasetStatisticsSchema.safeParse(statistics).success).toBe(true);
  });

  it('fails when rowCount is missing', () => {
    const { rowCount, ...partial } = statistics;
    void rowCount;
    expect(DatasetStatisticsSchema.safeParse(partial).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DataSetSchema
// ---------------------------------------------------------------------------

describe('DataSetSchema', () => {
  it('parses a minimal valid dataset', () => {
    const result = DataSetSchema.safeParse(validDataSet);
    expect(result.success).toBe(true);
  });

  it('parses a dataset with full file metadata and legacy fields', () => {
    const full = {
      ...validDataSet,
      fileMetadata,
      fileName: 'data.csv',
      rowCount: 100,
      columnCount: 5,
      retentionExpiryDate: '2027-01-01T00:00:00Z',
    };
    expect(DataSetSchema.safeParse(full).success).toBe(true);
  });

  it('accepts null updatedAt', () => {
    expect(DataSetSchema.safeParse({ ...validDataSet, updatedAt: null }).success).toBe(true);
  });

  it('fails when id is not a UUID', () => {
    expect(DataSetSchema.safeParse({ ...validDataSet, id: 'not-a-uuid' }).success).toBe(false);
  });

  it('fails when isProcessed is not boolean', () => {
    expect(DataSetSchema.safeParse({ ...validDataSet, isProcessed: 'yes' }).success).toBe(false);
  });

  it('fails when statistics is missing', () => {
    const { statistics: _s, ...noStats } = validDataSet;
    void _s;
    expect(DataSetSchema.safeParse(noStats).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DataSetArraySchema
// ---------------------------------------------------------------------------

describe('DataSetArraySchema', () => {
  it('parses an empty array', () => {
    expect(DataSetArraySchema.safeParse([]).success).toBe(true);
  });

  it('parses an array of valid datasets', () => {
    expect(DataSetArraySchema.safeParse([validDataSet, { ...validDataSet, id: '550e8400-e29b-41d4-a716-446655440099' }]).success).toBe(true);
  });

  it('fails when an element has an invalid id', () => {
    expect(DataSetArraySchema.safeParse([{ ...validDataSet, id: 'bad' }]).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DataSetUploadResponseSchema
// ---------------------------------------------------------------------------

describe('DataSetUploadResponseSchema', () => {
  const validUpload = {
    ...validDataSet,
    description: 'desc',
    isDeleted: false,
  };

  it('parses a valid upload response', () => {
    expect(DataSetUploadResponseSchema.safeParse(validUpload).success).toBe(true);
  });

  it('parses with processingJobId and isAsyncProcessing', () => {
    const async = {
      ...validUpload,
      processingJobId: '550e8400-e29b-41d4-a716-446655440004',
      isAsyncProcessing: true,
    };
    expect(DataSetUploadResponseSchema.safeParse(async).success).toBe(true);
  });

  it('fails when isDeleted is missing', () => {
    const { isDeleted, ...partial } = validUpload;
    void isDeleted;
    expect(DataSetUploadResponseSchema.safeParse(partial).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AnalysisSchema
// ---------------------------------------------------------------------------

describe('AnalysisSchema', () => {
  it('parses a valid analysis', () => {
    expect(AnalysisSchema.safeParse(validAnalysis).success).toBe(true);
  });

  it('rejects an invalid status value', () => {
    expect(AnalysisSchema.safeParse({ ...validAnalysis, status: 'in-progress' }).success).toBe(false);
  });

  it('fails when dataSetId is not a UUID', () => {
    expect(AnalysisSchema.safeParse({ ...validAnalysis, dataSetId: '123' }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AnalysisArraySchema
// ---------------------------------------------------------------------------

describe('AnalysisArraySchema', () => {
  it('parses an empty array', () => {
    expect(AnalysisArraySchema.safeParse([]).success).toBe(true);
  });

  it('parses an array of valid analyses', () => {
    expect(AnalysisArraySchema.safeParse([validAnalysis]).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// NormalizationJobStatusSchema
// ---------------------------------------------------------------------------

describe('NormalizationJobStatusSchema', () => {
  it.each(['Queued', 'Processing', 'Completed', 'Failed', 'Cancelled'])('accepts %s', (status) => {
    expect(NormalizationJobStatusSchema.safeParse(status).success).toBe(true);
  });

  it('rejects an unknown status', () => {
    expect(NormalizationJobStatusSchema.safeParse('Running').success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// NormalizationJobResponseSchema
// ---------------------------------------------------------------------------

describe('NormalizationJobResponseSchema', () => {
  it('parses a valid job response', () => {
    expect(NormalizationJobResponseSchema.safeParse(validJob).success).toBe(true);
  });

  it('parses with estimatedCompletionAt', () => {
    const withEta = { ...validJob, estimatedCompletionAt: '2026-01-01T01:00:00Z' };
    expect(NormalizationJobResponseSchema.safeParse(withEta).success).toBe(true);
  });

  it('fails when progressPercentage is negative', () => {
    expect(NormalizationJobResponseSchema.safeParse({ ...validJob, progressPercentage: -1 }).success).toBe(false);
  });

  it('fails when progressPercentage exceeds 100', () => {
    expect(NormalizationJobResponseSchema.safeParse({ ...validJob, progressPercentage: 101 }).success).toBe(false);
  });

  it('fails when jobId is not a UUID', () => {
    expect(NormalizationJobResponseSchema.safeParse({ ...validJob, jobId: 'not-uuid' }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// UserSettingsSchema
// ---------------------------------------------------------------------------

describe('UserSettingsSchema', () => {
  it('parses valid settings', () => {
    expect(UserSettingsSchema.safeParse(validSettings).success).toBe(true);
  });

  it('accepts optional nullable display fields', () => {
    const withExtras = { ...validSettings, displayName: null, timeZone: 'UTC' };
    expect(UserSettingsSchema.safeParse(withExtras).success).toBe(true);
  });

  it('fails when defaultPageSize is not a number', () => {
    expect(UserSettingsSchema.safeParse({ ...validSettings, defaultPageSize: '25' }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// UserProfileSchema
// ---------------------------------------------------------------------------

describe('UserProfileSchema', () => {
  it('parses a valid user profile', () => {
    expect(UserProfileSchema.safeParse(validUserProfile).success).toBe(true);
  });

  it('fails on invalid email format', () => {
    expect(UserProfileSchema.safeParse({ ...validUserProfile, email: 'not-an-email' }).success).toBe(false);
  });

  it('fails when settings is missing', () => {
    const { settings, ...noSettings } = validUserProfile;
    void settings;
    expect(UserProfileSchema.safeParse(noSettings).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ApiResponseSchema (wrapper factory)
// ---------------------------------------------------------------------------

describe('ApiResponseSchema', () => {
  it('wraps a dataset schema and validates a valid response', () => {
    const WrappedSchema = ApiResponseSchema(DataSetSchema);
    const payload = { data: validDataSet, success: true };
    expect(WrappedSchema.safeParse(payload).success).toBe(true);
  });

  it('fails when success is not boolean', () => {
    const WrappedSchema = ApiResponseSchema(DataSetSchema);
    const payload = { data: validDataSet, success: 'true' };
    expect(WrappedSchema.safeParse(payload).success).toBe(false);
  });

  it('accepts optional message and errors fields', () => {
    const WrappedSchema = ApiResponseSchema(DataSetSchema);
    const payload = { data: validDataSet, success: true, message: 'ok', errors: [] };
    expect(WrappedSchema.safeParse(payload).success).toBe(true);
  });
});
