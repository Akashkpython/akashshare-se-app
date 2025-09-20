#!/usr/bin/env node

/**
 * Robust Backend Starter for AkashShare
 * This script ensures the backend starts reliably
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Robust Backend for AkashShare...');

// Backend configuration
const backendDir = path.join(__dirname, 'backend');
const backendScript = path.join(backendDir, 'simple-backend.js');
const PORT = 5005;

// Check if backend directory exists
if (!fs.existsSync(backendDir)) {
  console.error('❌ Backend directory not found:', backendDir);
  process.exit(1);
}

// Check if backend script exists
if (!fs.existsSync(backendScript)) {
  console.error('❌ Backend script not found:', backendScript);
  process.exit(1);
}

console.log('📁 Backend directory:', backendDir);
console.log('📄 Backend script:', backendScript);

// Function to start backend process
function startBackend() {
  console.log('🔄 Starting backend process...');
  
  const backendProcess = spawn('node', [`"${backendScript}"`], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: PORT.toString(),
      HOST: '0.0.0.0'
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    windowsHide: true
  });

  // Handle backend output
  backendProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[Backend] ${output}`);
  });

  backendProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString().trim();
    console.error(`[Backend Error] ${errorOutput}`);
  });

  // Handle backend process events
  backendProcess.on('error', (error) => {
    console.error('❌ Failed to start backend process:', error.message);
  });

  backendProcess.on('close', (code, signal) => {
    console.log(`🔧 Backend process exited with code ${code} and signal ${signal}`);
    if (code !== 0) {
      console.log('🔄 Backend crashed, will attempt restart in 5 seconds...');
      setTimeout(() => {
        startBackend();
      }, 5000);
    }
  });

  return backendProcess;
}

// Start the backend
const backendProcess = startBackend();

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down backend...');
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down backend...');
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill('SIGTERM');
  }
  process.exit(0);
});

console.log('✅ Robust backend starter initialized');
