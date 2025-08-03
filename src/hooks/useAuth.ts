import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';
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
        timeoutInSeconds: 10
      });
      
      return token;
    } catch (error) {
      logger.error('Failed to get access token', { error });
      return null;
    }
  }, [getAccessTokenSilently]);

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