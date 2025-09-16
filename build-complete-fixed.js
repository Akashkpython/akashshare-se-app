import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Building complete Akash Share application...');

// Function to run a command and wait for it to complete
function runCommand(command, cwd = __dirname) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Running: ${command}`);
    
    const child = spawn(command, { 
      cwd, 
      shell: true,
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Function to ensure backend is properly configured
function ensureBackendConfig() {
  console.log('🔧 Ensuring backend configuration...');
  
  const backendDir = path.join(__dirname, 'backend');
  const envPath = path.join(backendDir, '.env');
  
  // Create .env file if it doesn't exist
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
  
  // Ensure backend dependencies are installed
  const nodeModulesPath = path.join(backendDir, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('🔧 Installing backend dependencies...');
    try {
      runCommand('npm install', backendDir);
      console.log('✅ Backend dependencies installed');
    } catch (error) {
      console.log('⚠️ Failed to install backend dependencies:', error.message);
    }
  }
}

// Main build function
async function main() {
  try {
    console.log('🚀 Starting complete build process...');
    
    // Ensure backend is properly configured
    ensureBackendConfig();
    
    // Run build setup script
    console.log('🔧 Running build setup...');
    await runCommand('node scripts/build-setup.js');
    
    // Build React frontend
    console.log('🔧 Building React frontend...');
    await runCommand('npm run build');
    
    // Copy Electron files
    console.log('🔧 Copying Electron files...');
    await runCommand('npm run electron:copy');
    
    // Build Electron app
    console.log('🔧 Building Electron application...');
    await runCommand('electron-builder --win --publish=never');
    
    console.log('🎉 Build completed successfully!');
    console.log('📁 Installer can be found in the dist/ directory');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
  }
}

// Run the build
main();