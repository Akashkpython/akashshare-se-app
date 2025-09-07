/**
 * Production Configuration for Akash Share Frontend
 * This file contains production-specific settings and API endpoints
 */

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  // API Configuration
  api: {
    baseURL: isProduction 
      ? process.env.REACT_APP_API_URL || 'https://akashshare-backend.onrender.com'
      : 'http://localhost:5002',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // WebSocket Configuration
  websocket: {
    url: isProduction
      ? `wss://${process.env.REACT_APP_API_URL?.replace('https://', '') || 'akashshare-backend.onrender.com'}/chat`
      : 'ws://localhost:5002/chat',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000
  },

  // Performance Configuration
  performance: {
    enableMonitoring: isProduction,
    enableCaching: true,
    cacheSize: 50, // MB
    lazyLoadThreshold: 100, // ms
    batchUpdateSize: 10
  },

  // Security Configuration
  security: {
    enableCSP: isProduction,
    enableSanitization: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'text/plain',
      'application/pdf'
    ]
  },

  // Feature Flags
  features: {
    enableAnalytics: isProduction,
    enableErrorReporting: isProduction,
    enablePerformanceMonitoring: isProduction,
    enableDebugMode: !isProduction
  },

  // Logging Configuration
  logging: {
    level: isProduction ? 'info' : 'debug',
    enableConsole: !isProduction,
    enableRemote: isProduction
  }
};

export default config;
