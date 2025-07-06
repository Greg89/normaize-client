import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryClass extends Component<Props & { userId?: string }, State> {
  constructor(props: Props & { userId?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with full context
    logger.error(
      'React Error Boundary caught an error',
      {
        componentStack: errorInfo.componentStack,
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      error
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                We&apos;ve been notified and are working to fix this issue.
              </p>
            </div>
            <div className="mt-8 space-y-6">
              <button
                onClick={() => window.location.reload()}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to inject user context
export const ErrorBoundaryWithLogging: React.FC<Props> = ({ children, fallback }) => {
  const { user } = useAuth();

  // Set user ID in logger when user is available
  React.useEffect(() => {
    if (user?.sub) {
      logger.setUserId(user.sub);
    }
  }, [user?.sub]);

  return (
    <ErrorBoundaryClass userId={user?.sub} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}; 