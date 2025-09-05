const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Akash Share Backend Integration...');

// Test 1: Check if backend directory exists
const backendDir = path.join(__dirname, 'backend');
const fs = require('fs');

if (!fs.existsSync(backendDir)) {
  console.error('❌ Backend directory not found');
  process.exit(1);
}

console.log('✅ Backend directory found');

// Test 2: Check if server.js exists
const serverPath = path.join(backendDir, 'server.js');
if (!fs.existsSync(serverPath)) {
  console.error('❌ server.js not found in backend directory');
  process.exit(1);
}

console.log('✅ server.js found');

// Test 3: Check if package.json exists
const packagePath = path.join(backendDir, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.error('❌ package.json not found in backend directory');
  process.exit(1);
}

console.log('✅ package.json found');

// Test 4: Try to start the backend server
console.log('🚀 Attempting to start backend server...');

const backendProcess = spawn('node', [serverPath], {
  cwd: backendDir,
  env: {
    ...process.env,
    NODE_ENV: 'test',
    PORT: '5002',
    HOST: 'localhost',
    MONGO_URI: 'mongodb://localhost:27017/akashshare_test',
    JWT_SECRET: 'test-secret-key'
  }
});

let serverStarted = false;

backendProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`[BACKEND] ${output}`);
  
  if (output.includes('Server running on') || output.includes('🚀 Server running')) {
    console.log('✅ Backend server started successfully');
    serverStarted = true;
    
    // Test basic endpoint
    setTimeout(() => {
      testEndpoint();
    }, 2000);
  }
});

backendProcess.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data}`);
});

backendProcess.on('close', (code) => {
  console.log(`[BACKEND] Process exited with code ${code}`);
});

// Set a timeout to kill the process
setTimeout(() => {
  if (serverStarted) {
    console.log('✅ Backend integration test passed');
  } else {
    console.log('⚠️ Backend server did not start within timeout period');
  }
  
  backendProcess.kill('SIGTERM');
  process.exit(serverStarted ? 0 : 1);
}, 15000);

// Test endpoint function
function testEndpoint() {
  const http = require('http');
  
  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`✅ HTTP request successful with status code: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      try {
        const data = JSON.parse(chunk);
        if (data.message && data.message.includes('Akash Share')) {
          console.log('✅ API endpoint returned expected response');
        } else {
          console.log('⚠️ API endpoint returned unexpected response');
        }
      } catch (e) {
        console.log('⚠️ Could not parse API response');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ HTTP request failed:', error.message);
  });
  
  req.end();
}