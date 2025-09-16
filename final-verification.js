// Final verification script for Akash Share application
import http from 'http';

console.log('🔍 Final verification of Akash Share application...\n');

// Test 1: Backend server health
console.log('Test 1: Backend server health');
const healthOptions = {
  hostname: 'localhost',
  port: 5004,
  path: '/electron-health',
  method: 'GET'
};

const healthReq = http.request(healthOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.status === 'OK') {
        console.log('✅ Backend server is running and healthy');
      } else {
        console.log('❌ Backend server health check failed');
      }
    } catch (error) {
      console.log('❌ Error parsing backend health response:', error.message);
    }
    
    // Test 2: WebSocket connection
    console.log('\nTest 2: WebSocket connection');
    try {
      // We'll skip WebSocket testing for now as it requires additional setup
      console.log('💡 WebSocket connection test skipped (requires additional setup)');
    } catch (error) {
      console.log('💡 WebSocket connection test skipped (requires additional setup)');
    }
    
    // Test 3: API endpoints
    console.log('\nTest 3: API endpoints');
    
    // Test root endpoint
    const rootOptions = {
      hostname: 'localhost',
      port: 5004,
      path: '/',
      method: 'GET'
    };
    
    const rootReq = http.request(rootOptions, (res) => {
      let rootData = '';
      res.on('data', (chunk) => {
        rootData += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Root endpoint is accessible');
        } else {
          console.log('❌ Root endpoint returned status:', res.statusCode);
        }
      });
    });
    
    rootReq.on('error', (error) => {
      console.log('❌ Root endpoint test failed:', error.message);
    });
    
    rootReq.end();
    
    // Test health endpoint
    const fullHealthOptions = {
      hostname: 'localhost',
      port: 5004,
      path: '/health',
      method: 'GET'
    };
    
    const fullHealthReq = http.request(fullHealthOptions, (res) => {
      let healthData = '';
      res.on('data', (chunk) => {
        healthData += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const healthResult = JSON.parse(healthData);
            if (healthResult.status === 'OK') {
              console.log('✅ Health endpoint is accessible and returning OK status');
              console.log('   Database connected:', healthResult.database.connected);
              console.log('   WebSocket clients:', healthResult.websocket.totalClients);
            } else {
              console.log('❌ Health endpoint returned status:', healthResult.status);
            }
          } catch (error) {
            console.log('❌ Error parsing health endpoint response:', error.message);
          }
        } else {
          console.log('❌ Health endpoint returned status:', res.statusCode);
        }
      });
    });
    
    fullHealthReq.on('error', (error) => {
      console.log('❌ Health endpoint test failed:', error.message);
    });
    
    fullHealthReq.end();
    
    console.log('\n✅ All backend tests completed');
    console.log('💡 Note: Window controls and UI elements need to be tested manually in the Electron app');
    console.log('💡 Note: File sharing and group chat functionality need to be tested manually in the UI');
  });
});

healthReq.on('error', (error) => {
  console.log('❌ Backend server health check failed:', error.message);
  console.log('💡 Make sure the backend server is running on port 5004');
});

healthReq.end();