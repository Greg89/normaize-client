import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '../utils/logger';

interface Auth0Error extends Error {
  error_description?: string;
}

export const useAuth = () => {
  const disableAuth = import.meta.env['VITE_DISABLE_AUTH'] === 'true';

  // Local dev auth mode (no Auth0). This intentionally does not provide tokens,
  // so API calls to protected endpoints will still return 401.
  const [localAuthenticated, setLocalAuthenticated] = useState<boolean>(() => {
    if (!disableAuth) return false;
    try {
      return window.localStorage.getItem('normaize_disable_auth_authenticated') === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!disableAuth) return;
    try {
      window.localStorage.setItem(
        'normaize_disable_auth_authenticated',
        localAuthenticated ? 'true' : 'false'
      );
    } catch {
      // ignore storage failures
    }
  }, [disableAuth, localAuthenticated]);

  const localUser = useMemo(() => {
    if (!disableAuth) return undefined;
    return {
      name: 'Local Dev',
      email: 'local@dev',
    } as unknown;
  }, [disableAuth]);

  const localLogin = useCallback(async () => {
    setLocalAuthenticated(true);
  }, []);

  const localLogout = useCallback(async () => {
    setLocalAuthenticated(false);
  }, []);

  const localForceReAuth = useCallback(async () => {
    setLocalAuthenticated(false);
  }, []);

  const localGetToken = useCallback(async () => {
    return null;
  }, []);

  if (disableAuth) {
    return {
      isAuthenticated: localAuthenticated,
      isLoading: false,
      user: localUser,
      login: localLogin,
      logout: localLogout,
      forceReAuth: localForceReAuth,
      getToken: localGetToken,
      error: undefined,
    };
  }

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
      const e = error as Auth0Error;
      logger.warn('Authentication error detected', {
        error: e.error_description || e.message || String(e)
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