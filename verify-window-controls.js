import http from 'http';

console.log('🔍 Testing window controls functionality...');

// Test if the backend is responding
const options = {
  hostname: 'localhost',
  port: 5004,
  path: '/electron-health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ Backend health check:', result.status);
      
      // Test window controls by making requests to the Electron app
      console.log('🔧 Window controls test:');
      console.log('   - Minimize: Not directly testable via HTTP');
      console.log('   - Maximize: Not directly testable via HTTP');
      console.log('   - Close: Not directly testable via HTTP');
      console.log('💡 Note: Window controls need to be tested in the UI');
      
      console.log('✅ All systems check complete');
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Backend connection failed:', error.message);
  console.log('💡 Make sure the backend server is running on port 5004');
});

req.end();
