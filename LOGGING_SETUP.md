# Logging System Setup

This document describes the comprehensive logging system that integrates with Seq for structured logging, error tracking, and user action tracing.

## Overview

The logging system provides:
- **Structured logging** with correlation IDs for request tracing
- **Environment-aware** configuration (development vs production)
- **User action tracking** from login to exception
- **API call monitoring** with performance metrics
- **Exception tracking** with full context and stack traces
- **Low overhead** implementation optimized for production

## Architecture

### Frontend Logging
- **Logger**: HTTP-based logging to Seq
- **Error Boundary**: React error boundary with logging integration
- **API Service**: Automatic logging of all API calls
- **User Context**: Automatic user ID injection from Auth0

### Backend Logging (Server)
- **Winston + Seq**: Structured logging with correlation IDs
- **Request Tracing**: Middleware for request/response logging
- **Exception Handling**: Global error handlers with logging
- **Performance Monitoring**: Request duration and status tracking

## Environment Variables

### Frontend (.env)
```env
# Seq Configuration (Optional - if not set, logs go to console)
VITE_SEQ_URL=https://your-seq-instance.railway.app
VITE_SEQ_API_KEY=your-seq-api-key

# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier

# API Configuration
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```env
# Seq Configuration
SEQ_URL=https://your-seq-instance.railway.app
SEQ_API_KEY=your-seq-api-key
NODE_ENV=development

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
AUTH0_ISSUER=https://your-domain.auth0.com/

# Server Configuration
PORT=5000
```

## Usage Examples

### Frontend Logging

```typescript
import { logger } from '../utils/logger';

// Basic logging
await logger.info('User logged in successfully');
await logger.error('Failed to load data', { userId: '123' });

// User action tracking
await logger.trackUserAction('upload_dataset', {
  fileName: 'data.csv',
  fileSize: 1024,
  datasetId: '456'
});

// API call tracking (automatic)
// The API service automatically logs all calls

// Exception logging
try {
  // Some operation
} catch (error) {
  await logger.error('Operation failed', {
    operation: 'data_processing',
    input: { /* relevant data */ }
  }, error);
}
```

### Backend Logging

```javascript
const logger = require('./utils/logger');

// Basic logging
logger.info('Server started', { port: process.env.PORT });

// Request logging (automatic via middleware)
// All requests are automatically logged

// Exception logging
try {
  // Some operation
} catch (error) {
  logger.error('Database operation failed', {
    operation: 'user_create',
    userId: req.user.sub
  }, error);
}
```

## Log Structure

### Standard Log Entry
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "User action: upload_dataset",
  "properties": {
    "actionType": "user_action",
    "fileName": "data.csv",
    "fileSize": 1024
  },
  "userId": "auth0|123456789",
  "sessionId": "session_1705312200000_abc123",
  "correlationId": "corr_1705312200000_def456",
  "environment": "production",
  "userAgent": "Mozilla/5.0...",
  "url": "https://beta.normaize.com/datasets"
}
```

### Error Log Entry
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "error",
  "message": "API request failed: 500 Internal Server Error",
  "properties": {
    "url": "/api/datasets",
    "method": "POST",
    "status": 500,
    "duration": 1250
  },
  "exception": "Error: Database connection failed\n    at Database.connect (/app/db.js:25:10)\n    ...",
  "userId": "auth0|123456789",
  "sessionId": "session_1705312200000_abc123",
  "correlationId": "corr_1705312200000_def456",
  "environment": "production",
  "userAgent": "Mozilla/5.0...",
  "url": "https://beta.normaize.com/datasets"
}
```

## Correlation IDs

Correlation IDs allow you to trace a user's journey from login to any exception:

1. **Session ID**: Generated when user first visits the app
2. **Correlation ID**: Generated for each user session
3. **Operation Correlation**: Sub-correlations for specific operations

### Tracing Example
```
User Login → Session: session_123
  ├── Upload Dataset → Correlation: corr_123_upload_456
  │   ├── API Call → Same correlation
  │   └── Error → Same correlation (traceable!)
  └── View Dashboard → Correlation: corr_123_dashboard_789
```

## Seq Configuration

### Railway Setup
1. Deploy Seq to Railway
2. Get the Seq URL from Railway dashboard
3. Generate an API key in Seq
4. Add environment variables to both frontend and backend

### Seq Queries
```sql
-- Find all logs for a specific user
@UserId = "auth0|123456789"

-- Find all errors in the last hour
@Level = "error" and @Timestamp > now() - 1h

-- Find all API calls that took longer than 1 second
@Properties.Method != null and @Properties.Duration > 1000

-- Find all logs for a specific correlation
@CorrelationId = "corr_1705312200000_def456"
```

## Development vs Production

### Console Logging (Default)
- When `VITE_SEQ_URL` or `VITE_SEQ_API_KEY` are not set
- Logs go to console with full details
- No external dependencies
- Easy debugging with browser dev tools

### Seq Logging (Production)
- When both `VITE_SEQ_URL` and `VITE_SEQ_API_KEY` are set
- Logs sent to Seq via HTTP
- Structured format for analysis
- Correlation IDs for tracing
- Performance monitoring

## Performance Considerations

### Frontend
- **Async logging**: All logging is non-blocking
- **Batch sending**: Multiple logs can be batched (future enhancement)
- **Error handling**: Failed log sends don't break the app
- **Size limits**: Log entries are optimized for size

### Backend
- **Winston transport**: Efficient logging transport
- **Async operations**: Non-blocking log writes
- **Error isolation**: Logging errors don't affect application
- **Performance monitoring**: Built-in request timing

## Troubleshooting

### Common Issues

1. **Logs not appearing in Seq**
   - Check `VITE_SEQ_URL` and `VITE_SEQ_API_KEY`
   - Verify Seq is accessible from your environment
   - Check browser network tab for failed requests

2. **Missing user context**
   - Ensure Auth0 is properly configured
   - Check that user ID is being set in logger
   - Verify Auth0Provider is wrapping your app

3. **Performance impact**
   - Logging is async and non-blocking
   - Check browser performance tab
   - Monitor network requests to Seq

### Debug Mode
Set `VITE_NODE_ENV=development` to see all logs in console with full context.

## Best Practices

1. **Use structured logging**: Always include relevant context
2. **Track user actions**: Log important user interactions
3. **Include correlation IDs**: For traceability
4. **Monitor performance**: Watch for slow API calls
5. **Handle errors gracefully**: Log errors but don't break UX
6. **Use appropriate log levels**: info, warn, error, debug
7. **Keep logs secure**: Don't log sensitive data
8. **Monitor Seq**: Set up alerts for error spikes

## Future Enhancements

- **Log batching**: Batch multiple logs for efficiency
- **Log sampling**: Sample high-volume logs in production
- **Custom dashboards**: Seq dashboards for monitoring
- **Alerting**: Automatic alerts for error conditions
- **Performance metrics**: Detailed performance tracking
- **User analytics**: User behavior analysis from logs 