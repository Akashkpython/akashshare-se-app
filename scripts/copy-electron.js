import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-platform path utilities
const normalizePath = (inputPath) => path.normalize(inputPath);
const joinPath = (...paths) => path.join(...paths);
const isWindows = () => os.platform() === 'win32';

// Create build directory if it doesn't exist using cross-platform paths
const buildDir = joinPath(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log('📦 Copying required files for Electron build...');

try {
  // Copy main icon file to build directory (needed for packaging)
  const iconSource = path.join(__dirname, '..', 'public', 'Akashshareicon.png');
  const iconDest = path.join(buildDir, 'Akashshareicon.png');
  
  if (fs.existsSync(iconSource)) {
    fs.copyFileSync(iconSource, iconDest);
    console.log('✅ Copied Akashshareicon.png to build directory');
  } else {
    console.log('⚠️ Warning: Akashshareicon.png not found in public directory');
  }
  
  // Copy backup icon file to build directory
  const backupIconSource = path.join(__dirname, '..', 'public', 'Akashshareicon-backup.png');
  const backupIconDest = path.join(buildDir, 'Akashshareicon-backup.png');
  
  if (fs.existsSync(backupIconSource)) {
    fs.copyFileSync(backupIconSource, backupIconDest);
    console.log('✅ Copied Akashshareicon-backup.png to build directory');
  } else {
    console.log('⚠️ Warning: Akashshareicon-backup.png not found in public directory');
  }
  
  // Create backend directory in build if it doesn't exist
  const buildBackendDir = path.join(buildDir, 'backend');
  if (!fs.existsSync(buildBackendDir)) {
    fs.mkdirSync(buildBackendDir, { recursive: true });
  }
  
  // Copy essential backend files
  const backendFiles = [
    'server.js',
    'package.json',
    '.env.example'
  ];
  
  backendFiles.forEach(file => {
    const source = path.join(__dirname, '..', 'backend', file);
    const dest = path.join(buildBackendDir, file);
    
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, dest);
      console.log(`✅ Copied ${file} to build/backend/`);
    } else {
      console.log(`⚠️ Warning: ${file} not found in backend directory`);
    }
  });
  
  // Create uploads directory in build/backend
  const buildUploadsDir = path.join(buildBackendDir, 'uploads');
  if (!fs.existsSync(buildUploadsDir)) {
    fs.mkdirSync(buildUploadsDir, { recursive: true });
    console.log('📁 Created build/backend/uploads directory');
  }
  
  // Copy all backend source files except node_modules and uploads
  const backendSourceDir = path.join(__dirname, '..', 'backend');
  const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
      // Skip node_modules and uploads directories
      if (path.basename(src) === 'node_modules' || path.basename(src) === 'uploads') {
        return;
      }
      
      fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(childItemName => {
        copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
      });
    } else {
      // Skip .env file as we already copied it above
      if (path.basename(src) !== '.env') {
        fs.copyFileSync(src, dest);
      }
    }
  };
  
  // Copy all backend files except node_modules and uploads
  fs.readdirSync(backendSourceDir).forEach(item => {
    if (item !== 'node_modules' && item !== 'uploads') {
      const srcPath = path.join(backendSourceDir, item);
      const destPath = path.join(buildBackendDir, item);
      copyRecursiveSync(srcPath, destPath);
      console.log(`✅ Copied ${item} to build/backend/`);
    }
  });

  // Copy backend node_modules to ensure packaged backend can run offline
  const backendNodeModulesSrc = path.join(backendSourceDir, 'node_modules');
  const backendNodeModulesDest = path.join(buildBackendDir, 'node_modules');
  if (fs.existsSync(backendNodeModulesSrc)) {
    console.log('📦 Copying backend node_modules (this may take a while)...');
    const copyDir = (src, dest) => {
      const stats = fs.statSync(src);
      if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src)) {
          // Skip npm cache and locks to reduce size
          if (entry === '.cache' || entry === '.bin') continue;
          copyDir(path.join(src, entry), path.join(dest, entry));
        }
      } else {
        fs.copyFileSync(src, dest);
      }
    };
    copyDir(backendNodeModulesSrc, backendNodeModulesDest);
    console.log('✅ Copied backend node_modules to build/backend/node_modules');
  } else {
    console.log('⚠️ backend/node_modules not found. Packaged backend may require online install.');
  }
  
  console.log('🎉 Required files copied successfully!');
  console.log('📝 Note: Using electron/main.js directly (no build/electron.js needed)');
  console.log('📝 Note: All dependencies from package.json will be included in the final package automatically');
  
} catch (error) {
  console.error('❌ Error copying files:', error.message);
  process.exit(1);
}