#!/usr/bin/env node

// Script to start both backend and frontend for easier development
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import net from 'net';
import { fileURLToPath } from 'url';

// For ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Akash Share Full Application...');
console.log('========================================');

// Function to check if a port is in use
function checkPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => {
        resolve(true); // Port is in use
      })
      .once('listening', () => {
        tester.once('close', () => {
          resolve(false); // Port is available
        }).close();
      })
      .listen(port, '127.0.0.1');
  });
}

// Function to wait for a service to be ready
function waitForService(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error('Service timeout'));
        return;
      }
      
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          setTimeout(check, 1000);
        }
      }).on('error', () => {
        setTimeout(check, 1000);
      });
    };
    
    check();
  });
}

// Start backend server
async function startBackend() {
  console.log('🔧 Starting backend server...');
  
  // Check if port 5002 is already in use
  const portInUse = await checkPortInUse(5002);
  if (portInUse) {
    console.error('❌ Port 5002 is already in use. Please terminate the process using this port.');
    console.error('   You can find the process with: netstat -ano | findstr :5002');
    console.error('   Then terminate it with: taskkill /F /PID <process_id>');
    process.exit(1);
  }
  
  const backendProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    env: { ...process.env }
  });

  backendProcess.on('error', (error) => {
    console.error('❌ Failed to start backend server:', error.message);
    process.exit(1);
  });

  backendProcess.on('close', (code) => {
    console.log(`🔧 Backend server exited with code ${code}`);
    if (code !== 0) {
      console.error('❌ Backend server failed to start properly');
      process.exit(code);
    }
  });
  
  // Wait for backend to be ready
  try {
    await waitForService('http://localhost:5002/health', 30000);
    console.log('✅ Backend server is ready');
    return backendProcess;
  } catch (error) {
    console.error('❌ Backend server failed to start within timeout period');
    backendProcess.kill();
    process.exit(1);
  }
}

// Start frontend application
function startFrontend() {
  console.log('🖥️  Starting frontend application...');
  // Use npx instead of npm to avoid PATH issues
  const frontendProcess = spawn('npx', ['react-scripts', 'start'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true // Use shell to ensure proper command execution
  });

  frontendProcess.on('error', (error) => {
    console.error('❌ Failed to start frontend application:', error.message);
  });

  frontendProcess.on('close', (code) => {
    console.log(`🖥️  Frontend application exited with code ${code}`);
  });
  
  return frontendProcess;
}

// Main execution
async function main() {
  try {
    // Check if ports are available before starting
    const backendPortInUse = await checkPortInUse(5002);
    if (backendPortInUse) {
      console.error('❌ Port 5002 is already in use. Please terminate the process using this port.');
      console.error('   You can find the process with: netstat -ano | findstr :5002');
      console.error('   Then terminate it with: taskkill /F /PID <process_id>');
      process.exit(1);
    }
    
    const frontendPortInUse = await checkPortInUse(3000);
    if (frontendPortInUse) {
      console.error('❌ Port 3000 is already in use. Please terminate the process using this port.');
      console.error('   You can find the process with: netstat -ano | findstr :3000');
      console.error('   Then terminate it with: taskkill /F /PID <process_id>');
      process.exit(1);
    }
    
    // Start backend first
    const backendProcess = await startBackend();
    
    // Wait a bit for backend to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Start frontend
    const frontendProcess = startFrontend();
    
    // Handle process termination
    const cleanup = () => {
      console.log('\n🛑 Shutting down applications...');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
  } catch (error) {
    console.error('❌ Error starting application:', error.message);
    process.exit(1);
  }
}

main();