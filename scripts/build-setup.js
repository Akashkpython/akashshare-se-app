/**
 * Enhanced Build Script for Akash Share Setup.exe
 * Ensures all dependencies and files are properly included
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Starting Akash Share Setup.exe Build Process...\n');

// Step 1: Clean previous builds
console.log('Step 1: Cleaning previous builds...');
const dirsToClean = ['dist', 'build'];
dirsToClean.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`🗑️ Removing ${dir} directory...`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// Step 2: Install dependencies
console.log('\nStep 2: Installing dependencies...');
try {
  console.log('📦 Installing frontend dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('📦 Installing backend dependencies...');
  execSync('cd backend && npm install', { stdio: 'inherit', shell: true });
  
  console.log('✅ Dependencies installed successfully!');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 3: Build React app
console.log('\nStep 3: Building React application...');
try {
  console.log('🔨 Building React app for production...');
  execSync('npm run build', { stdio: 'inherit' });
  
  if (!fs.existsSync('build/index.html')) {
    throw new Error('React build failed - no index.html found');
  }
  
  console.log('✅ React build completed successfully!');
} catch (error) {
  console.error('❌ React build failed:', error.message);
  process.exit(1);
}

// Step 4: Copy Electron files
console.log('\nStep 4: Copying Electron files...');
try {
  console.log('📋 Copying required files for packaging...');
  execSync('npm run electron:copy', { stdio: 'inherit' });
  console.log('✅ Electron files copied successfully!');
} catch (error) {
  console.error('❌ Failed to copy Electron files:', error.message);
  process.exit(1);
}

// Step 5: Create setup.exe
console.log('\nStep 5: Creating Windows Setup.exe...');
try {
  console.log('🏗️ Building Windows installer with electron-builder...');
  
  // Set environment variables
  process.env.NODE_ENV = 'production';
  process.env.GENERATE_SOURCEMAP = 'false';
  
  execSync('npm run dist', { stdio: 'inherit' });
  
  // Check if setup.exe was created
  const distDir = 'dist';
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    const exeFiles = files.filter(file => file.endsWith('.exe'));
    
    if (exeFiles.length > 0) {
      console.log('\n🎉 BUILD COMPLETE!');
      console.log('\n✅ Setup.exe created successfully!');
      console.log('\n📁 Output files in dist/ directory:');
      exeFiles.forEach(file => {
        const filePath = path.join(distDir, file);
        const stats = fs.statSync(filePath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`   - ${file} (${sizeInMB} MB)`);
      });
      
      console.log('\n🚀 Your Akash Share setup.exe is ready for distribution!');
      console.log('\n📋 Installation includes:');
      console.log('   - Desktop shortcut');
      console.log('   - Start menu shortcut');
      console.log('   - Automatic backend server startup');
      console.log('   - WebSocket chat functionality');
      console.log('   - File sharing capabilities');
      console.log('\n💡 To install: Run the setup.exe file');
      console.log('💡 To distribute: Share the setup.exe file');
    } else {
      throw new Error('No .exe files found in dist directory');
    }
  } else {
    throw new Error('Dist directory not created');
  }
} catch (error) {
  console.error('\n❌ Setup.exe creation failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Ensure all dependencies are installed');
  console.log('   2. Check that React build completed successfully');
  console.log('   3. Verify electron-builder is properly configured');
  console.log('   4. Try running: npm run dist');
  process.exit(1);
}
