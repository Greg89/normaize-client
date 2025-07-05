import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import React, { ReactNode } from 'react';
import { auth0Config } from '../utils/auth0-config';
import { setSentryUser, clearSentryUser } from '../utils/sentry';

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
        {children}
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