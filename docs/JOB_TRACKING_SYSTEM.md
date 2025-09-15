# Job Tracking System Documentation

## Overview

The Job Tracking System is a comprehensive solution for managing long-running background operations in the Normaize client application. It provides real-time job status tracking, automatic polling, persistence, and a clean separation of concerns following SOLID principles.

## Table of Contents

- [Architecture](#architecture)
- [Core Components](#core-components)
- [SOLID Principles Implementation](#solid-principles-implementation)
- [API Integration](#api-integration)
- [Usage Guide](#usage-guide)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Extending the System](#extending-the-system)

## Architecture

The Job Tracking System follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ RemoveDuplicates│  │ JobProgressModal│  │ Other UIs    │ │
│  │   Component     │  │   Component     │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Hook Layer                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              useJobTracking Hook                       │ │
│  │  • State management • Polling • Event handling        │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              JobTrackingService                        │ │
│  │                   (Facade)                             │ │
│  └─────────────────────────────────────────────────────────┘ │
│           │              │              │                   │
│           ▼              ▼              ▼                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │JobRepository│ │JobTracker   │ │  JobCleanupService      │ │
│  │             │ │Factory      │ │                         │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────┐ ┌─────────────────────────────────────────┐ │
│  │   Storage   │ │          Event Emitter                  │ │
│  │             │ │                                         │ │
│  └─────────────┘ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │LocalStorage │ │   Logger    │ │      API Service        │ │
│  │             │ │             │ │                         │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. JobTrackingService (Facade)

The main entry point that orchestrates all job tracking operations.

**Responsibilities:**
- Create and manage jobs
- Coordinate between repository, factory, and cleanup services
- Provide a simplified interface for consumers

**Key Methods:**
```typescript
async createJob(jobResponse, type, datasetId, datasetName, config?): Promise<JobTracker>
async updateJob(jobResponse): Promise<JobTracker | null>
async getJob(jobId): Promise<JobTracker | null>
async getAllJobs(): Promise<JobTracker[]>
async getJobsByStatus(status): Promise<JobTracker[]>
async removeJob(jobId): Promise<void>
subscribeToUpdates(listener): () => void
```

### 2. JobRepository

Manages job data operations and coordinates with storage and events.

**Responsibilities:**
- CRUD operations for jobs
- Coordinate persistence and notifications
- Maintain in-memory job cache

### 3. JobTrackerFactory

Creates and updates JobTracker instances from server responses.

**Responsibilities:**
- Convert server DTOs to client models
- Handle date parsing and type conversion
- Ensure consistent object creation

### 4. Storage Layer (IJobStorage)

**LocalStorageJobStorage Implementation:**
- Persists jobs to browser localStorage
- Handles serialization/deserialization
- Manages storage errors gracefully

### 5. Event System (IJobEventEmitter)

**JobEventEmitter Implementation:**
- Observer pattern for job updates
- Real-time notifications to UI components
- Memory leak prevention

### 6. Cleanup Service (IJobCleanupService)

**JobCleanupService Implementation:**
- Removes completed jobs older than 24 hours
- Clears all completed jobs on demand
- Maintains system performance

## SOLID Principles Implementation

### Single Responsibility Principle (SRP) ✅

Each class has one clear responsibility:
- `JobTrackerFactory`: Object creation only
- `LocalStorageJobStorage`: Storage operations only
- `JobEventEmitter`: Event handling only
- `JobRepository`: Data operations only
- `JobCleanupService`: Cleanup operations only

### Open/Closed Principle (OCP) ✅

The system is open for extension but closed for modification:
- New storage implementations can be added without changing existing code
- New event emitters can be plugged in via dependency injection
- Job types can be extended without modifying core services

### Liskov Substitution Principle (LSP) ✅

All implementations can be substituted for their interfaces:
- Any `IJobStorage` implementation works with `JobRepository`
- Any `IJobEventEmitter` implementation works with the system
- Implementations are fully interchangeable

### Interface Segregation Principle (ISP) ✅

Interfaces are small and focused:
- `IJobStorage`: Only storage operations
- `IJobEventEmitter`: Only event operations
- `IJobRepository`: Only data operations
- `IJobCleanupService`: Only cleanup operations

### Dependency Inversion Principle (DIP) ✅

High-level modules depend on abstractions:
- `JobTrackingService` depends on interfaces, not concrete classes
- Dependencies are injected via constructors
- Easy to mock and test

## API Integration

### Server Endpoint Integration

The system integrates with the server's job-based duplicate removal endpoint:

```typescript
// Server endpoint: POST /api/datasets/{dataSetId}/remove-duplicates
// Returns: NormalizationJobResponse

interface NormalizationJobResponse {
  jobId: string;
  status: 'Queued' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  message: string;
  submittedAt: string; // ISO date
  estimatedCompletionAt?: string; // ISO date
  progressPercentage: number;
  success: boolean;
}
```

### Status Polling

The system automatically polls job status using:
```typescript
// GET /api/jobs/{jobId}/status
// Returns: NormalizationJobResponse
```

## Usage Guide

### Basic Usage

```typescript
import { useJobTracking } from '../hooks/useJobTracking';

function MyComponent() {
  const { 
    createJob, 
    activeJobs, 
    completedJobs, 
    hasActiveJobs,
    loading,
    error 
  } = useJobTracking();

  const handleRemoveDuplicates = async () => {
    try {
      // Call the API endpoint
      const jobResponse = await apiService.removeDuplicates(datasetId, request);
      
      // Create and track the job
      const job = await createJob(
        jobResponse,
        'REMOVE_DUPLICATES',
        datasetId,
        datasetName,
        { columnNames: request.columnNames }
      );
      
      console.log('Job created:', job.jobId);
    } catch (error) {
      console.error('Failed to start job:', error);
    }
  };

  return (
    <div>
      {hasActiveJobs && <p>Jobs running: {activeJobs.length}</p>}
      {activeJobs.map(job => (
        <JobProgressCard key={job.jobId} job={job} />
      ))}
    </div>
  );
}
```

### Advanced Usage

```typescript
// Custom polling interval
const { activeJobs } = useJobTracking({ 
  pollInterval: 3000, // 3 seconds
  enablePolling: true 
});

// Manual job management
const jobService = getJobTrackingService();

// Get specific job
const job = await jobService.getJob('job-123');

// Get jobs by status
const runningJobs = await jobService.getJobsByStatus(NormalizationJobStatus.PROCESSING);

// Subscribe to updates
const unsubscribe = jobService.subscribeToUpdates((jobs) => {
  console.log('Jobs updated:', jobs);
});
```

## Configuration

### Default Settings

```typescript
// Polling configuration
const DEFAULT_POLL_INTERVAL = 5000; // 5 seconds
const DEFAULT_ENABLE_POLLING = true;

// Cleanup configuration
const CLEANUP_OLDER_THAN_HOURS = 24; // 24 hours
const STORAGE_KEY = 'normaize_active_jobs';

// Job status groups
const JOB_STATUS_GROUPS = {
  ACTIVE: [NormalizationJobStatus.QUEUED, NormalizationJobStatus.PROCESSING],
  COMPLETED: [NormalizationJobStatus.COMPLETED, NormalizationJobStatus.FAILED, NormalizationJobStatus.CANCELLED],
  SUCCESSFUL: [NormalizationJobStatus.COMPLETED],
  FAILED: [NormalizationJobStatus.FAILED, NormalizationJobStatus.CANCELLED]
};
```

### Customization

```typescript
// Custom storage implementation
class DatabaseJobStorage implements IJobStorage {
  async save(jobs: JobTracker[]): Promise<void> {
    // Custom database persistence
  }
  // ... other methods
}

// Custom job tracking service
const customService = new JobTrackingService(
  new JobRepository(new DatabaseJobStorage(), new JobEventEmitter()),
  new JobTrackerFactory(),
  new JobCleanupService(repository),
  new JobEventEmitter()
);
```

## Error Handling

### Storage Errors

```typescript
// LocalStorageJobStorage handles storage errors gracefully
try {
  await storage.save(jobs);
} catch (error) {
  logger.error('Failed to save jobs to localStorage', { error });
  // System continues to function without persistence
}
```

### API Errors

```typescript
// useJobTracking handles polling errors
const pollJobStatuses = async () => {
  const results = await Promise.all(
    activeJobs.map(job => 
      apiService.getJobStatus(job.jobId)
        .catch(error => {
          logger.error('Failed to poll job status', { jobId: job.jobId, error });
          return null; // Continue with other jobs
        })
    )
  );
};
```

### Event Listener Errors

```typescript
// JobEventEmitter handles listener errors
emit(jobs: JobTracker[]): void {
  this.listeners.forEach(listener => {
    try {
      listener(jobs);
    } catch (error) {
      logger.error('Error notifying job event listener', { error });
      // Continue notifying other listeners
    }
  });
}
```

## Testing

### Unit Tests

The system includes comprehensive unit tests for all components:

```typescript
// Example test structure
describe('JobTrackingService', () => {
  let service: JobTrackingService;
  let mockRepository: jest.Mocked<IJobRepository>;
  let mockFactory: jest.Mocked<IJobTrackerFactory>;

  beforeEach(() => {
    // Setup mocks and service
  });

  describe('createJob', () => {
    it('should create a job and add it to repository', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

Tests verify the interaction between components:

```typescript
describe('Job Tracking Integration', () => {
  it('should persist jobs and emit events when jobs are created', async () => {
    // Test full workflow
  });
});
```

### Hook Tests

React hook testing with proper cleanup:

```typescript
describe('useJobTracking', () => {
  it('should poll active jobs and update state', async () => {
    // Test hook behavior
  });
});
```

## Extending the System

### Adding New Job Types

```typescript
// 1. Add to JobTracker type
type JobType = 'REMOVE_DUPLICATES' | 'NORMALIZE_DATA' | 'TRANSFORM_DATA' | 'NEW_JOB_TYPE';

// 2. Add API endpoint
async newJobOperation(params): Promise<NormalizationJobResponse> {
  return this.request('/api/new-operation', { method: 'POST', body: JSON.stringify(params) });
}

// 3. Use in components
const job = await createJob(response, 'NEW_JOB_TYPE', datasetId, datasetName, config);
```

### Custom Storage Implementation

```typescript
class ApiJobStorage implements IJobStorage {
  async save(jobs: JobTracker[]): Promise<void> {
    await fetch('/api/jobs/sync', {
      method: 'POST',
      body: JSON.stringify(jobs)
    });
  }

  async load(): Promise<JobTracker[]> {
    const response = await fetch('/api/jobs');
    return response.json();
  }

  async clear(): Promise<void> {
    await fetch('/api/jobs', { method: 'DELETE' });
  }
}
```

### Real-time Updates

```typescript
class WebSocketJobEventEmitter implements IJobEventEmitter {
  private ws: WebSocket;
  private listeners = new Set<(jobs: JobTracker[]) => void>();

  constructor() {
    this.ws = new WebSocket('/api/jobs/ws');
    this.ws.onmessage = (event) => {
      const jobs = JSON.parse(event.data);
      this.emit(jobs);
    };
  }

  // ... implementation
}
```

## Performance Considerations

### Memory Management

- Automatic cleanup of old completed jobs
- Proper event listener cleanup in React hooks
- Efficient job filtering using utility functions

### Network Optimization

- Intelligent polling (only polls active jobs)
- Configurable polling intervals
- Batch status updates

### Storage Optimization

- Efficient localStorage serialization
- Automatic cleanup of corrupted data
- Minimal storage footprint

## Security Considerations

### Data Validation

- Server response validation before processing
- Type safety throughout the system
- Error boundaries for malformed data

### Storage Security

- No sensitive data stored in localStorage
- Job configuration sanitization
- Secure API communication

## Troubleshooting

### Common Issues

1. **Jobs not updating**: Check network connectivity and API endpoints
2. **Memory leaks**: Ensure proper cleanup of event listeners
3. **Storage errors**: Check localStorage availability and quota
4. **Polling issues**: Verify API endpoint responses and error handling

### Debugging

```typescript
// Enable debug logging
logger.setLevel('debug');

// Monitor job events
const unsubscribe = jobService.subscribeToUpdates((jobs) => {
  console.log('Job update:', jobs);
});

// Check storage state
const jobs = await jobService.getAllJobs();
console.log('Current jobs:', jobs);
```

## Conclusion

The Job Tracking System provides a robust, scalable solution for managing background operations in the Normaize client. Its adherence to SOLID principles ensures maintainability, while comprehensive error handling and testing provide reliability. The system is designed to be extensible and can easily accommodate future requirements.
