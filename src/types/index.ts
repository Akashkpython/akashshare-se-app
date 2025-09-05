// Core application types and interfaces

export interface FileInfo {
  id: string | number;
  name: string;
  size: number;
  type: string;
  uploadedAt?: Date;
  code?: string;
}

export interface Transfer {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  direction: 'upload' | 'download';
  status: 'pending' | 'uploading' | 'downloading' | 'completed' | 'failed';
  progress: number;
  startTime: number;
  endTime?: number | null;
}

export interface ShareCode {
  code: string;
  fileInfo: FileInfo;
  createdAt: number;
  expiresAt: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

export interface Settings {
  autoStart: boolean;
  notifications: boolean;
  language: 'en' | 'kn';
  maxFileSize: number;
  codeExpiry: number;
}

export interface AppState {
  // Theme
  theme: 'light' | 'dark';
  
  // File transfers
  transfers: Transfer[];
  currentTransfer: Transfer | null;
  transferHistory: Transfer[];
  
  // Share codes
  shareCodes: ShareCode[];
  
  // Settings
  settings: Settings;
  
  // UI state
  sidebarOpen: boolean;
  notifications: Notification[];
}

// Component Props Types
export interface NotificationProps {
  notification: Notification;
  onClose: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId: string | null;
}

export interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: boolean;
    retry?: () => void;
    timedOut?: boolean;
  }> | null;
  timeout?: number;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  code: string;
  filename: string;
  size: number;
  message: string;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'message' | 'userJoined' | 'userLeft' | 'userList';
  username?: string;
  message?: string;
  room?: string;
  timestamp?: string;
  users?: string[];
}

// Environment Configuration
export interface EnvironmentConfig {
  apiUrl: string | null;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  debugMode: boolean;
  baseApiUrl: string;
}

// Utility Types
export type Theme = 'light' | 'dark';
export type TransferDirection = 'upload' | 'download';
export type TransferStatus = 'pending' | 'uploading' | 'downloading' | 'completed' | 'failed';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type Language = 'en' | 'kn';

// Store Action Types
export interface StoreActions {
  // Theme
  setTheme: (theme: Theme) => void;
  
  // Transfers
  addTransfer: (transfer: Omit<Transfer, 'id' | 'status' | 'progress' | 'startTime' | 'endTime'>) => void;
  updateTransferProgress: (id: string, progress: number, status?: TransferStatus) => void;
  completeTransfer: (id: string, status?: TransferStatus) => void;
  clearCompletedTransfers: () => void;
  clearHistory: () => void;
  
  // Share codes
  addShareCode: (code: string, fileInfo: FileInfo) => void;
  removeShareCode: (code: string) => void;
  cleanupExpiredCodes: () => void;
  
  // Settings
  updateSettings: (newSettings: Partial<Settings>) => void;
  
  // UI
  setSidebarOpen: (open: boolean) => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}