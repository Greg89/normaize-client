import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import React, { ReactNode, useEffect } from 'react';
import { auth0Config } from '../utils/auth0-config';
import { setSentryUser, clearSentryUser } from '../utils/sentry';
import { logger } from '../utils/logger';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

interface AppState {
  returnTo?: string;
}

export const Auth0ProviderWrapper = ({ children }: Auth0ProviderWrapperProps) => {
  const onRedirectCallback = (appState?: AppState) => {
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || window.location.pathname
    );
  };

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
      onRedirectCallback={onRedirectCallback}
      cacheLocation={auth0Config.cacheLocation}
      useRefreshTokens={auth0Config.useRefreshTokens}
    >
      <SentryUserManager>
        <TokenValidator>
          {children}
        </TokenValidator>
      </SentryUserManager>
    </Auth0Provider>
  );
};

// Component to manage Sentry user context
const SentryUserManager: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      setSentryUser(user);
    } else {
      clearSentryUser();
    }
  }, [isAuthenticated, user]);

  return <>{children}</>;
};

// Component to validate tokens and handle expiration
const TokenValidator: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, error, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Validate token on mount and set up periodic validation
      validateToken();
      
      // Set up periodic token validation (every 5 minutes)
      const interval = setInterval(validateToken, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isLoading]);

  const validateToken = async () => {
    try {
      await getAccessTokenSilently({ 
        detailedResponse: true,
        timeoutInSeconds: 10 
      });
      logger.debug('Token validation successful');
    } catch (error) {
      logger.error('Token validation failed during periodic check', { error });
      // The useAuth hook will handle the re-authentication
    }
  };

  // Show error message if there's an authentication error
  if (error) {
    logger.error('Auth0 error detected', { error });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-4">
              There was an issue with your authentication. Please try refreshing the page or logging in again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 