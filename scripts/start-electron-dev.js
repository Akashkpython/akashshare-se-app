// Script to start both backend and frontend for Electron development
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Akash Share Electron Development Environment...');

// Start the backend server first
console.log('🔧 Starting backend server on port 5003...');
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '../backend'),
  stdio: 'pipe',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5003',
    HOST: 'localhost'
  }
});

let backendStarted = false;
let frontendStarted = false;

backend.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`[BACKEND] ${output}`);
  
  // Check if backend has started successfully
  if (!backendStarted && (output.includes('Server running on') || output.includes('🚀 Server running'))) {
    console.log('✅ Backend server started successfully on port 5003');
    backendStarted = true;
    // Now start the frontend
    startFrontend();
  }
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

// Function to start frontend after backend is ready
function startFrontend() {
  if (frontendStarted) return;
  
  console.log('🔧 Starting frontend on port 5002...');
  
  // Try to find npm in different ways
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  
  const frontend = spawn(npmCommand, ['start'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '5002',
      REACT_APP_API_URL: 'http://localhost:5003'
    }
  });

  frontend.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[FRONTEND] ${output}`);
    
    // Check if frontend has started successfully
    if (!frontendStarted && (output.includes('Local:') || output.includes('http://localhost:5002'))) {
      console.log('✅ Frontend started successfully on port 5002');
      frontendStarted = true;
      console.log('🎉 Both frontend and backend are now running!');
      console.log('🔗 Frontend: http://localhost:5002');
      console.log('🔗 Backend: http://localhost:5003');
      console.log('🔗 WebSocket: ws://localhost:5003/chat');
    }
  });

  frontend.stderr.on('data', (data) => {
    console.error(`[FRONTEND ERROR] ${data}`);
  });

  frontend.on('error', (error) => {
    console.error('❌ Failed to start frontend:', error);
    
    // Try alternative method using cross-env
    console.log('🔧 Trying alternative method with cross-env...');
    const frontendAlt = spawn('npx', ['cross-env', 'PORT=5002', 'react-scripts', 'start'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        REACT_APP_API_URL: 'http://localhost:5003'
      }
    });
    
    frontendAlt.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[FRONTEND ALT] ${output}`);
      
      // Check if frontend has started successfully
      if (!frontendStarted && (output.includes('Local:') || output.includes('http://localhost:5002'))) {
        console.log('✅ Frontend started successfully on port 5002 (alternative method)');
        frontendStarted = true;
        console.log('🎉 Both frontend and backend are now running!');
        console.log('🔗 Frontend: http://localhost:5002');
        console.log('🔗 Backend: http://localhost:5003');
        console.log('🔗 WebSocket: ws://localhost:5003/chat');
      }
    });
    
    frontendAlt.stderr.on('data', (data) => {
      console.error(`[FRONTEND ALT ERROR] ${data}`);
    });
    
    frontendAlt.on('error', (error) => {
      console.error('❌ Failed to start frontend (alternative method):', error);
    });
    
    frontendAlt.on('close', (code) => {
      console.log(`[FRONTEND ALT] Process exited with code ${code}`);
    });
  });

  frontend.on('close', (code) => {
    console.log(`[FRONTEND] Process exited with code ${code}`);
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development environment...');
  backend.kill();
  process.exit(0);
});

console.log('⏳ Please wait for both backend and frontend to start...');
console.log('🔗 Backend will be available at http://localhost:5003');
console.log('🔗 Frontend will be available at http://localhost:5002');