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

// Import and start the server
require('./server.js');