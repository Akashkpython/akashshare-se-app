#!/usr/bin/env node

/**
 * Production startup script for Render deployment
 * Ensures all dependencies are available before starting the server
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting Akash Share Backend in Production Mode...');

// Check if express-rate-limit is properly installed
const rateLimitPath = join(process.cwd(), 'node_modules', 'express-rate-limit');
const rateLimitPackageJson = join(rateLimitPath, 'package.json');
const rateLimitIndex = join(rateLimitPath, 'index.js');

const isPackageInstalled = existsSync(rateLimitPath) && 
                          existsSync(rateLimitPackageJson) && 
                          existsSync(rateLimitIndex);

if (!isPackageInstalled) {
  console.log('⚠️  express-rate-limit not properly installed, reinstalling...');
  
  // First, try to remove and reinstall
  const remove = spawn('npm', ['uninstall', 'express-rate-limit'], {
    stdio: 'inherit',
    shell: true
  });
  
  remove.on('close', (removeCode) => {
    console.log('🗑️  Removed existing express-rate-limit');
    
    const install = spawn('npm', ['install', 'express-rate-limit@^5.5.1', '--force'], {
      stdio: 'inherit',
      shell: true
    });
    
    install.on('close', (installCode) => {
      if (installCode === 0) {
        console.log('✅ express-rate-limit reinstalled successfully');
        startServer();
      } else {
        console.error('❌ Failed to reinstall express-rate-limit');
        process.exit(1);
      }
    });
  });
} else {
  console.log('✅ express-rate-limit properly installed');
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
