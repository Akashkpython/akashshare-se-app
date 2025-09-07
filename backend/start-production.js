#!/usr/bin/env node

/**
 * Production startup script for Render deployment
 * Ensures all dependencies are available before starting the server
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting Akash Share Backend in Production Mode...');

// Check if express-rate-limit is available
const rateLimitPath = join(process.cwd(), 'node_modules', 'express-rate-limit');
if (!existsSync(rateLimitPath)) {
  console.log('⚠️  express-rate-limit not found, installing...');
  
  const install = spawn('npm', ['install', 'express-rate-limit@^5.5.1'], {
    stdio: 'inherit',
    shell: true
  });
  
  install.on('close', (code) => {
    if (code === 0) {
      console.log('✅ express-rate-limit installed successfully');
      startServer();
    } else {
      console.error('❌ Failed to install express-rate-limit');
      process.exit(1);
    }
  });
} else {
  console.log('✅ express-rate-limit found');
  startServer();
}

function startServer() {
  console.log('🔧 Starting server...');
  
  // Set environment variables
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  process.env.HOST = process.env.HOST || '0.0.0.0';
  process.env.PORT = process.env.PORT || '5002';
  
  // Import and start the server
  import('./server.js').catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}
