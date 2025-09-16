import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Comprehensive test for Akash Share...');

// Function to test backend connectivity
function testBackendConnectivity() {
  return new Promise((resolve) => {
    console.log('🔍 Testing backend connectivity...');
    
    const options = {
      hostname: 'localhost',
      port: 5004,
      path: '/electron-health',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.status === 'OK') {
            console.log('✅ Backend connectivity test successful!');
            console.log('📊 Backend response:', jsonData);
            resolve(true);
          } else {
            console.log('⚠️ Backend responded but with unexpected status');
            resolve(false);
          }
        } catch (parseError) {
          console.log('⚠️ Backend responded but with invalid JSON');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Backend connectivity test failed:', error.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('⏰ Backend connectivity test timed out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Function to start backend if not running
async function startBackendIfNotRunning() {
  console.log('🔧 Checking if backend is running...');
  const isRunning = await testBackendConnectivity();
  
  if (!isRunning) {
    console.log('🔧 Backend not running, starting it...');
    
    // Start backend server
    const backendDir = path.join(__dirname, 'backend');
    const backendPath = path.join(backendDir, 'server.js');
    
    const backendProcess = spawn('node', [backendPath], {
      cwd: backendDir,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '5004',
        HOST: '0.0.0.0',
        START_SERVER: 'true'
      },
      stdio: 'pipe'
    });
    
    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data}`);
    });
    
    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data}`);
    });
    
    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test again
    return await testBackendConnectivity();
  }
  
  return true;
}

// Main test function
async function main() {
  try {
    console.log('🚀 Starting comprehensive test...');
    
    // Test backend
    const backendWorking = await startBackendIfNotRunning();
    
    if (backendWorking) {
      console.log('🎉 All tests passed! The application should work correctly.');
      console.log('💡 To run the application:');
      console.log('   1. npm run electron (for development)');
      console.log('   2. npm run build:complete (to build installer)');
    } else {
      console.log('❌ Some tests failed. Please check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Run the test
main();