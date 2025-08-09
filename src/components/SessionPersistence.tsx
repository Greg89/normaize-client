import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useRef } from 'react';
import { logger } from '../utils/logger';

interface SessionPersistenceProps {
  children: React.ReactNode;
}

export const SessionPersistence: React.FC<SessionPersistenceProps> = ({ children }) => {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const hasAttemptedTokenRefresh = useRef(false);

  useEffect(() => {
    // Only attempt token refresh once when the component mounts
    if (!hasAttemptedTokenRefresh.current && !isLoading) {
      hasAttemptedTokenRefresh.current = true;
      
      // If we're not authenticated but not loading, try to get a token silently
      if (!isAuthenticated) {
        const attemptSilentAuth = async () => {
          try {
            await getAccessTokenSilently({
              timeoutInSeconds: 10,
              detailedResponse: false
            });
          } catch (error) {
            // This is expected if the user doesn't have a valid session
            logger.debug('Silent authentication failed on page load', { error });
          }
        };
        
        attemptSilentAuth();
      }
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  // Reset the flag when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      hasAttemptedTokenRefresh.current = false;
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}; 