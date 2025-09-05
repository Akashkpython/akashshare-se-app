#!/usr/bin/env node

// Render-specific startup script for Akash Share backend
console.log('🚀 Starting Akash Share backend for Render deployment...');

// Set environment variables if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.PORT = process.env.PORT || process.env.BACKEND_PORT || 10000;

console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
console.log(`🔧 Host: ${process.env.HOST}`);
console.log(`🔧 Port: ${process.env.PORT}`);

// Handle MongoDB dependency issues
try {
  // Try to require the saslprep module directly
  require('@mongodb-js/saslprep');
  console.log('✅ MongoDB saslprep module loaded successfully');
} catch (err) {
  console.warn('⚠️ MongoDB saslprep module not found, continuing without it');
  console.warn('Error:', err.message);
}

// Import and start the server
try {
  require('./server.js');
} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}