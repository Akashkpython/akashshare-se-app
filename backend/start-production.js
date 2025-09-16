#!/usr/bin/env node

/**
 * Production startup script for Render deployment
 * Ensures all dependencies are available before starting the server
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting Akash Share Backend in Production Mode...');

// Check if required packages are properly installed
const rateLimitPath = join(process.cwd(), 'node_modules', 'express-rate-limit');
const rateLimitPackageJson = join(rateLimitPath, 'package.json');
const rateLimitIndex = join(rateLimitPath, 'index.js');

const debugPath = join(process.cwd(), 'node_modules', 'debug');
const debugPackageJson = join(debugPath, 'package.json');
const debugIndex = join(debugPath, 'index.js');

const isRateLimitInstalled = existsSync(rateLimitPath) && 
                            existsSync(rateLimitPackageJson) && 
                            existsSync(rateLimitIndex);

const isDebugInstalled = existsSync(debugPath) && 
                        existsSync(debugPackageJson) && 
                        existsSync(debugIndex);

const isPackageInstalled = isRateLimitInstalled && isDebugInstalled;

if (!isPackageInstalled) {
  const missingPackages = [];
  if (!isRateLimitInstalled) missingPackages.push('express-rate-limit');
  if (!isDebugInstalled) missingPackages.push('debug');
  
  console.log(`⚠️  Missing packages: ${missingPackages.join(', ')}, reinstalling...`);
  
  // Install missing packages
  const install = spawn('npm', ['install', 'express-rate-limit@^5.5.1', 'debug@^4.3.4', '--force'], {
    stdio: 'inherit',
    shell: true
  });
  
  install.on('close', (installCode) => {
    if (installCode === 0) {
      console.log('✅ All packages reinstalled successfully');
      startServer();
    } else {
      console.error('❌ Failed to reinstall packages');
      process.exit(1);
    }
  });
} else {
  console.log('✅ All required packages properly installed');
  startServer();
}

function startServer() {
  console.log('🔧 Starting server...');
  
  // Set environment variables
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  process.env.HOST = process.env.HOST || '0.0.0.0';
  process.env.PORT = process.env.PORT || '5004';
  
  // Import and start the server
  import('./server.js').catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}
