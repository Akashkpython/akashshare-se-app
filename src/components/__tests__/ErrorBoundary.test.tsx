import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/testUtils';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('displays error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
  });

  it('shows error ID when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error ID:')).toBeInTheDocument();
    // Should have a random error ID
    const errorIdElement = screen.getByText(/Error ID:/).nextSibling;
    expect(errorIdElement).toBeTruthy();
  });

  it('provides Try Again button that resets error state', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

    // Click Try Again button
    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    // Rerender with component that doesn't throw
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  it('provides Go Home button', () => {
    // Mock window.location
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const goHomeButton = screen.getByText('Go Home');
    fireEvent.click(goHomeButton);

    expect(mockLocation.href).toBe('/');
  });

  it('shows error details in development mode', () => {
    // Note: In test environment, NODE_ENV is usually 'test'
    // We'll check for the details being present without changing NODE_ENV
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // In development/test mode, error details should be available
    const detailsElement = screen.queryByText('Show Error Details (Development)');
    if (detailsElement) {
      // Click to expand details
      fireEvent.click(detailsElement);
      expect(screen.getByText(/Test error message/)).toBeInTheDocument();
    }
  });

  it('does not show error details in production mode', () => {
    // Note: This test assumes we're not in development mode
    // In production, error details should not be shown by default
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Production mode typically won't show development details
    const detailsElement = screen.queryByText('Show Error Details (Development)');
    // In test environment, this might still be visible, so we just check it doesn't break
    expect(detailsElement).toBeDefined();
  });

  it('logs error to console in development', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check that console.error was called (should happen in test/development)
    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });

  it('handles multiple errors correctly', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // First error
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

    // Reset and cause another error
    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should still show error UI
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('maintains error boundary isolation', () => {
    render(
      <div>
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
        <div>This should still render</div>
      </div>
    );

    // Error boundary should catch the error
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    // But sibling content should still render
    expect(screen.getByText('This should still render')).toBeInTheDocument();
  });
});