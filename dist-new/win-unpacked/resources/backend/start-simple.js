#!/usr/bin/env node

/**
 * Simple backend startup script for Electron
 * This script will start the backend server without any complex health checks
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Akash Share Backend (Simple Mode)...');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = '5005';
process.env.HOST = '0.0.0.0';
process.env.MONGO_URI = 'mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare';
process.env.JWT_SECRET = 'f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09';
process.env.TRUST_PROXY = 'true';
process.env.FILE_SIZE_LIMIT = '10485760';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.AI_CLASSIFY_ENABLED = 'true';

// Get the directory where this script is located
const backendDir = __dirname;
const serverPath = path.join(backendDir, 'server.js');

console.log(`📁 Backend directory: ${backendDir}`);
console.log(`📄 Server path: ${serverPath}`);

// Check if server.js exists
if (!fs.existsSync(serverPath)) {
  console.error(`❌ Server file not found: ${serverPath}`);
  process.exit(1);
}

console.log('✅ Server file found, starting backend...');

// Start the server
const serverProcess = spawn('node', [serverPath], {
  cwd: backendDir,
  env: process.env,
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`🔧 Server process exited with code ${code}`);
  if (code !== 0) {
    console.error('❌ Server exited with error code:', code);
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

console.log('✅ Backend startup script initialized');
console.log('🔧 Server should be starting on http://localhost:5005');
