import React from 'react';
import { render, screen } from '@testing-library/react';
import { Auth0ProviderWrapper } from '../Auth0Provider';
import { setSentryUser, clearSentryUser } from '../../utils/sentry';
import { logger } from '../../utils/logger';
import { auth0Config } from '../../utils/auth0-config';

// Mock the utils
jest.mock('../../utils/sentry');
jest.mock('../../utils/logger');
jest.mock('../../utils/auth0-config');

// Mock the SessionPersistence component
jest.mock('../SessionPersistence', () => ({
  SessionPersistence: ({ children }: any) => <div data-testid="session-persistence">{children}</div>,
}));

// Mock Auth0Provider to avoid actual Auth0 initialization
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: any) => <div data-testid="auth0-provider">{children}</div>,
  useAuth0: () => ({
    user: { sub: 'user-123', name: 'Test User' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    getAccessTokenSilently: jest.fn(),
  }),
}));

describe('Auth0ProviderWrapper', () => {
  const mockLogger = logger as jest.Mocked<typeof logger>;
  const mockAuth0Config = auth0Config as jest.Mocked<typeof auth0Config>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth0 config
    mockAuth0Config.domain = 'test-domain.auth0.com';
    mockAuth0Config.clientId = 'test-client-id';
    mockAuth0Config.authorizationParams = { 
      redirect_uri: 'http://localhost:3000',
      audience: 'test-audience',
      scope: 'openid profile email'
    };
    mockAuth0Config.cacheLocation = 'localstorage';
    
    // Mock logger methods
    mockLogger.error = jest.fn();
    mockLogger.debug = jest.fn();
    
    // Mock Sentry methods
    (setSentryUser as jest.Mock).mockImplementation(() => {});
    (clearSentryUser as jest.Mock).mockImplementation(() => {});
    
    // Mock window.history.replaceState
    Object.defineProperty(window, 'history', {
      value: {
        replaceState: jest.fn(),
      },
      writable: true,
    });
    
    // Mock document.title
    Object.defineProperty(document, 'title', {
      value: 'Test App',
      writable: true,
    });
  });

  it('renders without crashing', () => {
    render(<Auth0ProviderWrapper>Test Content</Auth0ProviderWrapper>);
    expect(screen.getByTestId('auth0-provider')).toBeInTheDocument();
    expect(screen.getByTestId('session-persistence')).toBeInTheDocument();
  });

  it('logs error when Auth0 configuration is invalid', () => {
    mockAuth0Config.domain = '';
    mockAuth0Config.clientId = '';
    
    render(<Auth0ProviderWrapper>Test Content</Auth0ProviderWrapper>);
    
    expect(mockLogger.error).toHaveBeenCalledWith('Auth0Provider: Invalid configuration', {
      hasDomain: false,
      hasClientId: false,
    });
  });

  it('does not log error when Auth0 configuration is valid', () => {
    mockAuth0Config.domain = 'test-domain.auth0.com';
    mockAuth0Config.clientId = 'test-client-id';
    
    render(<Auth0ProviderWrapper>Test Content</Auth0ProviderWrapper>);
    
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  it('renders children correctly', () => {
    render(<Auth0ProviderWrapper>Test Content</Auth0ProviderWrapper>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct Auth0 configuration', () => {
    render(<Auth0ProviderWrapper>Test Content</Auth0ProviderWrapper>);
    
    // Verify the component renders with the mocked config
    expect(screen.getByTestId('auth0-provider')).toBeInTheDocument();
  });

  it('handles missing configuration gracefully', () => {
    mockAuth0Config.domain = '';
    mockAuth0Config.clientId = '';
    
    render(<Auth0ProviderWrapper>Test Content</Auth0ProviderWrapper>);
    
    // Should still render even with invalid config
    expect(screen.getByTestId('auth0-provider')).toBeInTheDocument();
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('renders with all required props', () => {
    render(<Auth0ProviderWrapper>Test Content</Auth0ProviderWrapper>);
    
    // Should render the main wrapper
    expect(screen.getByTestId('auth0-provider')).toBeInTheDocument();
    
    // Should render the session persistence component
    expect(screen.getByTestId('session-persistence')).toBeInTheDocument();
    
    // Should render children
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('maintains component hierarchy', () => {
    const { container } = render(<Auth0ProviderWrapper>Test Content</Auth0ProviderWrapper>);
    
    // Verify the component structure
    const auth0Provider = container.querySelector('[data-testid="auth0-provider"]') as HTMLElement;
    const sessionPersistence = container.querySelector('[data-testid="session-persistence"]') as HTMLElement;
    
    expect(auth0Provider).toBeInTheDocument();
    expect(sessionPersistence).toBeInTheDocument();
    expect(auth0Provider).toContainElement(sessionPersistence);
  });
});
