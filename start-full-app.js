// Script to start the full application with proper port management
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

console.log('🚀 Starting Akash Share Full Application...');

// Function to kill processes on specific ports
async function killPortProcess(port) {
  try {
    if (process.platform === 'win32') {
      // Find and kill processes using the port on Windows
      const { stdout } = await exec(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = stdout.split('\n');
      
      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            console.log(`🔧 Killing process ${pid} using port ${port}`);
            try {
              await exec(`taskkill /PID ${pid} /F`);
              console.log(`✅ Successfully killed process ${pid}`);
            } catch (killError) {
              console.warn(`⚠️ Failed to kill process ${pid}:`, killError.message);
            }
          }
        }
      }
    } else {
      // For Unix-like systems
      const { stdout } = await exec(`lsof -i :${port} -t`);
      const pids = stdout.trim().split('\n').filter(pid => pid);
      
      for (const pid of pids) {
        if (pid) {
          console.log(`🔧 Killing process ${pid} using port ${port}`);
          try {
            await exec(`kill -9 ${pid}`);
            console.log(`✅ Successfully killed process ${pid}`);
          } catch (killError) {
            console.warn(`⚠️ Failed to kill process ${pid}:`, killError.message);
          }
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ No processes found using port ${port} or error occurred:`, error.message);
  }
}

// Function to start the backend server
function startBackend() {
  console.log('🔧 Starting backend server...');
  
  const backend = spawn('node', ['run-backend.js'], {
    stdio: 'inherit'
  });
  
  backend.on('error', (error) => {
    console.error('❌ Failed to start backend server:', error.message);
  });
  
  backend.on('close', (code) => {
    console.log(`🔧 Backend server process exited with code ${code}`);
  });
  
  return backend;
}

// Function to start the React development server
function startReact() {
  console.log('🔧 Starting React development server...');
  
  // Set environment variable to use a different port
  const env = {
    ...process.env,
    PORT: '3001' // Use port 3001 instead of 3000
  };
  
  const react = spawn('npm', ['start'], {
    env,
    stdio: 'inherit'
  });
  
  react.on('error', (error) => {
    console.error('❌ Failed to start React development server:', error.message);
  });
  
  react.on('close', (code) => {
    console.log(`🔧 React development server process exited with code ${code}`);
  });
  
  return react;
}

// Function to start Electron
function startElectron() {
  console.log('🔧 Starting Electron app...');
  
  const electron = spawn('electron', ['.'], {
    stdio: 'inherit'
  });
  
  electron.on('error', (error) => {
    console.error('❌ Failed to start Electron app:', error.message);
  });
  
  electron.on('close', (code) => {
    console.log(`🔧 Electron app process exited with code ${code}`);
  });
  
  return electron;
}

// Main function to start everything
async function startApp() {
  try {
    // Kill any processes using our required ports
    console.log('🔧 Checking for processes using required ports...');
    await killPortProcess(3000);
    await killPortProcess(3001);
    await killPortProcess(5002);
    
    // Wait a moment for ports to be freed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start backend server
    const backend = startBackend();
    
    // Wait a few seconds for backend to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Start React development server
    const react = startReact();
    
    // Wait for React to start
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Start Electron app
    const electron = startElectron();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('🛑 Received SIGINT. Shutting down...');
      backend.kill();
      react.kill();
      electron.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error starting application:', error.message);
    process.exit(1);
  }
}

// Start the application
startApp();