#!/usr/bin/env node

/**
 * Fixed startup script for Akash Share application
 * This script properly manages the startup sequence to avoid the issues:
 * 1. Backend server crash due to connection failure
 * 2. PowerShell syntax errors
 * 3. React server IPv6 binding issues
 * 4. Multiple Electron processes
 * 5. Memory leaks
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

// Function to kill processes on a specific port (cross-platform)
async function killPortProcesses(port) {
  console.log(`🔍 Checking for processes on port ${port}...`);
  
  try {
    if (process.platform === 'win32') {
      // Windows implementation
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`, { timeout: 5000 });
      const lines = stdout.split('\n').filter(line => line.trim());
      let processesKilled = 0;
      
      for (const line of lines) {
        if (line.includes(`:${port}`) && line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid) && pid !== '0') {
            console.log(`🔧 Found process ${pid} using port ${port}`);
            try {
              await execAsync(`taskkill /PID ${pid} /F`, { timeout: 3000 });
              console.log(`✅ Force killed process ${pid}`);
              processesKilled++;
            } catch (error) {
              console.warn(`⚠️ Failed to kill process ${pid}:`, error.message);
            }
          }
        }
      }
      
      if (processesKilled > 0) {
        console.log(`✅ Killed ${processesKilled} process(es) using port ${port}`);
      } else {
        console.log(`✅ Port ${port} is already free.`);
      }
    } else {
      // Unix/Linux/macOS implementation
      try {
        const { stdout } = await execAsync(`lsof -i :${port} -t`, { timeout: 5000 });
        const pids = stdout.split('\n').filter(pid => pid && !isNaN(pid));
        
        if (pids.length > 0) {
          console.log(`🔧 Found ${pids.length} process(es) using port ${port}`);
          
          for (const pid of pids) {
            console.log(`🔧 Killing process ${pid} using port ${port}`);
            try {
              process.kill(pid, 'SIGKILL');
              console.log(`✅ Force killed process ${pid}`);
            } catch (error) {
              console.warn(`⚠️ Failed to kill process ${pid}:`, error.message);
            }
          }
        } else {
          console.log(`✅ Port ${port} is already free.`);
        }
      } catch (error) {
        console.log(`✅ Port ${port} is already free or no processes found.`);
      }
    }
  } catch (error) {
    console.log(`✅ Port ${port} is already free or no processes found.`);
  }
}

// Function to check if backend is running
async function checkBackendHealth() {
  return new Promise((resolve) => {
    const http = require('http');
    
    const options = {
      hostname: 'localhost',
      port: 5004,
      path: '/health',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200 && jsonData.status === 'OK') {
            console.log('✅ Backend health check successful');
            resolve(true);
          } else {
            console.log(`⚠️ Backend health check returned status ${res.statusCode}`);
            resolve(false);
          }
        } catch (parseError) {
          console.log('⚠️ Backend health check failed to parse response');
          resolve(false);
        }
      });
    });
    
    req.on('error', (_error) => {
      console.log('⚠️ Backend health check failed - backend may not be running');
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('⚠️ Backend health check timed out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Function to start backend server
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Starting backend server...');
    
    const backendDir = path.join(__dirname, 'backend');
    const backendEnv = {
      ...process.env,
      HOST: '0.0.0.0',
      PORT: '5004',
      NODE_ENV: 'development'
    };
    
    const backendProcess = spawn('node', ['server.js'], {
      cwd: backendDir,
      env: backendEnv,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Handle backend process output
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      console.log(`[Backend] ${output}`);
      
      // Check for startup success
      if (output.includes('Server running on') || output.includes('🚀 Server running')) {
        console.log('✅ Backend server started successfully');
        resolve(backendProcess);
      }
    });
    
    backendProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString().trim();
      console.error(`[Backend Error] ${errorOutput}`);
    });
    
    backendProcess.on('error', (error) => {
      console.error('❌ Failed to start backend process:', error.message);
      reject(error);
    });
    
    // Timeout if backend doesn't start in 15 seconds
    setTimeout(() => {
      reject(new Error('Backend server startup timeout'));
    }, 15000);
  });
}

// Function to start Electron app
function startElectron() {
  console.log('🔧 Starting Electron application...');
  
  const electronProcess = spawn('npm', ['run', 'electron'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });
  
  electronProcess.on('error', (error) => {
    console.error('❌ Failed to start Electron process:', error.message);
  });
  
  return electronProcess;
}

// Main startup function
async function startApp() {
  console.log('========================================');
  console.log('🔧 Akash Share - Fixed Startup Script');
  console.log('========================================');
  
  try {
    // Kill any existing processes on ports 5004 and 3000
    console.log('🔧 Cleaning up existing processes...');
    await killPortProcesses(5004);
    await killPortProcesses(3000);
    
    // Wait a moment for ports to be freed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start backend server
    const backendProcess = await startBackend();
    
    // Wait a moment for backend to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verify backend is running
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      throw new Error('Backend failed health check');
    }
    
    console.log('🎉 Backend is healthy and ready!');
    
    // Start Electron app
    const electronProcess = startElectron();
    
    console.log('🎉 Akash Share started successfully!');
    console.log('');
    console.log('💡 If you encounter any issues:');
    console.log('   - Check that MongoDB is running');
    console.log('   - Verify your .env file in the backend directory');
    console.log('   - Ensure all dependencies are installed (npm install)');
    console.log('');
    
    // Handle process cleanup on exit
    process.on('SIGINT', () => {
      console.log('🔧 Shutting down...');
      if (backendProcess) {
        backendProcess.kill('SIGTERM');
      }
      if (electronProcess) {
        electronProcess.kill('SIGTERM');
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start Akash Share:', error.message);
    process.exit(1);
  }
}

// Run the startup function
startApp();