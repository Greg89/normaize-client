import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SentryErrorBoundary } from '../SentryErrorBoundary';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';
import { Sentry } from '../../utils/sentry';

// Mock dependencies
jest.mock('../../hooks/useAuth');
jest.mock('../../utils/logger');
jest.mock('../../utils/sentry');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockSentry = Sentry as jest.Mocked<typeof Sentry>;

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('SentryErrorBoundary', () => {
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
    
    // Mock Sentry methods
    mockSentry.showReportDialog = jest.fn();
    
    // Mock console.error to suppress React error boundary warnings in tests
    jest.spyOn(console, 'error').mockImplementation(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <SentryErrorBoundary>
        <div>Test content</div>
      </SentryErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws an error', () => {
    render(
      <SentryErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SentryErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText("We've been notified and are working to fix this issue.")).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
    expect(screen.getByText('Report Feedback')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <SentryErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </SentryErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('calls Sentry.showReportDialog when report feedback button is clicked', () => {
    render(
      <SentryErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SentryErrorBoundary>
    );

    const reportButton = screen.getByText('Report Feedback');
    fireEvent.click(reportButton);

    expect(mockSentry.showReportDialog).toHaveBeenCalled();
  });

  it('logs error with full context when error occurs', () => {
    render(
      <SentryErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SentryErrorBoundary>
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      'React Error Boundary caught an error',
      expect.objectContaining({
        componentStack: expect.any(String),
        errorName: 'Error',
        errorMessage: 'Test error',
        errorStack: expect.any(String),
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: expect.any(String),
      }),
      expect.any(Error)
    );
  });

  it('handles multiple errors gracefully', () => {
    const { rerender } = render(
      <SentryErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SentryErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Try to render without error
    rerender(
      <SentryErrorBoundary>
        <div>New content</div>
      </SentryErrorBoundary>
    );

    // Should still show error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('New content')).not.toBeInTheDocument();
  });

  it('maintains error state across re-renders', () => {
    const { rerender } = render(
      <SentryErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SentryErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Re-render with same props
    rerender(
      <SentryErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SentryErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('handles user context changes', () => {
    const { rerender } = render(
      <SentryErrorBoundary>
        <div>Test content</div>
      </SentryErrorBoundary>
    );

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
      <SentryErrorBoundary>
        <div>Test content</div>
      </SentryErrorBoundary>
    );

    // Component should still render normally
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('handles user without sub property', () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      forceReAuth: jest.fn(),
      getToken: jest.fn(),
      error: undefined,
    });

    render(
      <SentryErrorBoundary>
        <div>Test content</div>
      </SentryErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('handles null user', () => {
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
      <SentryErrorBoundary>
        <div>Test content</div>
      </SentryErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('provides both reload and report feedback options in error state', () => {
    render(
      <SentryErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SentryErrorBoundary>
    );

    const reloadButton = screen.getByText('Reload Page');
    const reportButton = screen.getByText('Report Feedback');

    expect(reloadButton).toBeInTheDocument();
    expect(reportButton).toBeInTheDocument();
    
    // Check button styling differences
    expect(reloadButton).toHaveClass('bg-indigo-600');
    expect(reportButton).toHaveClass('bg-white');
  });

  it('has reload button that can be clicked', () => {
    render(
      <SentryErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SentryErrorBoundary>
    );

    const reloadButton = screen.getByText('Reload Page');
    expect(reloadButton).toBeInTheDocument();
    
    // Verify the button is clickable (we can't easily test the actual reload)
    fireEvent.click(reloadButton);
    expect(reloadButton).toBeInTheDocument(); // Button should still be there after click
  });
});
