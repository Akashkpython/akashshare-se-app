#!/usr/bin/env node

/**
 * Production Start Script for Render Deployment
 * This script handles production-specific configurations and starts the server
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// Production environment validation
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'NODE_ENV'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Production-specific configurations
process.env.NODE_ENV = 'production';
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.PORT = process.env.PORT || '5005';

// Log production startup
console.log('🚀 Starting Akash Share Backend in Production Mode');
console.log('📊 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   HOST: ${process.env.HOST}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Missing'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'Default'}`);

// Set up production error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
console.log('🎯 Starting server...');
import('./server.js').catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});