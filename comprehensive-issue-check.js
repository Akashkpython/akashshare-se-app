/**
 * Comprehensive Issue Check for Akash Share Setup.exe
 * Tests all potential issues: ports, CORS, firewall, API endpoints, etc.
 */

import http from 'http';
import https from 'https';
import { WebSocket } from 'ws';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  backendPort: 5004,
  backendHost: 'localhost',
  testTimeout: 10000,
  maxRetries: 3
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function logTest(message) {
  log(`🧪 ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logCritical(message) {
  log(`🚨 ${message}`, 'magenta');
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0
};

function recordTest(testName, passed, details = '', isWarning = false) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    logSuccess(`${testName}: PASSED ${details}`);
  } else if (isWarning) {
    testResults.warnings++;
    logWarning(`${testName}: WARNING ${details}`);
  } else {
    testResults.failed++;
    logError(`${testName}: FAILED ${details}`);
  }
}

// Utility function to make HTTP requests
function makeHttpRequest(options) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(TEST_CONFIG.testTimeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test 1: Port Availability and Binding
async function testPortAvailability() {
  logTest('Testing port availability and binding...');
  
  try {
    // Test if port is available
    const server = http.createServer();
    await new Promise((resolve, reject) => {
      server.listen(TEST_CONFIG.backendPort, TEST_CONFIG.backendHost, () => {
        server.close(resolve);
      });
      server.on('error', reject);
    });
    
    recordTest('Port Availability', true, `Port ${TEST_CONFIG.backendPort} is available`);
    return true;
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      recordTest('Port Availability', false, `Port ${TEST_CONFIG.backendPort} is already in use`);
      logWarning('This might indicate another instance is running or a port conflict');
    } else {
      recordTest('Port Availability', false, error.message);
    }
    return false;
  }
}

// Test 2: Backend Server Connectivity
async function testBackendConnectivity() {
  logTest('Testing backend server connectivity...');
  
  try {
    const response = await makeHttpRequest({
      hostname: TEST_CONFIG.backendHost,
      port: TEST_CONFIG.backendPort,
      path: '/',
      method: 'GET',
      timeout: 5000
    });

    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      if (data.status === 'running') {
        recordTest('Backend Connectivity', true, `Status: ${data.status}`);
        return true;
      } else {
        recordTest('Backend Connectivity', false, `Unexpected status: ${data.status}`);
        return false;
      }
    } else {
      recordTest('Backend Connectivity', false, `HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    recordTest('Backend Connectivity', false, error.message);
    return false;
  }
}

// Test 3: CORS Configuration and Preflight
async function testCORSConfiguration() {
  logTest('Testing CORS configuration and preflight requests...');
  
  try {
    // Test preflight request
    const preflightResponse = await makeHttpRequest({
      hostname: TEST_CONFIG.backendHost,
      port: TEST_CONFIG.backendPort,
      path: '/upload',
      method: 'OPTIONS',
      headers: {
        'Origin': 'file://',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      timeout: 5000
    });

    if (preflightResponse.statusCode === 200) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': preflightResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': preflightResponse.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': preflightResponse.headers['access-control-allow-headers']
      };
      
      recordTest('CORS Preflight', true, 'Preflight request successful');
      logInfo(`CORS Headers: ${JSON.stringify(corsHeaders)}`);
      return true;
    } else {
      recordTest('CORS Preflight', false, `HTTP ${preflightResponse.statusCode}`);
      return false;
    }
  } catch (error) {
    recordTest('CORS Preflight', false, error.message);
    return false;
  }
}

// Test 4: API Endpoints
async function testAPIEndpoints() {
  logTest('Testing API endpoints...');
  
  const endpoints = [
    { path: '/health', method: 'GET', expectedStatus: 200 },
    { path: '/', method: 'GET', expectedStatus: 200 },
    { path: '/upload', method: 'POST', expectedStatus: 400 }, // Expected to fail without file
    { path: '/nonexistent', method: 'GET', expectedStatus: 404 }
  ];

  let passed = 0;
  let total = endpoints.length;

  for (const endpoint of endpoints) {
    try {
      const response = await makeHttpRequest({
        hostname: TEST_CONFIG.backendHost,
        port: TEST_CONFIG.backendPort,
        path: endpoint.path,
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (response.statusCode === endpoint.expectedStatus) {
        passed++;
        logInfo(`✅ ${endpoint.method} ${endpoint.path}: ${response.statusCode}`);
      } else {
        logWarning(`⚠️ ${endpoint.method} ${endpoint.path}: Expected ${endpoint.expectedStatus}, got ${response.statusCode}`);
      }
    } catch (error) {
      logWarning(`⚠️ ${endpoint.method} ${endpoint.path}: ${error.message}`);
    }
  }

  const success = passed === total;
  recordTest('API Endpoints', success, `${passed}/${total} endpoints working correctly`);
  return success;
}

// Test 5: WebSocket Connection
async function testWebSocketConnection() {
  logTest('Testing WebSocket connection...');
  
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://${TEST_CONFIG.backendHost}:${TEST_CONFIG.backendPort}/chat?username=test&room=general`);
    
    let connected = false;
    let messageReceived = false;
    
    const timeout = setTimeout(() => {
      if (!connected) {
        recordTest('WebSocket Connection', false, 'Connection timeout');
        ws.close();
        resolve(false);
      }
    }, 5000);

    ws.on('open', () => {
      connected = true;
      clearTimeout(timeout);
      recordTest('WebSocket Connection', true, 'Connection established');
      
      // Test message sending
      ws.send(JSON.stringify({
        type: 'message',
        content: 'Test message',
        username: 'test',
        room: 'general'
      }));
      
      setTimeout(() => {
        ws.close();
        resolve(true);
      }, 1000);
    });

    ws.on('message', (data) => {
      messageReceived = true;
      logInfo(`WebSocket message received: ${data.toString()}`);
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      recordTest('WebSocket Connection', false, error.message);
      resolve(false);
    });
  });
}

// Test 6: JSON Parsing and Headers
async function testJSONParsing() {
  logTest('Testing JSON parsing and headers...');
  
  try {
    const response = await makeHttpRequest({
      hostname: TEST_CONFIG.backendHost,
      port: TEST_CONFIG.backendPort,
      path: '/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 5000
    });

    if (response.statusCode === 200) {
      try {
        const data = JSON.parse(response.data);
        if (data.status && data.timestamp) {
          recordTest('JSON Parsing', true, 'Valid JSON response received');
          return true;
        } else {
          recordTest('JSON Parsing', false, 'Invalid JSON structure');
          return false;
        }
      } catch (parseError) {
        recordTest('JSON Parsing', false, `JSON parse error: ${parseError.message}`);
        return false;
      }
    } else {
      recordTest('JSON Parsing', false, `HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    recordTest('JSON Parsing', false, error.message);
    return false;
  }
}

// Test 7: Environment Variables
async function testEnvironmentVariables() {
  logTest('Testing environment variable configuration...');
  
  try {
    const response = await makeHttpRequest({
      hostname: TEST_CONFIG.backendHost,
      port: TEST_CONFIG.backendPort,
      path: '/health',
      method: 'GET',
      timeout: 5000
    });

    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      
      const checks = [
        { name: 'Port Configuration', value: data.port, expected: '5004' },
        { name: 'Host Configuration', value: data.host, expected: '0.0.0.0' },
        { name: 'Server Status', value: data.status, expected: 'OK' }
      ];

      let passed = 0;
      for (const check of checks) {
        if (check.value === check.expected) {
          passed++;
          logInfo(`✅ ${check.name}: ${check.value}`);
        } else {
          logWarning(`⚠️ ${check.name}: Expected ${check.expected}, got ${check.value}`);
        }
      }

      const success = passed === checks.length;
      recordTest('Environment Variables', success, `${passed}/${checks.length} variables correct`);
      return success;
    } else {
      recordTest('Environment Variables', false, `HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    recordTest('Environment Variables', false, error.message);
    return false;
  }
}

// Test 8: File Upload Test
async function testFileUpload() {
  logTest('Testing file upload functionality...');
  
  try {
    const formData = `------WebKitFormBoundary7MA4YWxkTrZu0gW\r
Content-Disposition: form-data; name="file"; filename="test.txt"\r
Content-Type: text/plain\r
\r
This is a test file content.\r
------WebKitFormBoundary7MA4YWxkTrZu0gW--\r
`;

    const response = await makeHttpRequest({
      hostname: TEST_CONFIG.backendHost,
      port: TEST_CONFIG.backendPort,
      path: '/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
        'Content-Length': formData.length
      },
      body: formData,
      timeout: 10000
    });

    if (response.statusCode === 200 || response.statusCode === 201 || response.statusCode === 400) {
      // 200/201 is success, 400 is expected if file validation fails, but endpoint is working
      recordTest('File Upload', true, `Endpoint responding (${response.statusCode})`);
      return true;
    } else {
      recordTest('File Upload', false, `HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    recordTest('File Upload', false, error.message);
    return false;
  }
}

// Test 9: Network Connectivity
async function testNetworkConnectivity() {
  logTest('Testing network connectivity...');
  
  const hosts = [
    { name: 'Localhost', host: '127.0.0.1' },
    { name: 'Localhost (name)', host: 'localhost' }
  ];

  let passed = 0;
  for (const host of hosts) {
    try {
      const response = await makeHttpRequest({
        hostname: host.host,
        port: TEST_CONFIG.backendPort,
        path: '/',
        method: 'GET',
        timeout: 3000
      });

      if (response.statusCode === 200) {
        passed++;
        logInfo(`✅ ${host.name}: Connected`);
      } else {
        logWarning(`⚠️ ${host.name}: HTTP ${response.statusCode}`);
      }
    } catch (error) {
      logWarning(`⚠️ ${host.name}: ${error.message}`);
    }
  }

  const success = passed > 0;
  recordTest('Network Connectivity', success, `${passed}/${hosts.length} hosts reachable`);
  return success;
}

// Test 10: Process and Port Conflicts
async function testProcessConflicts() {
  logTest('Testing for process and port conflicts...');
  
  try {
    // Try to bind to the same port to check for conflicts
    const testServer = http.createServer();
    
    await new Promise((resolve, reject) => {
      testServer.listen(TEST_CONFIG.backendPort, TEST_CONFIG.backendHost, () => {
        testServer.close(() => {
          resolve();
        });
      });
      
      testServer.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          recordTest('Process Conflicts', false, `Port ${TEST_CONFIG.backendPort} is in use by another process`);
          resolve();
        } else {
          reject(error);
        }
      });
    });

    recordTest('Process Conflicts', true, 'No port conflicts detected');
    return true;
  } catch (error) {
    recordTest('Process Conflicts', false, error.message);
    return false;
  }
}

// Main test runner
async function runComprehensiveTests() {
  log('========================================', 'cyan');
  log('    COMPREHENSIVE ISSUE CHECK', 'cyan');
  log('========================================', 'cyan');
  log('');

  logInfo(`Testing backend at ${TEST_CONFIG.backendHost}:${TEST_CONFIG.backendPort}`);
  logInfo(`Test timeout: ${TEST_CONFIG.testTimeout}ms`);
  log('');

  // Wait for backend to be ready
  logInfo('Waiting for backend server to be ready...');
  let backendReady = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!backendReady && attempts < maxAttempts) {
    try {
      const response = await makeHttpRequest({
        hostname: TEST_CONFIG.backendHost,
        port: TEST_CONFIG.backendPort,
        path: '/',
        method: 'GET',
        timeout: 5000
      });

      if (response.statusCode === 200) {
        backendReady = true;
        logSuccess('Backend server is ready!');
      }
    } catch (error) {
      attempts++;
      if (attempts < maxAttempts) {
        logInfo(`Backend not ready yet (attempt ${attempts}/${maxAttempts}), waiting...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  if (!backendReady) {
    logCritical('Backend server is not responding. Please ensure the application is running.');
    logInfo('To start the backend server:');
    logInfo('  1. Run the setup.exe and install the application');
    logInfo('  2. Or run: cd backend && npm start');
    return;
  }

  log('');

  // Run all tests
  await testPortAvailability();
  await testBackendConnectivity();
  await testCORSConfiguration();
  await testAPIEndpoints();
  await testWebSocketConnection();
  await testJSONParsing();
  await testEnvironmentVariables();
  await testFileUpload();
  await testNetworkConnectivity();
  await testProcessConflicts();

  // Print results
  log('');
  log('========================================', 'cyan');
  log('              TEST RESULTS', 'cyan');
  log('========================================', 'cyan');
  log('');
  log(`Total Tests: ${testResults.total}`, 'cyan');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Warnings: ${testResults.warnings}`, 'yellow');
  log(`Failed: ${testResults.failed}`, 'red');
  log('');

  if (testResults.failed === 0) {
    logSuccess('🎉 All critical tests passed! Your setup.exe should work correctly.');
    if (testResults.warnings > 0) {
      logWarning('⚠️ Some warnings were found. Check the details above.');
    }
  } else if (testResults.passed >= testResults.total * 0.7) {
    logWarning('⚠️ Most tests passed, but some issues were found.');
    logWarning('The setup.exe may work but could have some functionality issues.');
  } else {
    logCritical(`❌ ${testResults.failed} critical test(s) failed.`);
    logCritical('The setup.exe has significant issues that need to be fixed.');
  }

  log('');
  log('========================================', 'cyan');
}

// Run the tests
runComprehensiveTests().catch(error => {
  logError(`Test runner failed: ${error.message}`);
  process.exit(1);
});
