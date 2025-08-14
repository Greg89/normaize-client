import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('../../hooks/useAuth');
jest.mock('../../utils/logger');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Wrapper component to provide router context
const LayoutWithRouter = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <Layout>{children}</Layout>
  </BrowserRouter>
);

describe('Layout', () => {
  const mockNavigate = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useNavigate
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    // Mock useLocation
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ pathname: '/' });
    
    // Mock useAuth
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
      loginWithRedirect: jest.fn(),
      logout: mockLogout,
    });
    
    // Mock logger
    mockLogger.info = jest.fn();
    
    // Mock console.error to suppress React warnings
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    expect(screen.getByText('NormAIze')).toBeInTheDocument();
    expect(screen.getByText('Data Toolbox')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays navigation items correctly', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Datasets')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
    expect(screen.getByText('Visualization')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    // Mock current location as dashboard
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ pathname: '/' });
    
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-primary-100', 'text-primary-700');
  });

  it('shows user information when authenticated', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    // Find the settings button by looking for the Cog6ToothIcon
    const settingsButton = screen.getByRole('button');
    expect(settingsButton).toBeInTheDocument();
  });

  it('shows user email when name is not available', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
      loginWithRedirect: jest.fn(),
      logout: mockLogout,
    });
    
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('toggles settings dropdown when settings button is clicked', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const settingsButton = screen.getByRole('button');
    
    // Initially dropdown should be closed
    expect(screen.queryByText('Account Settings')).not.toBeInTheDocument();
    
    // Click to open dropdown
    fireEvent.click(settingsButton);
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Click again to close dropdown
    fireEvent.click(settingsButton);
    expect(screen.queryByText('Account Settings')).not.toBeInTheDocument();
  });

  it('navigates to account settings when account settings button is clicked', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const settingsButton = screen.getByRole('button');
    fireEvent.click(settingsButton);
    
    const accountSettingsButton = screen.getByText('Account Settings');
    fireEvent.click(accountSettingsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/account');
  });

  it('calls logout when logout button is clicked', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const settingsButton = screen.getByRole('button');
    fireEvent.click(settingsButton);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('closes dropdown when clicking outside', async () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const settingsButton = screen.getByRole('button');
    fireEvent.click(settingsButton);
    
    // Dropdown should be open
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    
    // Click outside the dropdown
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Account Settings')).not.toBeInTheDocument();
    });
  });

  it('handles search input changes', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const searchInput = screen.getByPlaceholderText('Search functionality, datasets, analyses...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(mockLogger.info).toHaveBeenCalledWith('Searching for', { query: 'test query' });
  });

  it('displays search bar with correct placeholder', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const searchInput = screen.getByPlaceholderText('Search functionality, datasets, analyses...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('renders logo and branding correctly', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const logo = screen.getByAltText('NormAIze Icon');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/icon.svg');
  });

  it('applies correct styling to navigation items', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('group', 'flex', 'items-center', 'px-2', 'py-2', 'text-sm', 'font-medium', 'rounded-md');
  });

  it('handles navigation to different routes', () => {
    // Mock location as datasets page
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ pathname: '/datasets' });
    
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const datasetsLink = screen.getByText('Datasets').closest('a');
    expect(datasetsLink).toHaveClass('bg-primary-100', 'text-primary-700');
  });

  it('maintains dropdown state correctly during interactions', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const settingsButton = screen.getByRole('button');
    
    // Open dropdown
    fireEvent.click(settingsButton);
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    
    // Click account settings (should close dropdown)
    const accountSettingsButton = screen.getByText('Account Settings');
    fireEvent.click(accountSettingsButton);
    
    // Dropdown should be closed
    expect(screen.queryByText('Account Settings')).not.toBeInTheDocument();
  });

  it('renders main content area correctly', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const mainContent = screen.getByText('Test Content');
    expect(mainContent).toBeInTheDocument();
  });

  it('applies correct layout structure classes', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const mainElement = screen.getByText('Test Content').closest('main');
    expect(mainElement).toHaveClass('flex-1', 'p-8');
  });

  it('handles empty search query', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const searchInput = screen.getByPlaceholderText('Search functionality, datasets, analyses...');
    
    // First set a value, then clear it to trigger the onChange event
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.change(searchInput, { target: { value: '' } });
    
    expect(mockLogger.info).toHaveBeenCalledWith('Searching for', { query: '' });
  });

  it('maintains search input value during typing', () => {
    render(<LayoutWithRouter>Test Content</LayoutWithRouter>);
    
    const searchInput = screen.getByPlaceholderText('Search functionality, datasets, analyses...');
    fireEvent.change(searchInput, { target: { value: 'partial' } });
    
    expect(searchInput).toHaveValue('partial');
  });
});
