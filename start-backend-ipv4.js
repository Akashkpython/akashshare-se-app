// Start backend server with explicit IPv4 binding
import { spawn } from 'child_process';

console.log('🔧 Starting backend server with IPv4 binding...');

// Set environment variable to force IPv4
process.env.HOST = '127.0.0.1';

// Start the backend server
const backend = spawn('node', ['backend/server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    HOST: '127.0.0.1'
  }
});

backend.on('error', (error) => {
  console.error('❌ Backend server error:', error);
});

backend.on('close', (code) => {
  console.log(`🔌 Backend server exited with code ${code}`);
});
