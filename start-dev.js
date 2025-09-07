// Script to start both backend and frontend for development
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Akash Share Development Environment...');

// Start the backend server
console.log('🔧 Starting backend server...');
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5002',
    HOST: 'localhost'
  }
});

backend.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data}`);
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
});

backend.on('close', (code) => {
  console.log(`[BACKEND] Process exited with code ${code}`);
});

// Give the backend a moment to start
setTimeout(() => {
  console.log('🔧 Starting frontend...');
  const frontend = spawn('npm', ['start'], {
    cwd: __dirname,
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      REACT_APP_API_URL: 'http://localhost:5002'
    }
  });

  frontend.stdout.on('data', (data) => {
    console.log(`[FRONTEND] ${data}`);
  });

  frontend.stderr.on('data', (data) => {
    console.error(`[FRONTEND ERROR] ${data}`);
  });

  frontend.on('error', (error) => {
    console.error('❌ Failed to start frontend:', error);
  });

  frontend.on('close', (code) => {
    console.log(`[FRONTEND] Process exited with code ${code}`);
  });
}, 3000);

console.log('⏳ Please wait for both backend and frontend to start...');
console.log('🔗 Backend will be available at http://localhost:5002');
console.log('🔗 Frontend will be available at http://localhost:3000');