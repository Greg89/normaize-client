# Authentication Refresh Issue Fix

## Problem Description

When manually refreshing the page, users were being redirected back to the sign-in page even when they had a valid session. This was happening because:

1. Auth0 wasn't properly configured to use refresh tokens
2. Token validation was too aggressive and forcing logout on validation errors
3. Missing silent authentication attempts on page load
4. Race conditions in authentication state management

## Solutions Implemented

### 1. Enhanced Auth0 Configuration

**File: `src/components/Auth0Provider.tsx`**
- Added `useRefreshTokens={true}` and `useRefreshTokensFallback={true}` to Auth0Provider
- Improved token validation logic to not force logout on periodic validation errors
- Added page visibility change listener to validate tokens when page becomes visible

**File: `src/utils/auth0-config.ts`**
- Added `offline_access` scope to enable refresh tokens

### 2. Session Persistence Component

**File: `src/components/SessionPersistence.tsx`**
- New component that attempts silent authentication on page load
- Prevents unnecessary redirects by trying to refresh tokens silently first
- Only shows login page if silent authentication fails

### 3. Improved Error Handling

**File: `src/App.tsx`**
- Added proper error handling for authentication errors
- Shows user-friendly error messages instead of immediate redirects
- Added refresh button for users to retry authentication

**File: `src/hooks/useAuth.ts`**
- Improved token retrieval to not force logout on errors
- Added debugging capabilities for development

### 4. Debugging Tools

**File: `src/utils/authDebugger.ts`**
- Development-only debugging utility
- Logs authentication state changes
- Decodes and logs token information
- Checks localStorage for Auth0 items

**File: `src/pages/AuthDebug.tsx`**
- Debug page available at `/auth-debug` in development
- Shows current authentication state
- Displays user information and localStorage contents
- Provides actions to test authentication flow

## Testing the Fix

### 1. Basic Test
1. Log in to your application
2. Navigate to any page (e.g., `/datasets`)
3. Manually refresh the page (F5 or Ctrl+R)
4. You should remain on the same page and stay authenticated

### 2. Debug Page Test
1. In development mode, navigate to `/auth-debug`
2. Check the authentication state
3. Try refreshing the page and observe the state changes
4. Use the "Clear Storage & Refresh" button to test the full flow

### 3. Token Expiration Test
1. Log in and wait for token to expire (or manually clear tokens)
2. Try to access a protected page
3. Should attempt silent authentication first
4. Only redirect to login if silent auth fails

## Environment Variables

Ensure your Auth0 configuration includes:

```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
```

## Auth0 Dashboard Configuration

Make sure your Auth0 application has:
- **Application Type**: Single Page Application
- **Token Endpoint Authentication Method**: None
- **Grant Types**: Authorization Code, Refresh Token
- **Refresh Token Rotation**: Enabled (recommended)

## Common Issues and Solutions

### Still getting redirected on refresh?
1. Check browser console for Auth0 errors
2. Verify Auth0 application settings
3. Check that refresh tokens are enabled in Auth0 dashboard
4. Clear browser storage and try again

### Debug information not showing?
1. Ensure you're in development mode (`import.meta.env.DEV` is true)
2. Check browser console for debug logs
3. Visit `/auth-debug` page for detailed information

### Token validation errors?
1. Check Auth0 application settings
2. Verify audience and domain configuration
3. Ensure API is properly configured in Auth0

## Monitoring

The application now includes comprehensive logging for authentication events:
- Authentication state changes
- Token validation attempts
- Silent authentication attempts
- Error conditions

Check the browser console and your logging system for detailed information about authentication flow. 