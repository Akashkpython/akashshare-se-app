import http from 'http';

console.log('🧪 Testing packaged app components...\n');

// Test 1: Electron health endpoint
console.log('1. Testing Electron health endpoint...');
const healthOptions = {
  hostname: 'localhost',
  port: 5002,
  path: '/electron-health',
  method: 'GET',
  timeout: 5000
};

const healthReq = http.request(healthOptions, (res) => {
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      if (res.statusCode === 200 && jsonData.status === 'OK') {
        console.log('✅ Electron health endpoint: PASS');
        
        // Test 2: Health endpoint
        console.log('2. Testing health endpoint...');
        const healthCheckOptions = {
          hostname: 'localhost',
          port: 5002,
          path: '/health',
          method: 'GET',
          timeout: 5000
        };
        
        const healthCheckReq = http.request(healthCheckOptions, (res) => {
          let healthData = '';
          
          res.on('data', chunk => {
            healthData += chunk;
          });
          
          res.on('end', () => {
            try {
              const healthJson = JSON.parse(healthData);
              if (res.statusCode === 200 && healthJson.status === 'OK') {
                console.log('✅ Health endpoint: PASS');
                
                // Test 3: Main application
                console.log('3. Testing main application endpoint...');
                const mainOptions = {
                  hostname: 'localhost',
                  port: 5002,
                  path: '/',
                  method: 'GET',
                  timeout: 5000
                };
                
                const mainReq = http.request(mainOptions, (res) => {
                  if (res.statusCode === 200) {
                    console.log('✅ Main application endpoint: PASS');
                    console.log('\n🎉 All tests passed! The packaged application is working correctly.');
                  } else {
                    console.log('❌ Main application endpoint: FAIL (Status:', res.statusCode, ')');
                  }
                });
                
                mainReq.on('error', (error) => {
                  console.log('❌ Main application endpoint: FAIL (Error:', error.message, ')');
                });
                
                mainReq.end();
              } else {
                console.log('❌ Health endpoint: FAIL (Status:', res.statusCode, ')');
              }
            } catch (parseError) {
              console.log('❌ Health endpoint: FAIL (Parse error:', parseError.message, ')');
            }
          });
        });
        
        healthCheckReq.on('error', (error) => {
          console.log('❌ Health endpoint: FAIL (Error:', error.message, ')');
        });
        
        healthCheckReq.end();
      } else {
        console.log('❌ Electron health endpoint: FAIL (Status:', res.statusCode, ')');
      }
    } catch (parseError) {
      console.log('❌ Electron health endpoint: FAIL (Parse error:', parseError.message, ')');
    }
  });
});

healthReq.on('error', (error) => {
  console.log('❌ Electron health endpoint: FAIL (Error:', error.message, ')');
});

healthReq.end();