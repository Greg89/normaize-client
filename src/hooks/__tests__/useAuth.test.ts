import { renderHook, act } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../useAuth';
import { logger } from '../../utils/logger';

// Mock the Auth0 hook
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('useAuth', () => {
  let mockUseAuth0: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth0 = jest.fn().mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
      error: null,
    });

    (useAuth0 as jest.Mock).mockImplementation(mockUseAuth0);
  });

  describe('authentication state', () => {
    it('should return authentication state from Auth0', () => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { name: 'Test User' },
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: jest.fn(),
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toEqual({ name: 'Test User' });
    });

    it('should handle loading state', () => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: jest.fn(),
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
    });

    it('should handle unauthenticated state', () => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: jest.fn(),
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  describe('login functionality', () => {
    it('should call loginWithRedirect when login is called', async () => {
      const mockLoginWithRedirect = jest.fn().mockResolvedValue(undefined);
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: mockLoginWithRedirect,
        logout: jest.fn(),
        getAccessTokenSilently: jest.fn(),
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login();
      });

      expect(mockLoginWithRedirect).toHaveBeenCalledTimes(1);
    });

    it('should handle login errors gracefully', async () => {
      const mockLoginWithRedirect = jest.fn().mockRejectedValue(new Error('Login failed'));
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: mockLoginWithRedirect,
        logout: jest.fn(),
        getAccessTokenSilently: jest.fn(),
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await expect(act(async () => {
        await result.current.login();
      })).rejects.toThrow('Login failed');
    });
  });

  describe('token retrieval', () => {
    it('should return access token when getToken is called successfully', async () => {
      const mockToken = 'test-access-token';
      const mockGetAccessTokenSilently = jest.fn().mockResolvedValue(mockToken);
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: mockGetAccessTokenSilently,
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      const token = await act(async () => {
        return await result.current.getToken();
      });

      expect(token).toBe(mockToken);
      expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
        timeoutInSeconds: 10,
        detailedResponse: false,
      });
    });

    it('should return null when token retrieval fails', async () => {
      const mockError = new Error('Token retrieval failed');
      const mockGetAccessTokenSilently = jest.fn().mockRejectedValue(mockError);
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: mockGetAccessTokenSilently,
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      const token = await act(async () => {
        return await result.current.getToken();
      });

      expect(token).toBe(null);
      expect(logger.error).toHaveBeenCalledWith('Failed to get access token', { error: mockError });
    });

    it('should handle different types of token retrieval errors', async () => {
      const mockGetAccessTokenSilently = jest.fn().mockRejectedValue('String error');
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: mockGetAccessTokenSilently,
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      const token = await act(async () => {
        return await result.current.getToken();
      });

      expect(token).toBe(null);
      expect(logger.error).toHaveBeenCalledWith('Failed to get access token', { error: 'String error' });
    });
  });

  describe('error handling', () => {
    it('should log authentication errors when they occur', () => {
      const mockError = {
        error_description: 'Invalid credentials',
        message: 'Authentication failed',
      };
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: jest.fn(),
        error: mockError,
      });

      renderHook(() => useAuth());

      expect(logger.warn).toHaveBeenCalledWith('Authentication error detected', {
        error: 'Invalid credentials',
      });
    });

    it('should log error message when error_description is not available', () => {
      const mockError = {
        message: 'Authentication failed',
      };
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: jest.fn(),
        error: mockError,
      });

      renderHook(() => useAuth());

      expect(logger.warn).toHaveBeenCalledWith('Authentication error detected', {
        error: 'Authentication failed',
      });
    });

    it('should log string representation when neither error_description nor message is available', () => {
      const mockError = 'Unknown error';
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: jest.fn(),
        error: mockError,
      });

      renderHook(() => useAuth());

      expect(logger.warn).toHaveBeenCalledWith('Authentication error detected', {
        error: 'Unknown error',
      });
    });

    it('should not log when there is no error', () => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: jest.fn(),
        error: null,
      });

      renderHook(() => useAuth());

      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('hook return values', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('forceReAuth');
      expect(result.current).toHaveProperty('getToken');
      expect(result.current).toHaveProperty('error');
    });

    it('should return functions for authentication actions', () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.forceReAuth).toBe('function');
      expect(typeof result.current.getToken).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined Auth0 values gracefully', () => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: undefined,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: jest.fn(),
        error: undefined,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });

    it('should handle null Auth0 values gracefully', () => {
      mockUseAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        getAccessTokenSilently: jest.fn(),
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
