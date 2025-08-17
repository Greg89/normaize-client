import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../Login';

// Mock the useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the LoadingSpinner component
jest.mock('../../components/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('Login', () => {
  beforeEach(() => {
    mockUseAuth.mockClear();
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      mockUseAuth.mockReturnValue({
        isLoading: true,
        login: jest.fn(),
        error: null,
      });

      render(<Login />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when error exists', () => {
      const mockError = new Error('Authentication failed');
      mockUseAuth.mockReturnValue({
        isLoading: false,
        login: jest.fn(),
        error: mockError,
      });

      render(<Login />);
      
      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('shows error message for non-Error objects', () => {
      mockUseAuth.mockReturnValue({
        isLoading: false,
        login: jest.fn(),
        error: 'Something went wrong',
      });

      render(<Login />);
      
      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('calls login function when Try Again button is clicked', () => {
      const mockLogin = jest.fn();
      const mockError = new Error('Authentication failed');
      mockUseAuth.mockReturnValue({
        isLoading: false,
        login: mockLogin,
        error: mockError,
      });

      render(<Login />);
      
      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);
      
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('has correct error state styling', () => {
      const mockError = new Error('Authentication failed');
      mockUseAuth.mockReturnValue({
        isLoading: false,
        login: jest.fn(),
        error: mockError,
      });

      render(<Login />);
      
      const errorHeading = screen.getByText('Authentication Error');
      const errorMessage = screen.getByText('Authentication failed');
      const tryAgainButton = screen.getByText('Try Again');
      
      expect(errorHeading).toHaveClass('text-3xl', 'font-extrabold', 'text-gray-900');
      expect(errorMessage).toHaveClass('text-sm', 'text-red-600');
      expect(tryAgainButton).toHaveClass('bg-indigo-600', 'hover:bg-indigo-700');
    });
  });

  describe('Main Login Form', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoading: false,
        login: jest.fn(),
        error: null,
      });
    });

    it('renders the main login form when no error and not loading', () => {
      render(<Login />);
      
      expect(screen.getByText('Sign in with Auth0')).toBeInTheDocument();
      expect(screen.getByText('Your intelligent data analysis platform')).toBeInTheDocument();
    });

    it('displays the logo correctly', () => {
      render(<Login />);
      
      const logo = screen.getByAltText('NormAIze Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/logo.svg');
    });

    it('calls login function when Sign in button is clicked', () => {
      const mockLogin = jest.fn();
      mockUseAuth.mockReturnValue({
        isLoading: false,
        login: mockLogin,
        error: null,
      });

      render(<Login />);
      
      const signInButton = screen.getByText('Sign in with Auth0');
      fireEvent.click(signInButton);
      
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('has correct button styling', () => {
      render(<Login />);
      
      const signInButton = screen.getByText('Sign in with Auth0');
      expect(signInButton).toHaveClass(
        'bg-indigo-600',
        'hover:bg-indigo-700',
        'text-white',
        'rounded-md',
        'transition-colors',
        'duration-200'
      );
    });

    it('displays the lock icon in the sign in button', () => {
      render(<Login />);
      
      const signInButton = screen.getByText('Sign in with Auth0');
      const lockIcon = signInButton.querySelector('svg');
      expect(lockIcon).toBeInTheDocument();
      expect(lockIcon).toHaveClass('h-5', 'w-5', 'text-indigo-500');
    });
  });

  describe('Recent Improvements Section', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoading: false,
        login: jest.fn(),
        error: null,
      });
    });

    it('displays the Recent Improvements heading', () => {
      render(<Login />);
      
      expect(screen.getByText('Recent Improvements')).toBeInTheDocument();
      expect(screen.getByText('Recent Improvements')).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
    });

    it('displays all three improvement cards', () => {
      render(<Login />);
      
      // Check improvement titles
      expect(screen.getByText('Enhanced Data Processing')).toBeInTheDocument();
      expect(screen.getByText('New Visualization Features')).toBeInTheDocument();
      expect(screen.getByText('Enhanced Security')).toBeInTheDocument();
      
      // Check improvement descriptions
      expect(screen.getByText('Improved data normalization algorithms for better accuracy and faster processing times.')).toBeInTheDocument();
      expect(screen.getByText('Added advanced charting capabilities and interactive data exploration tools.')).toBeInTheDocument();
      expect(screen.getByText('Improved authentication and data protection measures for better security.')).toBeInTheDocument();
    });

    it('displays improvement cards with correct styling and icons', () => {
      render(<Login />);
      
      // Check that each improvement card has the correct structure
      const improvementCards = screen.getAllByText(/Enhanced Data Processing|New Visualization Features|Enhanced Security/);
      expect(improvementCards).toHaveLength(3);
      
      // Check that each card has the correct background colors
      const dataProcessingCard = screen.getByText('Enhanced Data Processing').closest('.bg-blue-50');
      const visualizationCard = screen.getByText('New Visualization Features').closest('.bg-green-50');
      const securityCard = screen.getByText('Enhanced Security').closest('.bg-purple-50');
      
      expect(dataProcessingCard).toBeInTheDocument();
      expect(visualizationCard).toBeInTheDocument();
      expect(securityCard).toBeInTheDocument();
    });

    it('displays improvement cards with correct icon colors', () => {
      render(<Login />);
      
      // Check that the icon containers have the correct background colors
      const blueIconContainer = screen.getByText('Enhanced Data Processing').closest('.bg-blue-50')?.querySelector('.bg-blue-500');
      const greenIconContainer = screen.getByText('New Visualization Features').closest('.bg-green-50')?.querySelector('.bg-green-500');
      const purpleIconContainer = screen.getByText('Enhanced Security').closest('.bg-purple-50')?.querySelector('.bg-purple-500');
      
      expect(blueIconContainer).toBeInTheDocument();
      expect(greenIconContainer).toBeInTheDocument();
      expect(purpleIconContainer).toBeInTheDocument();
    });
  });

  describe('Layout and Responsiveness', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoading: false,
        login: jest.fn(),
        error: null,
      });
    });

    it('has correct main container styling', () => {
      const { container } = render(<Login />);
      
      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-blue-50', 'to-indigo-100');
    });

    it('has correct flex layout structure', () => {
      const { container } = render(<Login />);
      
      const flexContainer = container.querySelector('.flex.min-h-screen');
      expect(flexContainer).toBeInTheDocument();
    });

    it('has correct left side (login form) styling', () => {
      const { container } = render(<Login />);
      
      const leftSide = container.querySelector('.flex-1.flex.items-center.justify-center');
      expect(leftSide).toBeInTheDocument();
    });

    it('has correct right side (improvements) styling', () => {
      const { container } = render(<Login />);
      
      const rightSide = container.querySelector('.hidden.lg\\:flex.lg\\:flex-1.lg\\:items-center.lg\\:justify-center.bg-white');
      expect(rightSide).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('handles state changes correctly', () => {
      const mockLogin = jest.fn();
      
      // Start with loading state
      mockUseAuth.mockReturnValue({
        isLoading: true,
        login: mockLogin,
        error: null,
      });

      const { rerender } = render(<Login />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      
      // Change to error state
      mockUseAuth.mockReturnValue({
        isLoading: false,
        login: mockLogin,
        error: new Error('Test error'),
      });

      rerender(<Login />);
      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      
      // Change to normal state
      mockUseAuth.mockReturnValue({
        isLoading: false,
        login: mockLogin,
        error: null,
      });

      rerender(<Login />);
      expect(screen.getByText('Sign in with Auth0')).toBeInTheDocument();
    });
  });
});
