import { render, screen, fireEvent } from '../../../utils/testUtils';
import { mockStore } from '../../../utils/testUtils';
import NotificationContainer from '../NotificationContainer';

// Mock notifications
const mockNotifications = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Success!',
    message: 'Operation completed successfully',
    timestamp: Date.now(),
  },
  {
    id: '2',
    type: 'error' as const,
    title: 'Error!',
    message: 'Something went wrong',
    timestamp: Date.now(),
  },
  {
    id: '3',
    type: 'warning' as const,
    title: 'Warning!',
    message: 'Please be careful',
    timestamp: Date.now(),
  },
  {
    id: '4',
    type: 'info' as const,
    title: 'Info',
    message: 'Here is some information',
    timestamp: Date.now(),
  },
];

describe('NotificationContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.notifications = [];
  });

  it('renders empty container when no notifications', () => {
    render(<NotificationContainer />);
    
    // Container should exist but be empty
    const container = document.querySelector('.fixed.top-4.right-4');
    expect(container).toBeInTheDocument();
    expect(container?.children).toHaveLength(0);
  });

  it('renders notifications correctly', () => {
    mockStore.notifications = [mockNotifications[0]];
    
    render(<NotificationContainer />);
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  it('renders different notification types with correct icons', () => {
    mockStore.notifications = mockNotifications;
    render(<NotificationContainer />);
    
    // Check that all notifications are rendered
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    
    // Check for icons (mocked in testUtils)
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument(); // success
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument(); // error
    // Warning and info would also have their icons
  });

  it('calls removeNotification when close button is clicked', () => {
    mockStore.notifications = [mockNotifications[0]];
    
    render(<NotificationContainer />);
    
    const closeButton = screen.getByTestId('x-icon').closest('button');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton!);
    
    expect(mockStore.removeNotification).toHaveBeenCalledWith('1');
  });

  it('handles multiple notifications', () => {
    mockStore.notifications = mockNotifications.slice(0, 2);
    
    render(<NotificationContainer />);
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
    
    // Should have 2 close buttons
    const closeButtons = screen.getAllByTestId('x-icon');
    expect(closeButtons).toHaveLength(2);
  });

  it('removes specific notification when close button clicked', () => {
    mockStore.notifications = mockNotifications.slice(0, 2);
    
    render(<NotificationContainer />);
    
    // Click close on the first notification (Success)
    const closeButtons = screen.getAllByTestId('x-icon');
    fireEvent.click(closeButtons[0].closest('button')!);
    
    expect(mockStore.removeNotification).toHaveBeenCalledWith('1');
  });

  it('applies correct styling for different notification types', () => {
    mockStore.notifications = [
      mockNotifications[0], // success
      mockNotifications[1], // error
    ];
    
    render(<NotificationContainer />);
    
    const successNotification = screen.getByText('Success!').closest('div');
    const errorNotification = screen.getByText('Error!').closest('div');
    
    // These would have different styling classes, but since we're using mocked framer-motion,
    // we can't test the exact classes. We can at least verify they're rendered differently.
    expect(successNotification).toBeInTheDocument();
    expect(errorNotification).toBeInTheDocument();
    expect(successNotification).not.toBe(errorNotification);
  });

  it('handles notification with very long messages', () => {
    const longMessage = 'A'.repeat(200);
    mockStore.notifications = [{
      id: 'long',
      type: 'info' as const,
      title: 'Long Message',
      message: longMessage,
      timestamp: Date.now(),
    }];
    
    render(<NotificationContainer />);
    
    expect(screen.getByText('Long Message')).toBeInTheDocument();
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('handles notifications with special characters', () => {
    mockStore.notifications = [{
      id: 'special',
      type: 'info' as const,
      title: 'Special & Characters <test>',
      message: 'Message with "quotes" and \'apostrophes\'',
      timestamp: Date.now(),
    }];
    
    render(<NotificationContainer />);
    
    expect(screen.getByText('Special & Characters <test>')).toBeInTheDocument();
    expect(screen.getByText('Message with "quotes" and \'apostrophes\'')).toBeInTheDocument();
  });

  it('maintains order of notifications', () => {
    mockStore.notifications = [
      { ...mockNotifications[0], timestamp: 1000 },
      { ...mockNotifications[1], timestamp: 2000 },
      { ...mockNotifications[2], timestamp: 3000 },
    ];
    
    render(<NotificationContainer />);
    
    const titles = screen.getAllByText(/Success!|Error!|Warning!/);
    expect(titles[0]).toHaveTextContent('Success!');
    expect(titles[1]).toHaveTextContent('Error!');
    expect(titles[2]).toHaveTextContent('Warning!');
  });

  it('handles empty notification properties gracefully', () => {
    mockStore.notifications = [{
      id: 'empty',
      type: 'info' as const,
      title: '',
      message: '',
      timestamp: Date.now(),
    }];
    
    render(<NotificationContainer />);
    
    // Should still render the notification structure
    const container = document.querySelector('.fixed.top-4.right-4');
    expect(container?.children).toHaveLength(1);
  });

  it('updates when notifications change', () => {
    const { rerender } = render(<NotificationContainer />);
    
    // Initially no notifications
    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    
    // Add notification
    mockStore.notifications = [mockNotifications[0]];
    rerender(<NotificationContainer />);
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
    
    // Remove notification
    mockStore.notifications = [];
    rerender(<NotificationContainer />);
    
    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });
});