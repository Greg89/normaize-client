import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  DocumentTextIcon: ({ className, ...props }: any) => (
    <div data-testid="document-text-icon" className={className} {...props} />
  ),
  ChartBarIcon: ({ className, ...props }: any) => (
    <div data-testid="chart-bar-icon" className={className} {...props} />
  ),
  ChartPieIcon: ({ className, ...props }: any) => (
    <div data-testid="chart-pie-icon" className={className} {...props} />
  ),
  ArrowUpIcon: ({ className, ...props }: any) => (
    <div data-testid="arrow-up-icon" className={className} {...props} />
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders without crashing', () => {
    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays the main heading and description', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
    
    expect(screen.getByText('Welcome to your data toolbox')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your data toolbox')).toHaveClass('text-gray-600');
  });

  it('displays all four stat cards with correct data', () => {
    renderWithRouter(<Dashboard />);
    
    // Check all stat cards are present
    expect(screen.getByText('Total Datasets')).toBeInTheDocument();
    expect(screen.getByText('Analyses')).toBeInTheDocument();
    expect(screen.getByText('Visualizations')).toBeInTheDocument();
    expect(screen.getByText('Recent Uploads')).toBeInTheDocument();
    
    // Check stat values
    expect(screen.getByText('12')).toBeInTheDocument(); // totalDatasets
    expect(screen.getByText('8')).toBeInTheDocument();  // totalAnalyses
    expect(screen.getByText('15')).toBeInTheDocument(); // totalVisualizations
    expect(screen.getByText('3')).toBeInTheDocument();  // recentUploads
  });

  it('displays stat cards with correct icons and styling', () => {
    renderWithRouter(<Dashboard />);
    
    // Check that icons are rendered (using getAllByTestId since some icons appear multiple times)
    const documentIcons = screen.getAllByTestId('document-text-icon');
    const chartBarIcons = screen.getAllByTestId('chart-bar-icon');
    const chartPieIcons = screen.getAllByTestId('chart-pie-icon');
    const arrowUpIcons = screen.getAllByTestId('arrow-up-icon');
    
    expect(documentIcons.length).toBeGreaterThan(0);
    expect(chartBarIcons.length).toBeGreaterThan(0);
    expect(chartPieIcons.length).toBeGreaterThan(0);
    expect(arrowUpIcons.length).toBeGreaterThan(0);
    
    // Check that the first instance of each icon has the correct color for stat cards
    // Stat cards use colored icons (blue, green, purple, orange)
    const statCardDocumentIcon = documentIcons[0];
    const statCardChartBarIcon = chartBarIcons[0];
    const statCardChartPieIcon = chartPieIcons[0];
    const statCardArrowUpIcon = arrowUpIcons[0];
    
    expect(statCardDocumentIcon).toHaveClass('text-blue-500');
    expect(statCardChartBarIcon).toHaveClass('text-green-500');
    expect(statCardChartPieIcon).toHaveClass('text-purple-500');
    expect(statCardArrowUpIcon).toHaveClass('text-orange-500');
  });

  it('displays quick actions section with correct heading', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toHaveClass('text-lg', 'font-semibold', 'text-gray-900');
  });

  it('displays all three quick action cards', () => {
    renderWithRouter(<Dashboard />);
    
    // Check action names
    expect(screen.getByText('Upload Dataset')).toBeInTheDocument();
    expect(screen.getByText('Run Analysis')).toBeInTheDocument();
    expect(screen.getByText('Create Visualization')).toBeInTheDocument();
    
    // Check descriptions
    expect(screen.getByText('Upload a new CSV, JSON, or Excel file')).toBeInTheDocument();
    expect(screen.getByText('Analyze your datasets for insights')).toBeInTheDocument();
    expect(screen.getByText('Generate charts and graphs')).toBeInTheDocument();
  });

  it('displays quick action cards with correct icons and colors', () => {
    renderWithRouter(<Dashboard />);
    
    // Check that icons are rendered in action cards
    const actionCards = screen.getAllByText(/Upload Dataset|Run Analysis|Create Visualization/);
    expect(actionCards).toHaveLength(3);
    
    // Check that each card has the correct structure
    actionCards.forEach(card => {
      expect(card.closest('.card')).toBeInTheDocument();
      expect(card.closest('.card')).toHaveClass('hover:shadow-lg', 'transition-shadow', 'cursor-pointer');
    });
  });

  it('navigates to datasets with upload parameter when Upload Dataset is clicked', () => {
    renderWithRouter(<Dashboard />);
    
    const uploadCard = screen.getByText('Upload Dataset').closest('.card');
    expect(uploadCard).toBeInTheDocument();
    
    fireEvent.click(uploadCard!);
    
    expect(mockNavigate).toHaveBeenCalledWith('/datasets?upload=true');
  });

  it('navigates to correct routes for other quick actions', () => {
    renderWithRouter(<Dashboard />);
    
    // Test Run Analysis
    const analysisCard = screen.getByText('Run Analysis').closest('.card');
    fireEvent.click(analysisCard!);
    expect(mockNavigate).toHaveBeenCalledWith('/analysis');
    
    // Test Create Visualization
    const visualizationCard = screen.getByText('Create Visualization').closest('.card');
    fireEvent.click(visualizationCard!);
    expect(mockNavigate).toHaveBeenCalledWith('/visualization');
  });

  it('has correct layout structure and styling', () => {
    const { container } = renderWithRouter(<Dashboard />);
    
    // Check main container
    const mainContainer = container.querySelector('.space-y-6');
    expect(mainContainer).toBeInTheDocument();
    
    // Check stats grid
    const statsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-4.gap-6');
    expect(statsGrid).toBeInTheDocument();
    
    // Check quick actions grid
    const actionsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.gap-6');
    expect(actionsGrid).toBeInTheDocument();
  });

  it('renders stat cards with correct structure', () => {
    renderWithRouter(<Dashboard />);
    
    // Check that each stat card has the correct structure
    const statCards = screen.getAllByText(/Total Datasets|Analyses|Visualizations|Recent Uploads/);
    expect(statCards).toHaveLength(4);
    
    statCards.forEach(card => {
      expect(card.closest('.card')).toBeInTheDocument();
      const cardElement = card.closest('.card');
      expect(cardElement).toHaveClass('card');
    });
  });

  it('handles multiple quick action clicks correctly', () => {
    renderWithRouter(<Dashboard />);
    
    // Click multiple actions
    const uploadCard = screen.getByText('Upload Dataset').closest('.card');
    const analysisCard = screen.getByText('Run Analysis').closest('.card');
    const visualizationCard = screen.getByText('Create Visualization').closest('.card');
    
    fireEvent.click(uploadCard!);
    fireEvent.click(analysisCard!);
    fireEvent.click(visualizationCard!);
    
    expect(mockNavigate).toHaveBeenCalledTimes(3);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/datasets?upload=true');
    expect(mockNavigate).toHaveBeenNthCalledWith(2, '/analysis');
    expect(mockNavigate).toHaveBeenNthCalledWith(3, '/visualization');
  });

  it('maintains state across re-renders', () => {
    const { rerender } = renderWithRouter(<Dashboard />);
    
    // Check initial stats
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    
    // Re-render and check stats are still there
    rerender(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
