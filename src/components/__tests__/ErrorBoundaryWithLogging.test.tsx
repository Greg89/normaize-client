import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundaryWithLogging } from '../ErrorBoundaryWithLogging';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('../../hooks/useAuth');
jest.mock('../../utils/logger');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundaryWithLogging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { sub: 'test-user-id' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      forceReAuth: jest.fn(),
      getToken: jest.fn(),
      error: undefined,
    });
    
    // Mock logger methods
    mockLogger.error = jest.fn();
    mockLogger.setUserId = jest.fn();
    
    // Mock console.error to suppress React error boundary warnings in tests
    jest.spyOn(console, 'error').mockImplementation(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundaryWithLogging>
        <div>Test content</div>
      </ErrorBoundaryWithLogging>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws an error', () => {
    render(
      <ErrorBoundaryWithLogging>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryWithLogging>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText("We've been notified and are working to fix this issue.")).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundaryWithLogging fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryWithLogging>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('logs error with full context when error occurs', () => {
    render(
      <ErrorBoundaryWithLogging>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryWithLogging>
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      'React Error Boundary caught an error',
      expect.objectContaining({
        errorName: 'Error',
        errorMessage: 'Test error',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: expect.any(String),
      }),
      expect.any(Error)
    );
  });

  it('sets user ID in logger when user is available', () => {
    render(
      <ErrorBoundaryWithLogging>
        <div>Test content</div>
      </ErrorBoundaryWithLogging>
    );

    expect(mockLogger.setUserId).toHaveBeenCalledWith('test-user-id');
  });

  it('does not set user ID when user is not available', () => {
    mockUseAuth.mockReturnValue({
      user: undefined,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      forceReAuth: jest.fn(),
      getToken: jest.fn(),
      error: undefined,
    });

    render(
      <ErrorBoundaryWithLogging>
        <div>Test content</div>
      </ErrorBoundaryWithLogging>
    );

    expect(mockLogger.setUserId).not.toHaveBeenCalled();
  });

  it('updates user ID when user changes', () => {
    const { rerender } = render(
      <ErrorBoundaryWithLogging>
        <div>Test content</div>
      </ErrorBoundaryWithLogging>
    );

    expect(mockLogger.setUserId).toHaveBeenCalledWith('test-user-id');

    // Change user
    mockUseAuth.mockReturnValue({
      user: { sub: 'new-user-id' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      forceReAuth: jest.fn(),
      getToken: jest.fn(),
      error: undefined,
    });

    rerender(
      <ErrorBoundaryWithLogging>
        <div>Test content</div>
      </ErrorBoundaryWithLogging>
    );

    expect(mockLogger.setUserId).toHaveBeenCalledWith('new-user-id');
  });

  it('handles multiple errors gracefully', () => {
    const { rerender } = render(
      <ErrorBoundaryWithLogging>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryWithLogging>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Try to render without error
    rerender(
      <ErrorBoundaryWithLogging>
        <div>New content</div>
      </ErrorBoundaryWithLogging>
    );

    // Should still show error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('New content')).not.toBeInTheDocument();
  });

  it('maintains error state across re-renders', () => {
    const { rerender } = render(
      <ErrorBoundaryWithLogging>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryWithLogging>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Re-render with same props
    rerender(
      <ErrorBoundaryWithLogging>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryWithLogging>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has reload button that can be clicked', () => {
    render(
      <ErrorBoundaryWithLogging>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryWithLogging>
    );

    const reloadButton = screen.getByText('Reload Page');
    expect(reloadButton).toBeInTheDocument();
    
    // Verify the button is clickable (we can't easily test the actual reload)
    fireEvent.click(reloadButton);
    expect(reloadButton).toBeInTheDocument(); // Button should still be there after click
  });
});
