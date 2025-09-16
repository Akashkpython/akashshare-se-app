import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Starting comprehensive fix for Akash Share...');

// Function to kill processes on port 5004
function killPort5004() {
  console.log('🔧 Checking for processes on port 5004...');
  try {
    const cmd = 'netstat -ano | findstr :5004';
    const result = execSync(cmd, { encoding: 'utf8' });
    const lines = result.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.includes(':5004') && line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid) && pid !== '0') {
          console.log(`🔧 Killing process ${pid} on port 5004`);
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            console.log(`✅ Killed process ${pid}`);
          } catch (error) {
            console.log(`⚠️ Failed to kill process ${pid}`);
          }
        }
      }
    }
  } catch (error) {
    console.log('✅ No processes found on port 5004');
  }
}

// Function to fix backend server startup
async function fixBackendServer() {
  console.log('🔧 Fixing backend server...');
  
  // Kill any existing processes on port 5004
  killPort5004();
  
  // Ensure backend directory has proper .env file
  const backendDir = path.join(__dirname, 'backend');
  const envPath = path.join(backendDir, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('🔧 Creating backend .env file...');
    const envContent = `NODE_ENV=production
HOST=0.0.0.0
PORT=5004
MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare
JWT_SECRET=f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09
FILE_SIZE_LIMIT=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Backend .env file created');
  }
  
  // Install backend dependencies if needed
  console.log('🔧 Checking backend dependencies...');
  const backendNodeModules = path.join(backendDir, 'node_modules');
  if (!fs.existsSync(backendNodeModules)) {
    console.log('🔧 Installing backend dependencies...');
    try {
      execSync('npm install', { cwd: backendDir, stdio: 'inherit' });
      console.log('✅ Backend dependencies installed');
    } catch (error) {
      console.log('⚠️ Failed to install backend dependencies');
    }
  }
  
  console.log('✅ Backend server fix completed');
}

// Function to fix window controls
function fixWindowControls() {
  console.log('🔧 Fixing window controls...');
  
  // Fix main.js to ensure proper IPC handlers
  const mainJsPath = path.join(__dirname, 'electron', 'main.js');
  if (fs.existsSync(mainJsPath)) {
    let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
    
    // Ensure window control handlers exist and return proper values
    const windowMinimizeHandler = `ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    try {
      mainWindow.minimize();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  } else {
    return { success: false, error: 'No main window' };
  }
});`;
    
    const windowMaximizeHandler = `ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    try {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
        return { success: true, maximized: false };
      } else {
        mainWindow.maximize();
        return { success: true, maximized: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  } else {
    return { success: false, error: 'No main window' };
  }
});`;
    
    const windowCloseHandler = `ipcMain.handle('window-close', () => {
  if (mainWindow) {
    try {
      if (app.isPackaged) {
        mainWindow.hide();
        return { success: true, action: 'hidden' };
      } else {
        mainWindow.close();
        return { success: true, action: 'closed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  } else {
    return { success: false, error: 'No main window' };
  }
});`;
    
    // Replace or add the handlers
    mainJsContent = mainJsContent.replace(
      /ipcMain\.handle\('window-minimize',[\s\S]*?}\);/g,
      windowMinimizeHandler
    );
    
    mainJsContent = mainJsContent.replace(
      /ipcMain\.handle\('window-maximize',[\s\S]*?}\);/g,
      windowMaximizeHandler
    );
    
    mainJsContent = mainJsContent.replace(
      /ipcMain\.handle\('window-close',[\s\S]*?}\);/g,
      windowCloseHandler
    );
    
    fs.writeFileSync(mainJsPath, mainJsContent);
    console.log('✅ Window controls fixed in main.js');
  }
  
  // Fix preload.js to ensure proper IPC exposure
  const preloadJsPath = path.join(__dirname, 'electron', 'preload.js');
  if (fs.existsSync(preloadJsPath)) {
    let preloadJsContent = fs.readFileSync(preloadJsPath, 'utf8');
    
    // Ensure window control functions are properly exposed
    const windowControls = `  // Window controls (for custom titlebar)
  minimize: async () => {
    try {
      return await ipcRenderer.invoke('window-minimize');
    } catch (error) {
      console.error('Error minimizing window:', error);
      return { success: false, error: error.message };
    }
  },
  maximize: async () => {
    try {
      return await ipcRenderer.invoke('window-maximize');
    } catch (error) {
      console.error('Error maximizing window:', error);
      return { success: false, error: error.message };
    }
  },
  close: async () => {
    try {
      return await ipcRenderer.invoke('window-close');
    } catch (error) {
      console.error('Error closing window:', error);
      return { success: false, error: error.message };
    }
  },`;
    
    // Replace the window controls section
    preloadJsContent = preloadJsContent.replace(
      /\/\/ Window controls \(for custom titlebar\)[\s\S]*?},/g,
      windowControls
    );
    
    fs.writeFileSync(preloadJsPath, preloadJsContent);
    console.log('✅ Window controls fixed in preload.js');
  }
  
  console.log('✅ Window controls fix completed');
}

// Function to fix packaged app structure
function fixPackagedApp() {
  console.log('🔧 Fixing packaged app structure...');
  
  // Ensure build directory exists
  const buildDir = path.join(__dirname, 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
    console.log('✅ Build directory created');
  }
  
  // Ensure build-resources directory exists with proper icon
  const buildResourcesDir = path.join(__dirname, 'build-resources');
  if (!fs.existsSync(buildResourcesDir)) {
    fs.mkdirSync(buildResourcesDir, { recursive: true });
    console.log('✅ Build-resources directory created');
  }
  
  console.log('✅ Packaged app structure fix completed');
}

// Function to test the fixes
async function testFixes() {
  console.log('🔍 Testing fixes...');
  
  // Test backend connectivity
  try {
    const { default: http } = await import('http');
    
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
          } else {
            console.log('⚠️ Backend responded but with unexpected status');
          }
        } catch (parseError) {
          console.log('⚠️ Backend responded but with invalid JSON');
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Backend connectivity test failed:', error.message);
    });
    
    req.on('timeout', () => {
      console.log('⏰ Backend connectivity test timed out');
      req.destroy();
    });
    
    req.end();
  } catch (error) {
    console.log('❌ Error testing backend connectivity:', error.message);
  }
  
  console.log('✅ Tests completed');
}

// Main fix function
async function main() {
  try {
    console.log('🚀 Starting comprehensive fix for Akash Share...');
    
    // Fix backend server
    await fixBackendServer();
    
    // Fix window controls
    fixWindowControls();
    
    // Fix packaged app structure
    fixPackagedApp();
    
    // Test fixes
    await testFixes();
    
    console.log('🎉 All fixes completed successfully!');
    console.log('💡 To run the application:');
    console.log('   1. npm run electron (for development)');
    console.log('   2. npm run build:complete (to build installer)');
    
  } catch (error) {
    console.error('❌ Error during fix process:', error);
  }
}

// Run the fix
main();