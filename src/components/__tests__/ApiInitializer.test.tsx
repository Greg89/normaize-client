import React from 'react';
import { render } from '@testing-library/react';
import { ApiInitializer } from '../ApiInitializer';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the apiService
jest.mock('../../services/api', () => ({
  apiService: {
    setTokenGetter: jest.fn(),
    setForceReAuth: jest.fn(),
  },
}));

// Mock the logger module to avoid import.meta.env issues
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('ApiInitializer', () => {
  const TestComponent = () => <div data-testid="test-content">Test Content</div>;
  const mockGetToken = jest.fn();
  const mockForceReAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
      login: jest.fn(),
      logout: jest.fn(),
      forceReAuth: mockForceReAuth,
      getToken: mockGetToken,
      error: undefined,
    });
  });

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <ApiInitializer>
        <TestComponent />
      </ApiInitializer>
    );

    expect(getByTestId('test-content')).toBeInTheDocument();
  });

  it('initializes apiService with getToken function', () => {
    render(
      <ApiInitializer>
        <TestComponent />
      </ApiInitializer>
    );

    expect(apiService.setTokenGetter).toHaveBeenCalledWith(mockGetToken);
  });

  it('initializes apiService with forceReAuth function', () => {
    render(
      <ApiInitializer>
        <TestComponent />
      </ApiInitializer>
    );

    expect(apiService.setForceReAuth).toHaveBeenCalledWith(mockForceReAuth);
  });

  it('calls both apiService methods when component mounts', () => {
    render(
      <ApiInitializer>
        <TestComponent />
      </ApiInitializer>
    );

    expect(apiService.setTokenGetter).toHaveBeenCalledTimes(1);
    expect(apiService.setForceReAuth).toHaveBeenCalledTimes(1);
  });

  it('renders multiple children correctly', () => {
    const { getByTestId } = render(
      <ApiInitializer>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <TestComponent />
      </ApiInitializer>
    );

    expect(getByTestId('child-1')).toBeInTheDocument();
    expect(getByTestId('child-2')).toBeInTheDocument();
    expect(getByTestId('test-content')).toBeInTheDocument();
  });

  it('re-initializes when getToken function changes', () => {
    const { rerender } = render(
      <ApiInitializer>
        <TestComponent />
      </ApiInitializer>
    );

    // Clear the initial calls
    jest.clearAllMocks();

    // Create a new getToken function
    const newGetToken = jest.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
      login: jest.fn(),
      logout: jest.fn(),
      forceReAuth: mockForceReAuth,
      getToken: newGetToken,
      error: undefined,
    });

    // Re-render with new function
    rerender(
      <ApiInitializer>
        <TestComponent />
      </ApiInitializer>
    );

    expect(apiService.setTokenGetter).toHaveBeenCalledWith(newGetToken);
  });

  it('re-initializes when forceReAuth function changes', () => {
    const { rerender } = render(
      <ApiInitializer>
        <TestComponent />
      </ApiInitializer>
    );

    // Clear the initial calls
    jest.clearAllMocks();

    // Create a new forceReAuth function
    const newForceReAuth = jest.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
      login: jest.fn(),
      logout: jest.fn(),
      forceReAuth: newForceReAuth,
      getToken: mockGetToken,
      error: undefined,
    });

    // Re-render with new function
    rerender(
      <ApiInitializer>
        <TestComponent />
      </ApiInitializer>
    );

    expect(apiService.setForceReAuth).toHaveBeenCalledWith(newForceReAuth);
  });
});
