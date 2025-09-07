// Simple script to start the backend server for development
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Akash Share Backend Server...');

// Change to the backend directory
const backendPath = path.join(__dirname, 'backend');

// Spawn the backend server process
const backend = spawn('node', ['server.js'], {
  cwd: backendPath,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5002',
    HOST: 'localhost'
  }
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
});

backend.on('close', (code) => {
  console.log(`Backend server process exited with code ${code}`);
  if (code !== 0) {
    console.log('🔧 Restarting backend server in 5 seconds...');
    setTimeout(() => {
      console.log('🔄 Restarting...');
      import('./start-backend.js');
    }, 5000);
  }
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  backend.kill('SIGINT');
  process.exit(0);
});

console.log('🔧 Backend server started on port 5002');
console.log('💬 You can now use the group chat feature in the Electron app');
console.log('ℹ️  Press Ctrl+C to stop the server');