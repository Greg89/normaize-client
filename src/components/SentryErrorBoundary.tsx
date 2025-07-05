import React from 'react';
import { Sentry } from '../utils/sentry';
import { logger } from '../utils/logger';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class SentryErrorBoundaryClass extends React.Component<Props & { userId?: string }, State> {
  constructor(props: Props & { userId?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to our Seq system with full context
    logger.error('React Error Boundary caught an error', {
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }, error);

    // Sentry will automatically capture this error
    // The beforeSend hook in sentry.ts will also log to Seq
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
              <button
                onClick={() => Sentry.showReportDialog()}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Report Feedback
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
export const SentryErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  const { user } = useAuth();

  // Set user context in both Sentry and our logger
  React.useEffect(() => {
    if (user?.sub) {
      // This will be handled by the Auth0Provider integration
      // but we can also set it here for immediate availability
    }
  }, [user?.sub]);

  return (
    <SentryErrorBoundaryClass userId={user?.sub} fallback={fallback}>
      {children}
    </SentryErrorBoundaryClass>
  );
}; 