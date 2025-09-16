#!/usr/bin/env node

/**
 * Post-install script to install backend dependencies
 * This script runs after the Electron app is installed to ensure
 * the backend has all required dependencies
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

console.log('🔧 Installing backend dependencies...');

// Get the backend directory path
// In packaged apps, this script runs from resources
const backendDir = join(__dirname, 'backend');

// Check if backend directory exists
if (!existsSync(backendDir)) {
  console.error('❌ Backend directory not found:', backendDir);
  process.exit(1);
}

console.log('📂 Backend directory:', backendDir);

// Install backend dependencies
const npmInstall = spawn('npm', ['install', '--production'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true
});

npmInstall.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Backend dependencies installed successfully');
  } else {
    console.error('❌ Failed to install backend dependencies');
    process.exit(code);
  }
});