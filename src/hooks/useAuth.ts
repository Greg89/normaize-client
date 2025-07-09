import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

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
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [logout]);

  const getToken = useCallback(async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      // If it's a refresh token error, try to get a new token with prompt
      if (error instanceof Error && error.message && error.message.includes('Missing Refresh Token')) {
        try {
          return await getAccessTokenSilently({
            authorizationParams: {
              prompt: 'login'
            }
          });
        } catch (promptError) {
          // Silently handle token errors
        }
      }
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
    error
  };
}; 