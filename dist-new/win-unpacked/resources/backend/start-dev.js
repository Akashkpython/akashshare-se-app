#!/usr/bin/env node

/**
 * Development startup script for local development
 * Simplified startup without production checks
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

console.log('🚀 Starting Akash Share Backend in Development Mode...');

// Set development environment variables
process.env.NODE_ENV = 'development';
process.env.HOST = 'localhost';
process.env.PORT = '5005';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/akashshare';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-akash-share';
process.env.CORS_ORIGIN = 'http://localhost:5005';
process.env.ENABLE_CORS = 'true';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';

console.log('🔧 Environment configured:');
console.log(`  📍 Host: ${process.env.HOST}`);
console.log(`  🚪 Port: ${process.env.PORT}`);
console.log(`  🔄 CORS Origins: ${process.env.CORS_ORIGIN}`);
console.log(`  🗃️  MongoDB: ${process.env.MONGO_URI}`);

// Import and start the server
try {
  await import('./server.js');
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
