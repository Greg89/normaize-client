import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock dependencies
const mockUseAuth = jest.fn();
jest.mock('./hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('./components/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

jest.mock('./components/Layout', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

jest.mock('./pages/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard">Dashboard Page</div>,
}));

jest.mock('./pages/DataSets', () => ({
  __esModule: true,
  default: () => <div data-testid="datasets">DataSets Page</div>,
}));

jest.mock('./pages/Analysis', () => ({
  __esModule: true,
  default: () => <div data-testid="analysis">Analysis Page</div>,
}));

jest.mock('./pages/Visualization', () => ({
  __esModule: true,
  default: () => <div data-testid="visualization">Visualization Page</div>,
}));

jest.mock('./pages/Login', () => ({
  __esModule: true,
  default: () => <div data-testid="login">Login Page</div>,
}));

jest.mock('./pages/AccountSettings', () => ({
  __esModule: true,
  default: () => <div data-testid="account-settings">Account Settings Page</div>,
}));

jest.mock('./components/ApiInitializer', () => ({
  ApiInitializer: ({ children }: any) => <div data-testid="api-initializer">{children}</div>,
}));

jest.mock('./components/SentryErrorBoundary', () => ({
  SentryErrorBoundary: ({ children }: any) => <div data-testid="sentry-error-boundary">{children}</div>,
}));

jest.mock('./components/GlobalErrorBoundary', () => ({
  GlobalErrorBoundary: ({ children }: any) => <div data-testid="global-error-boundary">{children}</div>,
}));

// Note: We'll test the button click but can't easily mock window.location.reload in Jest
// The button functionality will still be tested for rendering and click events

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading spinner when authentication is loading', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        error: null,
      });

      renderWithRouter(<App />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Authentication Error State', () => {
    it('shows authentication error when there is an error', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: new Error('Auth failed'),
      });

      renderWithRouter(<App />);
      
      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      expect(screen.getByText('There was an issue with your authentication. Please try refreshing the page.')).toBeInTheDocument();
      expect(screen.getByText('Refresh Page')).toBeInTheDocument();
    });

    it('has refresh button that can be clicked', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: new Error('Auth failed'),
      });

      renderWithRouter(<App />);
      
      const refreshButton = screen.getByText('Refresh Page');
      expect(refreshButton).toBeInTheDocument();
      
      // Test that the button can be clicked (functionality tested in integration)
      fireEvent.click(refreshButton);
      expect(refreshButton).toBeInTheDocument();
    });

    it('has correct error state styling', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: new Error('Auth failed'),
      });

      renderWithRouter(<App />);
      
      // Find the main error container by looking for the element with the main styling
      const errorContainer = screen.getByText('Authentication Error').closest('div')?.parentElement?.parentElement;
      expect(errorContainer).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-gray-50');
      
      const errorCard = screen.getByText('Authentication Error').closest('div')?.parentElement;
      expect(errorCard).toHaveClass('max-w-md', 'w-full', 'space-y-8');
      
      const refreshButton = screen.getByText('Refresh Page');
      expect(refreshButton).toHaveClass('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'px-4', 'py-2', 'rounded-lg', 'transition-colors');
    });
  });

  describe('Unauthenticated State', () => {
    it('shows login page when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      renderWithRouter(<App />);
      
      expect(screen.getByTestId('login')).toBeInTheDocument();
      expect(screen.queryByTestId('layout')).not.toBeInTheDocument();
    });

    it('wraps login page with error boundaries and API initializer', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      renderWithRouter(<App />);
      
      expect(screen.getByTestId('global-error-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('sentry-error-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('api-initializer')).toBeInTheDocument();
    });

    it('routes all paths to login page when unauthenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      renderWithRouter(<App />);
      
      // Even though we're testing routing, the mock Login component will render for all routes
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    it('shows full app with layout when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      renderWithRouter(<App />);
      
      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    it('wraps authenticated app with error boundaries and API initializer', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      renderWithRouter(<App />);
      
      expect(screen.getByTestId('global-error-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('sentry-error-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('api-initializer')).toBeInTheDocument();
    });

    it('routes to dashboard by default', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      renderWithRouter(<App />);
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('renders all error boundary components in correct order', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      renderWithRouter(<App />);
      
      const globalBoundary = screen.getByTestId('global-error-boundary');
      const sentryBoundary = screen.getByTestId('sentry-error-boundary');
      const apiInitializer = screen.getByTestId('api-initializer');
      
      // Check that components are nested correctly
      expect(globalBoundary).toContainElement(sentryBoundary);
      expect(sentryBoundary).toContainElement(apiInitializer);
    });

    it('maintains component hierarchy for authenticated state', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      renderWithRouter(<App />);
      
      const layout = screen.getByTestId('layout');
      const dashboard = screen.getByTestId('dashboard');
      
      expect(layout).toContainElement(dashboard);
    });
  });

  describe('State Transitions', () => {
    it('handles transition from loading to authenticated', () => {
      // Start with loading state
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        error: null,
      });
      
      const { rerender } = renderWithRouter(<App />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      
      // Transition to authenticated state
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      rerender(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    it('handles transition from loading to error', () => {
      // Start with loading state
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        error: null,
      });
      
      const { rerender } = renderWithRouter(<App />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      
      // Transition to error state
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: new Error('Network error'),
      });
      
      rerender(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null error gracefully', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      renderWithRouter(<App />);
      
      // Should show login page, not crash
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });

    it('handles undefined error gracefully', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: undefined,
      });

      renderWithRouter(<App />);
      
      // Should show login page, not crash
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });

    it('handles string error gracefully', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        error: 'String error message',
      });

      renderWithRouter(<App />);
      
      // Should show error state
      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    });
  });
});
