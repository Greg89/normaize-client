import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';
import { auth0Config } from '../utils/auth0-config';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

export const Auth0ProviderWrapper = ({ children }: Auth0ProviderWrapperProps) => {
  const onRedirectCallback = (appState: any) => {
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
      {children}
    </Auth0Provider>
  );
}; 