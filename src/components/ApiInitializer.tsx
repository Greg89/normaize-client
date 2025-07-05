import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

interface ApiInitializerProps {
  children: React.ReactNode;
}

export const ApiInitializer = ({ children }: ApiInitializerProps) => {
  const { getToken } = useAuth();

  useEffect(() => {
    apiService.setTokenGetter(getToken);
  }, [getToken]);

  return <>{children}</>;
}; 