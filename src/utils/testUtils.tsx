import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';

// Store mock for testing
const mockStore = {
  theme: 'dark',
  setTheme: jest.fn(),
  transfers: [],
  currentTransfer: null,
  transferHistory: [],
  shareCodes: [],
  settings: {
    autoStart: true,
    notifications: true,
    language: 'en',
    maxFileSize: 100 * 1024 * 1024,
    codeExpiry: 24 * 60 * 60 * 1000,
  },
  sidebarOpen: true,
  notifications: [] as Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
  }>,
  addTransfer: jest.fn(),
  updateTransferProgress: jest.fn(),
  completeTransfer: jest.fn(),
  clearCompletedTransfers: jest.fn(),
  clearHistory: jest.fn(),
  addShareCode: jest.fn(),
  removeShareCode: jest.fn(),
  cleanupExpiredCodes: jest.fn(),
  updateSettings: jest.fn(),
  setSidebarOpen: jest.fn(),
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  clearNotifications: jest.fn(),
};

// Mock zustand store
jest.mock('../store/useStore', () => ({
  __esModule: true,
  default: () => mockStore,
}));

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  History: () => <div data-testid="history-icon">History</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
  User: () => <div data-testid="user-icon">User</div>,
  MessageCircle: () => <div data-testid="message-circle-icon">MessageCircle</div>,
  Send: () => <div data-testid="send-icon">Send</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Copy: () => <div data-testid="copy-icon">Copy</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  RefreshCw: () => <div data-testid="refresh-icon">RefreshCw</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  File: () => <div data-testid="file-icon">File</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
  Video: () => <div data-testid="video-icon">Video</div>,
  Music: () => <div data-testid="music-icon">Music</div>,
  Archive: () => <div data-testid="archive-icon">Archive</div>,
}));

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
  initialRoute?: string;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children
}) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  );
};

// Custom render function
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    initialRoute?: string;
  }
): RenderResult => {
  const { initialRoute, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper initialRoute={initialRoute || '/'}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  });
};

// Utility functions for testing
export const createMockFile = (
  name: string = 'test.txt',
  size: number = 1024,
  type: string = 'text/plain'
): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

export const createMockFileList = (files: File[]): FileList => {
  const fileList = {
    ...files,
    length: files.length,
    item: (index: number) => files[index] || null,
  };
  return fileList as FileList;
};

export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved } = await import('@testing-library/react');
  try {
    await waitForElementToBeRemoved(
      () => document.querySelector('[data-testid="loading-spinner"]'),
      { timeout: 3000 }
    );
  } catch (error) {
    // Loading might not be present, which is fine
  }
};

// Mock API responses
export const mockApiSuccess = (data: any) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
};

export const mockApiError = (error: string) => {
  return Promise.reject(new Error(error));
};

// WebSocket mock for testing
export const mockWebSocket = () => {
  const mockWS = {
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    readyState: WebSocket.OPEN,
    CONNECTING: WebSocket.CONNECTING,
    OPEN: WebSocket.OPEN,
    CLOSING: WebSocket.CLOSING,
    CLOSED: WebSocket.CLOSED,
  };

  (global as any).WebSocket = jest.fn(() => mockWS);
  return mockWS;
};

// Clean up function for tests
export const cleanupMocks = () => {
  jest.clearAllMocks();
  mockStore.notifications = [];
  mockStore.transfers = [];
  mockStore.transferHistory = [];
  mockStore.shareCodes = [];
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
export { mockStore };