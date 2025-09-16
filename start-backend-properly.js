import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Starting backend server properly...');

// Determine the correct path for the backend based on whether we're in a packaged app or development
let backendDir, backendPath;

// In development, backend is in the backend directory relative to project root
backendDir = path.join(__dirname, 'backend');
backendPath = path.join(backendDir, 'server.js');

console.log(`📁 Backend directory: ${backendDir}`);
console.log(`📁 Backend path: ${backendPath}`);

// Create environment variables for the backend process
const backendEnv = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: '5004',
  HOST: '0.0.0.0',
  START_SERVER: 'true'
};

console.log('🔧 Starting backend process...');

const backendProcess = spawn('node', [backendPath], {
  cwd: backendDir,
  env: backendEnv,
  stdio: 'inherit'
});

backendProcess.on('error', (error) => {
  console.error('❌ Failed to start backend process:', error);
});

backendProcess.on('close', (code) => {
  console.log(`🔧 Backend process exited with code ${code}`);
});

console.log('✅ Backend process started');