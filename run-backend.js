// Simple script to run the backend server directly
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Running Akash Share Backend Server...');

// Change to the backend directory and run the server
const backendPath = path.join(__dirname, 'backend');

// Set environment variables
const env = {
  ...process.env,
  HOST: 'localhost',
  PORT: '5002',
  NODE_ENV: 'development',
  START_SERVER: 'true'  // Ensure server starts
};

console.log('🔧 Backend path:', backendPath);

// Check if server.js exists
import { existsSync } from 'fs';
if (!existsSync(path.join(backendPath, 'server.js'))) {
  console.error('❌ server.js not found in backend directory');
  process.exit(1);
}

// Run the server directly
const server = spawn('node', ['server.js'], { 
  cwd: backendPath,
  env
});

server.stdout.on('data', (data) => {
  const output = data.toString().trim();
  // Only log non-empty lines
  if (output) {
    console.log('[BACKEND]', output);
  }
});

server.stderr.on('data', (data) => {
  const errorOutput = data.toString().trim();
  // Only log non-empty lines
  if (errorOutput) {
    console.error('[BACKEND ERROR]', errorOutput);
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error.message);
});

server.on('close', (code) => {
  console.log(`🔧 Backend server process exited with code ${code}`);
  if (code !== 0) {
    console.log('⚠️ Backend server exited unexpectedly');
  }
});

// Keep the script running
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT. Shutting down...');
  server.kill();
  process.exit(0);
});

console.log('🔧 Backend server started. Press Ctrl+C to stop.');