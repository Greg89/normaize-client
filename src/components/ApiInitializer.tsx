import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

interface ApiInitializerProps {
  children: React.ReactNode;
}

export const ApiInitializer = ({ children }: ApiInitializerProps) => {
  const { getToken, forceReAuth } = useAuth();

  useEffect(() => {
    apiService.setTokenGetter(getToken);
    apiService.setForceReAuth(forceReAuth);
  }, [getToken, forceReAuth]);

  return <>{children}</>;
}; 