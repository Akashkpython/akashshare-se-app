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

// Test dependencies before starting
console.log('🔍 Testing dependencies...');

// Handle MongoDB dependency issues
try {
  // Try to require the saslprep module directly
  require('@mongodb-js/saslprep');
  console.log('✅ MongoDB saslprep module loaded successfully');
} catch (err) {
  console.warn('⚠️ MongoDB saslprep module not found, continuing without it');
  console.warn('Error:', err.message);
}

// Test express-rate-limit
try {
  require('express-rate-limit');
  console.log('✅ express-rate-limit module loaded successfully');
  // Safer way to get version information
  try {
    const rateLimitPkg = require('express-rate-limit/package.json');
    console.log('Version:', rateLimitPkg.version);
  } catch (versionErr) {
    console.log('Version: Unable to determine (non-critical)');
  }
} catch (err) {
  console.error('❌ Failed to load express-rate-limit:', err);
  console.error('Error code:', err.code);
  console.error('Error path:', err.path);
  process.exit(1);
}

// Import and start the server
try {
  console.log('🔄 Starting server...');
  require('./server.js');
} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}