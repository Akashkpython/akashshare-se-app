import React from 'react';
import { render, screen } from '@testing-library/react';
import SplashScreen from './SplashScreen';

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <div>{children}</div>,
}));

describe('SplashScreen', () => {
  it('renders without crashing', () => {
    const mockOnFinish = jest.fn();
    render(<SplashScreen onFinish={mockOnFinish} />);
    
    // Check if the main elements are rendered
    expect(screen.getByText('AKASH')).toBeInTheDocument();
    expect(screen.getByText('Akash Share')).toBeInTheDocument();
  });

  it('shows Group Chat text after delay', () => {
    jest.useFakeTimers();
    const mockOnFinish = jest.fn();
    
    render(<SplashScreen onFinish={mockOnFinish} />);
    
    // Initially, Group Chat should not be visible
    expect(screen.queryByText('Group Chat')).not.toBeInTheDocument();
    
    // Fast-forward timers
    jest.advanceTimersByTime(1500);
    
    // After 1.5 seconds, Group Chat should be visible
    expect(screen.getByText('Group')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    
    jest.useRealTimers();
  });
});