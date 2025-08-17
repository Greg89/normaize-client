import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    // Check if the spinner element exists (the div with animate-spin class)
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    
    // Check if default text is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    const customText = 'Please wait...';
    render(<LoadingSpinner text={customText} />);
    
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  it('renders without text when text prop is empty', () => {
    render(<LoadingSpinner text="" />);
    
    // Spinner should still be visible
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    
    // Text should not be present
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    
    // Check small size
    let spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-4', 'w-4');
    
    // Check medium size (default)
    rerender(<LoadingSpinner size="md" />);
    spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-8', 'w-8');
    
    // Check large size
    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('applies custom className', () => {
    const customClass = 'custom-spinner-class';
    render(<LoadingSpinner className={customClass} />);
    
    const container = screen.getByTestId('loading-spinner').parentElement;
    expect(container).toHaveClass(customClass);
  });

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-4', 'border-gray-200', 'border-t-primary-600');
  });

  it('renders with all props combined', () => {
    render(
      <LoadingSpinner 
        size="lg" 
        text="Processing data..." 
        className="my-custom-class"
      />
    );
    
    // Check size
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-12', 'w-12');
    
    // Check text
    expect(screen.getByText('Processing data...')).toBeInTheDocument();
    
    // Check custom class
    const container = spinner.parentElement;
    expect(container).toHaveClass('my-custom-class');
  });
});
