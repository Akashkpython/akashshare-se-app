import { spawn } from 'child_process';
import path from 'path';
import http from 'http';

console.log('🚀 Launching Akash Share app for testing...');

// Path to the packaged application executable
const appPath = path.join('dist', 'win-unpacked', 'Akash Share.exe');

// Launch the application
const appProcess = spawn(appPath, {
  cwd: process.cwd(),
  stdio: 'ignore' // We don't need to see the app's output
});

let appStarted = false;

appProcess.on('error', (error) => {
  console.error('❌ Failed to launch app:', error.message);
  process.exit(1);
});

appProcess.on('spawn', () => {
  console.log('✅ App process started successfully');
});

// Test the app after a delay to allow it to start
setTimeout(() => {
  console.log('🔍 Testing app connectivity...');
  
  // Test Electron health endpoint
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
          console.log('✅ App backend is running');
          console.log('📊 Backend info:', {
            port: jsonData.port,
            host: jsonData.host
          });
          
          // Test main application
          const mainOptions = {
            hostname: 'localhost',
            port: 5002,
            path: '/',
            method: 'GET',
            timeout: 5000
          };

          const mainReq = http.request(mainOptions, (res) => {
            console.log(`📊 Main app status: ${res.statusCode}`);
            
            if (res.statusCode === 200) {
              console.log('✅ Main application is accessible');
              console.log('✅ Window controls should be visible in the app');
              console.log('📋 The app is now running. You can test the window controls:');
              console.log('   - Minimize button (left)');  
              console.log('   - Maximize/Restore button (middle)');
              console.log('   - Close button (right)');
              console.log('⚠️  Press Ctrl+C to stop the app when you\'re done testing');
            } else {
              console.log('❌ Main application is not accessible');
              appProcess.kill();
              process.exit(1);
            }
          });

          mainReq.on('error', (error) => {
            console.log('❌ Error accessing main app:', error.message);
            appProcess.kill();
            process.exit(1);
          });

          mainReq.end();
        } else {
          console.log('❌ App backend is not responding correctly');
          appProcess.kill();
          process.exit(1);
        }
      } catch (parseError) {
        console.log('❌ Failed to parse response:', parseError.message);
        appProcess.kill();
        process.exit(1);
      }
    });
  });

  healthReq.on('error', (error) => {
    console.log('❌ App backend is not accessible:', error.message);
    appProcess.kill();
    process.exit(1);
  });

  healthReq.on('timeout', () => {
    console.log('❌ App backend connection timed out');
    healthReq.destroy();
    appProcess.kill();
    process.exit(1);
  });

  healthReq.end();
}, 10000); // Wait 10 seconds for the app to start

// Handle Ctrl+C to gracefully shut down the app
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down app...');
  appProcess.kill();
  process.exit(0);
});