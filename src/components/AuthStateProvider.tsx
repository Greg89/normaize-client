import { useAuth0 } from '@auth0/auth0-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext, type AuthContextValue, type AuthUser } from '../contexts/auth';
import { logger } from '../utils/logger';

interface Auth0Error extends Error {
  error_description?: string;
}

interface AuthStateProviderProps {
  children: React.ReactNode;
  disableAuth: boolean;
}

const LocalAuthStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localAuthenticated, setLocalAuthenticated] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('normaize_disable_auth_authenticated') === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'normaize_disable_auth_authenticated',
        localAuthenticated ? 'true' : 'false'
      );
    } catch {
      // ignore storage failures
    }
  }, [localAuthenticated]);

  const localUser = useMemo(() => {
    return {
      name: 'Local Dev',
      email: 'local@dev',
    } satisfies AuthUser;
  }, []);

  const login = useCallback(async () => {
    setLocalAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    setLocalAuthenticated(false);
  }, []);

  const forceReAuth = useCallback(async () => {
    setLocalAuthenticated(false);
  }, []);

  const getToken = useCallback(async () => {
    return null;
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      isAuthenticated: localAuthenticated,
      isLoading: false,
      user: localUser,
      login,
      logout,
      forceReAuth,
      getToken,
      error: undefined,
    }),
    [forceReAuth, getToken, localAuthenticated, localUser, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const Auth0AuthStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    error,
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
        detailedResponse: false,
      });

      return token;
    } catch (error) {
      logger.error('Failed to get access token', { error });
      return null;
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (error) {
      const e = error as Auth0Error;
      logger.warn('Authentication error detected', {
        error: e.error_description || e.message || String(e),
      });
    }
  }, [error]);

  const value: AuthContextValue = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user: user as AuthUser | null | undefined,
      login,
      logout: logoutUser,
      forceReAuth,
      getToken,
      error,
    }),
    [error, forceReAuth, getToken, isAuthenticated, isLoading, login, logoutUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthStateProvider: React.FC<AuthStateProviderProps> = ({
  children,
  disableAuth,
}) => {
  return disableAuth ? (
    <LocalAuthStateProvider>{children}</LocalAuthStateProvider>
  ) : (
    <Auth0AuthStateProvider>{children}</Auth0AuthStateProvider>
  );
};
