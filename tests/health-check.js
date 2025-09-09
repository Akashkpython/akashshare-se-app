#!/usr/bin/env node

// Comprehensive health check for AkAsH Share backend
const http = require('http');
const WebSocket = require('ws');

console.log('🧪 Starting AkAsH Share Health Check...');
console.log('==========================================');

let testsPassed = 0;
let testsFailed = 0;

function logTest(testName, passed, details = '') {
  if (passed) {
    console.log(`✅ ${testName}`);
    if (details) console.log(`   ${details}`);
    testsPassed++;
  } else {
    console.log(`❌ ${testName}`);
    if (details) console.log(`   ${details}`);
    testsFailed++;
  }
}

async function testBackendHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5002,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const passed = res.statusCode === 200 && json.status === 'OK';
          logTest('Backend Health Endpoint', passed, 
            passed ? `Server is healthy, uptime: ${json.uptime}s` : `Status: ${res.statusCode}`);
          resolve(passed);
        } catch (err) {
          logTest('Backend Health Endpoint', false, 'Invalid JSON response');
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      logTest('Backend Health Endpoint', false, `Connection failed: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      logTest('Backend Health Endpoint', false, 'Request timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function testWebSocketConnection() {
  return new Promise((resolve) => {
    const ws = new WebSocket('ws://localhost:5003/chat?username=HealthCheck&room=test');
    let connected = false;
    
    const timeout = setTimeout(() => {
      if (!connected) {
        logTest('WebSocket Connection', false, 'Connection timeout');
        ws.close();
        resolve(false);
      }
    }, 5000);

    ws.on('open', () => {
      connected = true;
      clearTimeout(timeout);
      logTest('WebSocket Connection', true, 'Successfully connected to chat server');
      
      // Test sending a message
      ws.send(JSON.stringify({
        type: 'message',
        message: 'Health check test message',
        room: 'test'
      }));
      
      setTimeout(() => {
        ws.close();
        resolve(true);
      }, 1000);
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      logTest('WebSocket Connection', false, `Connection error: ${err.message}`);
      resolve(false);
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        logTest('WebSocket Message Handling', true, `Received: ${message.type}`);
      } catch (err) {
        logTest('WebSocket Message Handling', false, 'Invalid message format');
      }
    });
  });
}

async function testAPIEndpoints() {
  const endpoints = [
    { path: '/health', name: 'Health Check' },
    { path: '/api/rooms', name: 'Chat Rooms API' }
  ];

  for (const endpoint of endpoints) {
    await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5003,
        path: endpoint.path,
        method: 'GET',
        timeout: 3000
      };

      const req = http.request(options, (res) => {
        const passed = res.statusCode < 500;
        logTest(`API Endpoint: ${endpoint.name}`, passed, 
          `Status: ${res.statusCode}`);
        resolve();
      });

      req.on('error', (err) => {
        logTest(`API Endpoint: ${endpoint.name}`, false, 
          `Error: ${err.message}`);
        resolve();
      });

      req.on('timeout', () => {
        logTest(`API Endpoint: ${endpoint.name}`, false, 'Timeout');
        req.destroy();
        resolve();
      });

      req.end();
    });
  }
}

async function testCORSHeaders() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5003,
      path: '/health',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5003',
        'Access-Control-Request-Method': 'GET'
      },
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      const corsHeader = res.headers['access-control-allow-origin'];
      const passed = corsHeader === '*' || corsHeader === 'http://localhost:5003';
      logTest('CORS Configuration', passed, 
        passed ? 'CORS headers properly configured' : 'CORS headers missing or incorrect');
      resolve(passed);
    });

    req.on('error', (err) => {
      logTest('CORS Configuration', false, `Error: ${err.message}`);
      resolve(false);
    });

    req.end();
  });
}

async function runAllTests() {
  console.log('🔍 Testing Backend Health...');
  await testBackendHealth();
  
  console.log('\n🔍 Testing WebSocket Connection...');
  await testWebSocketConnection();
  
  console.log('\n🔍 Testing API Endpoints...');
  await testAPIEndpoints();
  
  console.log('\n🔍 Testing CORS Configuration...');
  await testCORSHeaders();
  
  console.log('\n==========================================');
  console.log(`📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);
  
  if (testsFailed === 0) {
    console.log('🎉 All tests passed! AkAsH Share backend is healthy.');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed. Please check the backend configuration.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});

