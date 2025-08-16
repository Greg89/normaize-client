import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SessionPersistence } from '../SessionPersistence';
import { useAuth0 } from '@auth0/auth0-react';

// Define proper types for Auth0 mock
interface MockAuth0Return {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: { sub: string; name: string; email: string };
  error?: Error;
  loginWithRedirect?: jest.Mock;
  logout?: jest.Mock;
  getAccessTokenSilently: jest.Mock;
  getAccessTokenWithPopup?: jest.Mock;
  getIdTokenClaims?: jest.Mock;
  handleRedirectCallback?: jest.Mock;
  checkSession?: jest.Mock;
  buildAuthorizeUrl?: jest.Mock;
  buildLogoutUrl?: jest.Mock;
  loginWithPopup?: jest.Mock;
}

// Mock the useAuth0 hook
jest.mock('@auth0/auth0-react');
const mockUseAuth0 = useAuth0 as jest.MockedFunction<typeof useAuth0>;

// Mock the logger module to avoid import.meta.env issues
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('SessionPersistence', () => {
  const TestComponent = () => <div data-testid="test-content">Test Content</div>;
  const mockGetAccessTokenSilently = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      error: undefined,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: mockGetAccessTokenSilently,
      getAccessTokenWithPopup: jest.fn(),
      getIdTokenClaims: jest.fn(),
      handleRedirectCallback: jest.fn(),
      checkSession: jest.fn(),
      buildAuthorizeUrl: jest.fn(),
      buildLogoutUrl: jest.fn(),
      loginWithPopup: jest.fn(),
    } as MockAuth0Return);
  });

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <SessionPersistence>
        <TestComponent />
      </SessionPersistence>
    );

    expect(getByTestId('test-content')).toBeInTheDocument();
  });

  it('renders multiple children correctly', () => {
    const { getByTestId } = render(
      <SessionPersistence>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <TestComponent />
      </SessionPersistence>
    );

    expect(getByTestId('child-1')).toBeInTheDocument();
    expect(getByTestId('child-2')).toBeInTheDocument();
    expect(getByTestId('test-content')).toBeInTheDocument();
  });

  it('attempts silent authentication when not authenticated and not loading', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      getAccessTokenSilently: mockGetAccessTokenSilently,
    } as MockAuth0Return);

    render(
      <SessionPersistence>
        <TestComponent />
      </SessionPersistence>
    );

    await waitFor(() => {
      expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
        timeoutInSeconds: 10,
        detailedResponse: false,
      });
    });
  });

  it('does not attempt silent authentication when loading', () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      getAccessTokenSilently: mockGetAccessTokenSilently,
    } as MockAuth0Return);

    render(
      <SessionPersistence>
        <TestComponent />
      </SessionPersistence>
    );

    expect(mockGetAccessTokenSilently).not.toHaveBeenCalled();
  });

  it('does not attempt silent authentication when already authenticated', () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      getAccessTokenSilently: mockGetAccessTokenSilently,
    } as MockAuth0Return);

    render(
      <SessionPersistence>
        <TestComponent />
      </SessionPersistence>
    );

    expect(mockGetAccessTokenSilently).not.toHaveBeenCalled();
  });

  it('only attempts token refresh once when component mounts', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      getAccessTokenSilently: mockGetAccessTokenSilently,
    } as MockAuth0Return);

    const { rerender } = render(
      <SessionPersistence>
        <TestComponent />
      </SessionPersistence>
    );

    await waitFor(() => {
      expect(mockGetAccessTokenSilently).toHaveBeenCalledTimes(1);
    });

    // Re-render the component
    rerender(
      <SessionPersistence>
        <TestComponent />
      </SessionPersistence>
    );

    // Should still only be called once
    expect(mockGetAccessTokenSilently).toHaveBeenCalledTimes(1);
  });

  it('resets the refresh flag when authentication state changes to authenticated', async () => {
    // Start with not authenticated
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      getAccessTokenSilently: mockGetAccessTokenSilently,
    } as MockAuth0Return);

    const { rerender } = render(
      <SessionPersistence>
        <TestComponent />
      </SessionPersistence>
    );

    await waitFor(() => {
      expect(mockGetAccessTokenSilently).toHaveBeenCalledTimes(1);
    });

    // Change to authenticated
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      getAccessTokenSilently: mockGetAccessTokenSilently,
    } as MockAuth0Return);

    rerender(
      <SessionPersistence>
        <TestComponent />
      </SessionPersistence>
    );

    // Clear the mock to check if it gets called again
    mockGetAccessTokenSilently.mockClear();

    // Change back to not authenticated
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      getAccessTokenSilently: mockGetAccessTokenSilently,
    } as MockAuth0Return);

    rerender(
      <SessionPersistence>
        <TestComponent />
      </SessionPersistence>
    );

    // Should attempt authentication again since the flag was reset
    await waitFor(() => {
      expect(mockGetAccessTokenSilently).toHaveBeenCalledTimes(1);
    });
  });

  it('handles silent authentication errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
    
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      getAccessTokenSilently: jest.fn().mockRejectedValue(new Error('Auth failed')),
    } as MockAuth0Return);

    render(
      <SessionPersistence>
        <TestComponent />
      </SessionPersistence>
    );

    // Should not throw an error
    await waitFor(() => {
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('does not attempt authentication when component unmounts during loading', () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      getAccessTokenSilently: mockGetAccessTokenSilently,
    } as MockAuth0Return);

    const { unmount } = render(
      <SessionPersistence>
        <TestComponent />
      </SessionPersistence>
    );

    unmount();

    expect(mockGetAccessTokenSilently).not.toHaveBeenCalled();
  });
});
