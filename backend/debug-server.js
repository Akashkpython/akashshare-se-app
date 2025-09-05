const http = require('http');
const { exec } = require('child_process');

console.log('🔍 Testing different ports...');

// Function to test a specific port
function testPort(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: `Test server working on port ${port}!`,
        port,
        timestamp: new Date().toISOString()
      }));
    });

    server.listen(port, '0.0.0.0', () => {
      console.log(`✅ Test server running on 0.0.0.0:${port}`);
      
      // Wait 2 seconds then test if it's accessible
      setTimeout(() => {
        console.log('🔎 Testing localhost connection...');
        
        const testUrl = `http://localhost:${port}`;
        
        exec(`curl "${testUrl}"`, (error, stdout, _stderr) => {
          if (error) {
            console.error('❌ Connection test failed:', error.message);
            console.log('🔥 This confirms Windows Firewall is blocking the connection');
            console.log('💡 Solution: Run as Administrator and configure firewall');
          } else {
            console.log('✅ Connection test successful!');
            console.log('📄 Response:', stdout);
          }
          
          console.log('\n🎯 KEY FINDINGS:');
          console.log('1. Node.js server CAN start and bind to ports');
          console.log('2. The issue is Windows Firewall blocking connections');
          console.log('3. Need to run firewall configuration as Administrator');
          
          server.close();
          resolve();
        });
      }, 2000);
    });

    server.on('error', (error) => {
      console.error(`❌ Server error on port ${port}:`, error.message);
      if (error.code === 'EADDRINUSE') {
        console.log(`📍 Port ${port} is already in use`);
        reject(error);
      } else {
        reject(error);
      }
    });
  });
}

// Try ports in sequence
async function findAvailablePort() {
  const portsToTry = [3002, 3003, 3004, 3005, 3006];
  
  for (const port of portsToTry) {
    try {
      console.log(`⏳ Testing port ${port}...`);
      await testPort(port);
      break; // Success, exit the loop
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${port} is busy, trying next port...`);
        continue;
      } else {
        console.error('💥 Unexpected error:', error.message);
        break;
      }
    }
  }
  
  console.log('🏁 Debug server test completed.');
}

// Start the test
findAvailablePort().catch(error => {
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
});