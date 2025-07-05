# Auth0 Setup Guide

This guide will help you set up Auth0 authentication for both your React frontend and backend server.

## Frontend Setup (React)

### 1. Environment Variables

Create a `.env` file in your frontend project root with the following variables:

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier

# API Configuration
VITE_API_URL=http://localhost:5000
```

### 2. Auth0 Dashboard Configuration

1. Go to your Auth0 Dashboard
2. Create a new **Single Page Application** for your React app
3. Configure the following settings:
   - **Allowed Callback URLs**: `http://localhost:5173, http://localhost:3000, https://your-production-domain.com`
   - **Allowed Logout URLs**: `http://localhost:5173, http://localhost:3000, https://your-production-domain.com`
   - **Allowed Web Origins**: `http://localhost:5173, http://localhost:3000, https://your-production-domain.com`

### 3. API Configuration

1. In your Auth0 Dashboard, go to **Applications** → **APIs**
2. Create a new API or use an existing one
3. Set the **Identifier** (this will be your `VITE_AUTH0_AUDIENCE`)
4. Configure the following settings:
   - **Token Expiration**: 86400 (24 hours)
   - **Allow Offline Access**: Yes
   - **Allow Skip Consent**: Yes

## Backend Setup (Server)

### 1. Install Dependencies

Navigate to your server directory (`C:\Projects\normaize-server`) and install the required packages:

```bash
npm install express-jwt jwks-rsa
npm install --save-dev @types/express-jwt
```

### 2. Environment Variables

Create a `.env` file in your server project root:

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
AUTH0_ISSUER=https://your-domain.auth0.com/

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Auth0 Middleware Setup

Create an Auth0 middleware file (`middleware/auth.js`):

```javascript
const { auth } = require('express-oauth2-jwt-bearer');

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: 'RS256'
});

module.exports = checkJwt;
```

### 4. Apply Middleware to Routes

In your main server file, apply the middleware to protected routes:

```javascript
const express = require('express');
const checkJwt = require('./middleware/auth');

const app = express();

// Public routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected routes
app.use('/api', checkJwt);
app.get('/api/datasets', (req, res) => {
  // Your protected endpoint logic
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
```

## Testing the Setup

### 1. Start Both Applications

**Frontend:**
```bash
npm run dev
```

**Backend:**
```bash
cd C:\Projects\normaize-server
npm start
```

### 2. Test Authentication Flow

1. Open your React app in the browser
2. You should be redirected to the login page
3. Sign in with your Auth0 credentials
4. After successful authentication, you should be redirected back to your app
5. The user information should appear in the header
6. API calls should now include the authorization token

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Auth0 application has the correct callback URLs configured
2. **Token Validation Errors**: Verify that the `AUTH0_AUDIENCE` matches between frontend and backend
3. **Redirect Issues**: Check that the redirect URI in Auth0 matches your application URL

### Debug Tips

1. Check browser console for Auth0-related errors
2. Verify environment variables are loaded correctly
3. Ensure your Auth0 application type is set to "Single Page Application"
4. Check that your API identifier matches the audience in both frontend and backend

## Production Deployment

### 1. Update Environment Variables

For production, update your environment variables with your production URLs:

```env
# Frontend (.env)
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
VITE_API_URL=https://your-api-domain.com

# Backend (.env)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
AUTH0_ISSUER=https://your-domain.auth0.com/
```

### 2. Update Auth0 Dashboard

1. Add your production URLs to the allowed callback, logout, and web origins
2. Update your API settings if needed
3. Consider enabling additional security features like MFA

### 3. Security Considerations

1. Use HTTPS in production
2. Implement proper error handling
3. Consider rate limiting on your API
4. Regularly rotate your Auth0 application secrets
5. Monitor Auth0 logs for suspicious activity 