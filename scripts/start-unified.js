#!/usr/bin/env node

/**
 * Unified startup script for Akash Share
 * Starts both frontend and backend services together
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Starting Akash Share Unified Application...');
console.log('📁 Root directory:', rootDir);

// Check if backend directory exists
const backendDir = join(rootDir, 'backend');
const backendServerPath = join(backendDir, 'server.js');

if (!existsSync(backendServerPath)) {
  console.error('❌ Backend server not found at:', backendServerPath);
  console.error('   Please ensure the backend directory and server.js exist');
  process.exit(1);
}

console.log('✅ Backend server found');

// Start backend server
console.log('🔧 Starting backend server...');
const backendProcess = spawn('node', ['server.js'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '5004',
    HOST: '0.0.0.0',
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});

backendProcess.on('error', (error) => {
  console.error('❌ Backend server failed to start:', error.message);
  process.exit(1);
});

backendProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend server exited with code ${code}`);
    process.exit(code);
  }
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('🌐 Starting frontend development server...');
  
  const frontendProcess = spawn('npm', ['start'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: '5004',
      BROWSER: 'none' // Prevent auto-opening browser
    }
  });

  frontendProcess.on('error', (error) => {
    console.error('❌ Frontend server failed to start:', error.message);
    backendProcess.kill();
    process.exit(1);
  });

  frontendProcess.on('exit', (code) => {
    console.log(`🔄 Frontend server exited with code ${code}`);
    backendProcess.kill();
    process.exit(code);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down services...');
    frontendProcess.kill();
    backendProcess.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down services...');
    frontendProcess.kill();
    backendProcess.kill();
    process.exit(0);
  });

}, 3000); // Wait 3 seconds for backend to start

console.log('⏳ Waiting for backend to initialize...');
