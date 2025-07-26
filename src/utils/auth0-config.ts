export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
    scope: 'openid profile email offline_access'
  },
  cacheLocation: 'localstorage' as const,
  useRefreshTokens: true,
  // Add better token management
  skipRedirectCallback: false,
  // Set token expiration buffer (refresh 5 minutes before expiry)
  tokenExpirationBuffer: 300,
}; 