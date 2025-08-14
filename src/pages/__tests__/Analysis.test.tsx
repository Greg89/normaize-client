import React from 'react';
import { render, screen } from '@testing-library/react';
import Analysis from '../Analysis';

describe('Analysis', () => {
  it('renders without crashing', () => {
    render(<Analysis />);
    expect(screen.getByText('Analysis')).toBeInTheDocument();
  });

  it('displays the main heading', () => {
    render(<Analysis />);
    expect(screen.getByText('Analysis')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
  });

  it('displays the description text', () => {
    render(<Analysis />);
    expect(screen.getByText('Analyze and compare your datasets')).toBeInTheDocument();
    expect(screen.getByText('Analyze and compare your datasets')).toHaveClass('text-gray-600');
  });

  it('displays the coming soon message', () => {
    render(<Analysis />);
    expect(screen.getByText('Analysis interface coming soon...')).toBeInTheDocument();
    expect(screen.getByText('Analysis interface coming soon...')).toHaveClass('text-gray-500');
  });

  it('has correct structure and styling', () => {
    const { container } = render(<Analysis />);
    
    // Check main container - find the div with space-y-6 class
    const mainContainer = container.querySelector('.space-y-6');
    expect(mainContainer).toBeInTheDocument();
    
    // Check card styling - find the div with card class
    const cardElement = container.querySelector('.card');
    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveTextContent('Analysis interface coming soon...');
  });

  it('renders all expected elements', () => {
    render(<Analysis />);
    
    // Should have exactly one h1 element
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Analysis');
    
    // Should have exactly two paragraph elements
    const paragraphs = screen.getAllByText(/.*/, { selector: 'p' });
    expect(paragraphs).toHaveLength(2);
  });
});
