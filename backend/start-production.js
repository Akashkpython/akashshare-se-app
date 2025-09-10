#!/usr/bin/env node

/**
 * Production startup script for Render deployment
 * Ensures all dependencies are available before starting the server
 */

console.log('🚀 Starting Akash Share Backend in Production Mode...');

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.PORT = process.env.PORT || '5003';

console.log('🔧 Starting server...');

// Import and start the server
import('./server.js').catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
