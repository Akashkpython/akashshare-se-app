#!/usr/bin/env node

/**
 * Script to verify the backend fix is working correctly
 */

import http from 'http';

console.log('🔍 Verifying backend fix...');

// Check if backend is running on port 5004
const options = {
  hostname: 'localhost',
  port: 5004,
  path: '/health',
  method: 'GET',
  timeout: 5000
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
        console.log('✅ Backend is running correctly on port 5004');
        console.log(`   Host: ${jsonData.system.platform}`);
        console.log(`   Node Version: ${jsonData.system.nodeVersion}`);
        console.log(`   Environment: ${jsonData.system.environment}`);
        console.log(`   Database Connected: ${jsonData.database.connected}`);
        
        // Check WebSocket status
        if (jsonData.websocket) {
          console.log(`   WebSocket Clients: ${jsonData.websocket.totalClients}`);
          console.log(`   WebSocket Rooms: ${jsonData.websocket.totalRooms}`);
        }
        
        process.exit(0);
      } else {
        console.log('❌ Backend health check failed');
        console.log(`   Status Code: ${res.statusCode}`);
        console.log(`   Response: ${data}`);
        process.exit(1);
      }
    } catch (parseError) {
      console.log('❌ Failed to parse backend response');
      console.log(`   Error: ${parseError.message}`);
      console.log(`   Response: ${data}`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Backend is not running or not accessible');
  console.log(`   Error: ${error.message}`);
  console.log('');
  console.log('💡 To fix this issue:');
  console.log('   1. Run the fixed startup script: npm run start:fixed');
  console.log('   2. Or manually start the backend: cd backend && node server.js');
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Backend health check timed out');
  req.destroy();
  process.exit(1);
});

req.end();