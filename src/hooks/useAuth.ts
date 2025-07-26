import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useState } from 'react';
import { logger } from '../utils/logger';

export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    error
  } = useAuth0();

  const [tokenValidationError, setTokenValidationError] = useState<string | null>(null);

  const login = useCallback(async () => {
    await loginWithRedirect();
  }, [loginWithRedirect]);

  const logoutUser = useCallback(async () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [logout]);

  const forceReAuth = useCallback(async () => {
    logger.info('Forcing re-authentication due to token issues');
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [logout]);

  const validateToken = useCallback(async () => {
    try {
      // Try to get a fresh token - this will trigger refresh if needed
      await getAccessTokenSilently({ 
        detailedResponse: true,
        timeoutInSeconds: 10 
      });
      setTokenValidationError(null);
    } catch (error) {
      logger.error('Token validation failed', { error });
      setTokenValidationError(error instanceof Error ? error.message : 'Token validation failed');
      
      // If it's a refresh token error, we need to re-authenticate
      if (error instanceof Error && 
          (error.message.includes('Missing Refresh Token') || 
           error.message.includes('refresh_token') ||
           error.message.includes('invalid_grant'))) {
        logger.info('Refresh token expired, forcing re-authentication');
        await forceReAuth();
      }
    }
  }, [getAccessTokenSilently, forceReAuth]);

  const getToken = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        detailedResponse: true,
        timeoutInSeconds: 10
      });
      
      // Handle both string and object responses
      if (typeof token === 'string') {
        return token;
      }
      
      // If it's an object with access_token property
      if (token && typeof token === 'object' && 'access_token' in token) {
        const tokenResponse = token as { access_token: string };
        return tokenResponse.access_token;
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to get access token', { error });
      
      // If it's a refresh token error, try to get a new token with prompt
      if (error instanceof Error && 
          (error.message.includes('Missing Refresh Token') || 
           error.message.includes('refresh_token') ||
           error.message.includes('invalid_grant'))) {
        try {
          logger.info('Attempting to get new token with login prompt');
          const newToken = await getAccessTokenSilently({
            authorizationParams: {
              prompt: 'login'
            },
            timeoutInSeconds: 10
          });
          
          if (typeof newToken === 'object' && 'access_token' in newToken) {
            return newToken.access_token;
          }
          
          return newToken as string;
        } catch (promptError) {
          logger.error('Failed to get token with login prompt', { promptError });
          // Force re-authentication as a last resort
          await forceReAuth();
        }
      }
      return null;
    }
  }, [getAccessTokenSilently, forceReAuth]);

  // Validate token on mount and when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      validateToken();
    }
  }, [isAuthenticated, isLoading, validateToken]);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout: logoutUser,
    forceReAuth,
    getToken,
    error: error || tokenValidationError
  };
}; 