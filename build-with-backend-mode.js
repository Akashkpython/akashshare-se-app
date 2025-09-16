#!/usr/bin/env node

/**
 * Build script for Akash Share with selectable backend mode
 */

import { spawn } from 'child_process';

// Get backend mode from command line arguments or default to public
const backendMode = process.argv[2] || 'public';

// Validate backend mode
if (!['public', 'local'].includes(backendMode)) {
  console.error('❌ Invalid backend mode. Use "public" or "local"');
  process.exit(1);
}

console.log(`🏗️  Building Akash Share with ${backendMode} backend mode...`);

// Function to run a command
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { 
      stdio: 'inherit', 
      shell: true,
      ...options
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    proc.on('error', (error) => {
      reject(error);
    });
  });
}

// Build process
async function buildWithBackendMode() {
  try {
    // Set environment variable for backend mode
    process.env.BACKEND_MODE = backendMode;
    process.env.REACT_APP_DEFAULT_BACKEND = backendMode;
    
    console.log('🔧 Setting environment variables...');
    console.log(`   BACKEND_MODE=${backendMode}`);
    console.log(`   REACT_APP_DEFAULT_BACKEND=${backendMode}`);
    
    // Build the React app
    console.log('\n⚛️  Building React frontend...');
    await runCommand('npm', ['run', 'build']);
    
    // Copy Electron files
    console.log('\n🔄 Copying Electron files...');
    await runCommand('npm', ['run', 'electron:copy']);
    
    // Build the Electron app
    console.log('\n📦 Building Electron app...');
    await runCommand('electron-builder', ['--publish=never']);
    
    console.log('\n✅ Build completed successfully!');
    console.log(`📁 Installer location: dist/AkashShare-1.0.5-Setup.exe`);
    console.log(`⚙️  Backend mode: ${backendMode}`);
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run build if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildWithBackendMode();
}

export default buildWithBackendMode;