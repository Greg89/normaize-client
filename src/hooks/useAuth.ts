import { useContext } from 'react';
import { AuthContext } from '../contexts/auth';

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthStateProvider');
  }
  return value;
};