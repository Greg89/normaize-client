# Seq CORS Troubleshooting Guide

## Issue Description

You're experiencing a CORS (Cross-Origin Resource Sharing) error when trying to send logs from your production frontend (`https://app.normaize.com`) to your Seq server (`https://seq-production-8a89.up.railway.app`).

**Error Message:**
```
Access to fetch at 'https://seq-production-8a89.up.railway.app//api/events/raw' from origin 'https://app.normaize.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Causes

1. **Double Slash Issue**: The URL has a double slash (`//api/events/raw`) - **FIXED** in the logger code
2. **CORS Configuration**: Seq server doesn't allow requests from your production domain
3. **Missing CORS Headers**: Seq needs to be configured to allow cross-origin requests

## Solutions

### 1. Fix URL Construction (Already Applied)

The logger code has been updated to prevent double slashes:

```typescript
// Fix URL construction to prevent double slashes
const seqUrl = this.seqUrl.endsWith('/') ? this.seqUrl.slice(0, -1) : this.seqUrl;
const fullUrl = `${seqUrl}/api/events/raw`;
```

### 2. Configure Seq CORS (Required)

Your Seq server needs to be configured to allow CORS requests. Here are the options:

#### Option A: Configure Seq with CORS Headers

If you have access to your Seq server configuration, add these headers to your Seq server:

```nginx
# If using nginx as reverse proxy
add_header 'Access-Control-Allow-Origin' 'https://app.normaize.com' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, X-Seq-ApiKey' always;
add_header 'Access-Control-Max-Age' '86400' always;

# Handle preflight requests
if ($request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' 'https://app.normaize.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, X-Seq-ApiKey' always;
    add_header 'Access-Control-Max-Age' '86400' always;
    add_header 'Content-Type' 'text/plain; charset=utf-8';
    add_header 'Content-Length' 0;
    return 204;
}
```

#### Option B: Use Railway Environment Variables

If your Seq is deployed on Railway, you can configure CORS through environment variables:

```env
# Add to your Seq Railway project
CORS_ALLOWED_ORIGINS=https://app.normaize.com,https://beta.normaize.com
CORS_ALLOWED_METHODS=GET,POST,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,X-Seq-ApiKey
```

#### Option C: Use a CORS Proxy (Temporary Solution)

As a temporary workaround, you can use a CORS proxy:

```typescript
// In your logger.ts, modify the fetch URL
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const fullUrl = `${corsProxy}${seqUrl}/api/events/raw`;
```

**Note**: This is not recommended for production as it adds latency and security concerns.

### 3. Alternative: Backend Logging Proxy

Create a backend endpoint that forwards logs to Seq:

```javascript
// In your backend server
app.post('/api/logs', async (req, res) => {
  try {
    const response = await fetch(`${process.env.SEQ_URL}/api/events/raw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Seq-ApiKey': process.env.SEQ_API_KEY
      },
      body: JSON.stringify(req.body)
    });
    
    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(response.status).json({ error: 'Failed to forward to Seq' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

Then update your frontend logger to use this endpoint instead:

```typescript
// In logger.ts
const fullUrl = `${API_CONFIG.BASE_URL}/api/logs`;
```

## Debugging Steps

### 1. Check Environment Variables

Verify your production environment variables are set correctly:

```bash
# In Railway dashboard, check these variables:
VITE_SEQ_URL=https://seq-production-8a89.up.railway.app
VITE_SEQ_API_KEY=your-api-key
```

### 2. Test Seq Connectivity

Test if your Seq server is accessible:

```bash
# Test basic connectivity
curl -I https://seq-production-8a89.up.railway.app

# Test the API endpoint
curl -X POST https://seq-production-8a89.up.railway.app/api/events/raw \
  -H "Content-Type: application/json" \
  -H "X-Seq-ApiKey: your-api-key" \
  -d '[{"message": "test"}]'
```

### 3. Check Browser Console

Look for the enhanced debug logs in your browser console:

```javascript
// You should see logs like:
Logger initialization { hasSeqUrl: true, hasApiKey: true, seqUrl: "https://seq-production-8a89.up.railway.app", ... }
Attempting to send log to Seq { seqUrl: "...", fullUrl: "...", hasApiKey: true, origin: "https://app.normaize.com" }
```

### 4. Test with Different Origins

Test if the issue is specific to your production domain:

```javascript
// In browser console on your production site
fetch('https://seq-production-8a89.up.railway.app/api/events/raw', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([{ message: 'test' }])
}).then(r => console.log('Success')).catch(e => console.error('Error:', e));
```

## Recommended Solution

**For immediate fix**: Use the backend logging proxy approach (Option 3) as it's the most reliable and secure.

**For long-term**: Configure CORS properly on your Seq server (Option A or B).

## Environment Variables Checklist

Make sure these are set in your Railway production environment:

```env
# Frontend (normaize-client)
VITE_SEQ_URL=https://seq-production-8a89.up.railway.app
VITE_SEQ_API_KEY=your-seq-api-key
VITE_NODE_ENV=production

# Backend (if using proxy approach)
SEQ_URL=https://seq-production-8a89.up.railway.app
SEQ_API_KEY=your-seq-api-key
```

## Monitoring

After implementing the fix, monitor:

1. **Browser Console**: Check for successful log sends
2. **Seq Dashboard**: Verify logs are appearing
3. **Network Tab**: Confirm no more CORS errors
4. **Error Rates**: Monitor for any remaining logging failures

## Fallback Behavior

The logger is designed to gracefully handle failures:

- If Seq is unavailable, logs fall back to console
- If CORS fails, logs are still captured locally
- No application functionality is affected by logging failures 