import React from 'react';
import { render, screen } from '@testing-library/react';
import Visualization from '../Visualization';

describe('Visualization', () => {
  it('renders without crashing', () => {
    render(<Visualization />);
    expect(screen.getByText('Visualization')).toBeInTheDocument();
  });

  it('displays the main heading', () => {
    render(<Visualization />);
    expect(screen.getByText('Visualization')).toBeInTheDocument();
    expect(screen.getByText('Visualization')).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
  });

  it('displays the description text', () => {
    render(<Visualization />);
    expect(screen.getByText('Create charts and graphs from your data')).toBeInTheDocument();
    expect(screen.getByText('Create charts and graphs from your data')).toHaveClass('text-gray-600');
  });

  it('displays the coming soon message', () => {
    render(<Visualization />);
    expect(screen.getByText('Visualization interface coming soon...')).toBeInTheDocument();
    expect(screen.getByText('Visualization interface coming soon...')).toHaveClass('text-gray-500');
  });

  it('has correct structure and styling', () => {
    const { container } = render(<Visualization />);
    
    // Check main container - find the div with space-y-6 class
    const mainContainer = container.querySelector('.space-y-6');
    expect(mainContainer).toBeInTheDocument();
    
    // Check card styling - find the div with card class
    const cardElement = container.querySelector('.card');
    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveTextContent('Visualization interface coming soon...');
  });

  it('renders all expected elements', () => {
    render(<Visualization />);
    
    // Should have exactly one h1 element
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Visualization');
    
    // Should have exactly two paragraph elements
    const paragraphs = screen.getAllByText(/.*/, { selector: 'p' });
    expect(paragraphs).toHaveLength(2);
  });

  it('has consistent styling with Analysis page', () => {
    render(<Visualization />);
    
    // Check that the styling classes match the expected pattern
    const heading = screen.getByText('Visualization');
    const description = screen.getByText('Create charts and graphs from your data');
    const comingSoon = screen.getByText('Visualization interface coming soon...');
    
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
    expect(description).toHaveClass('text-gray-600');
    expect(comingSoon).toHaveClass('text-gray-500');
  });
});
