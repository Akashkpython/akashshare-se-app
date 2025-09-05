import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../pages/Dashboard';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => children
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
}));

// Mock recharts to avoid canvas issues
jest.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />
}));

// Mock useStore
jest.mock('../../store/useStore', () => ({
  __esModule: true,
  default: () => ({
    transferHistory: [
      {
        id: '1',
        fileName: 'test.jpg',
        fileSize: 1024,
        direction: 'upload',
        status: 'completed',
        startTime: new Date('2024-01-01').toISOString()
      }
    ]
  })
}));

describe('Frontend Smoke Tests', () => {
  test('Dashboard component renders without crashing', () => {
    render(<Dashboard />);
    
    // Check for main dashboard title
    expect(screen.getByText(/Welcome to Akash Share/i)).toBeInTheDocument();
  });

  test('Dashboard displays quick actions', () => {
    render(<Dashboard />);
    
    // Check for quick action buttons
    expect(screen.getByText(/Send Files/i)).toBeInTheDocument();
    expect(screen.getByText(/Receive Files/i)).toBeInTheDocument();
    expect(screen.getByText(/View History/i)).toBeInTheDocument();
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  });

  test('Dashboard displays statistics', () => {
    render(<Dashboard />);
    
    // Check for stats section
    expect(screen.getByText(/Total Transfers/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Codes/i)).toBeInTheDocument();
    expect(screen.getByText(/Storage Used/i)).toBeInTheDocument();
    expect(screen.getByText(/Success Rate/i)).toBeInTheDocument();
  });

  test('Dashboard renders charts components', () => {
    render(<Dashboard />);
    
    // Check that chart containers are rendered (mocked)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('Component accessibility - has proper heading structure', () => {
    render(<Dashboard />);
    
    // Check for main heading
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent(/Welcome to Akash Share/i);
  });
});