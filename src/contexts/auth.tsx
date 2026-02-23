import React from 'react';

export interface AuthUser {
  sub?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null | undefined;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  forceReAuth: () => Promise<void>;
  getToken: () => Promise<string | null>;
  error: Error | null | undefined;
}

export const AuthContext = React.createContext<AuthContextValue | null>(null);
