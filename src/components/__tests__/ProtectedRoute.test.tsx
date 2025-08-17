import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';

// Mock the logger module to avoid import.meta.env issues
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock the useAuth hook
jest.mock('../../hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock LoadingSpinner component
jest.mock('../LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

describe('ProtectedRoute', () => {
  const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user is authenticated and not loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
      login: jest.fn(),
      logout: jest.fn(),
      forceReAuth: jest.fn(),
      getToken: jest.fn(),
      error: undefined,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('renders loading spinner when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: undefined,
      login: jest.fn(),
      logout: jest.fn(),
      forceReAuth: jest.fn(),
      getToken: jest.fn(),
      error: undefined,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders loading spinner when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      login: jest.fn(),
      logout: jest.fn(),
      forceReAuth: jest.fn(),
      getToken: jest.fn(),
      error: undefined,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders multiple children correctly when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
      login: jest.fn(),
      logout: jest.fn(),
      forceReAuth: jest.fn(),
      getToken: jest.fn(),
      error: undefined,
    });

    render(
      <ProtectedRoute>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
});
