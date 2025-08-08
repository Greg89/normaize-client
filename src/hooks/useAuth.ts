import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect } from 'react';
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
    logger.info('Forcing re-authentication due to 401 error');
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [logout]);

  const getToken = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        timeoutInSeconds: 10,
        detailedResponse: false
      });
      
      return token;
    } catch (error) {
      logger.error('Failed to get access token', { error });
      // Don't force logout on token retrieval errors
      // Let the component handle the error gracefully
      return null;
    }
  }, [getAccessTokenSilently]);

  // Log authentication errors only
  useEffect(() => {
    if (error) {
      logger.warn('Authentication error detected', {
        error: error?.message || error?.error_description || error
      });
    }
  }, [error]);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout: logoutUser,
    forceReAuth,
    getToken,
    error: error
  };
}; 