import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-platform path utilities
const joinPath = (...paths) => path.join(...paths);

// Create build directory if it doesn't exist using cross-platform paths
const buildDir = joinPath(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log('📦 Copying required files for Electron build...');

try {
  // Copy main icon file to build directory (needed for packaging)
  const iconSource = path.join(__dirname, '..', 'build-resources', 'icon.ico');
  const iconDest = path.join(buildDir, 'icon.ico');
  
  if (fs.existsSync(iconSource)) {
    fs.copyFileSync(iconSource, iconDest);
    console.log('✅ Copied icon.ico to build directory');
  } else {
    console.log('⚠️ Warning: icon.ico not found in build-resources directory');
  }
  
  // Copy favicon.ico to build directory
  const faviconSource = path.join(__dirname, '..', 'build-resources', 'icon.ico');
  const faviconDest = path.join(buildDir, 'favicon.ico');
  
  if (fs.existsSync(faviconSource)) {
    fs.copyFileSync(faviconSource, faviconDest);
    console.log('✅ Copied favicon.ico to build directory');
  } else {
    console.log('⚠️ Warning: favicon.ico not found in build-resources directory');
  }
  
  // Copy Electron main process file to build directory
  const electronSource = path.join(__dirname, '..', 'electron', 'main.js');
  const electronDest = path.join(buildDir, 'electron.js');
  
  if (fs.existsSync(electronSource)) {
    fs.copyFileSync(electronSource, electronDest);
    console.log('✅ Copied electron/main.js to build/electron.js');
  } else {
    console.log('⚠️ Warning: electron/main.js not found');
  }
  
  // Copy Electron preload script to build directory
  const preloadSource = path.join(__dirname, '..', 'electron', 'preload.js');
  const preloadDest = path.join(buildDir, 'preload.js');
  
  if (fs.existsSync(preloadSource)) {
    fs.copyFileSync(preloadSource, preloadDest);
    console.log('✅ Copied electron/preload.js to build/preload.js');
  } else {
    console.log('⚠️ Warning: electron/preload.js not found');
  }
  
  // Create backend directory in build if it doesn't exist
  const buildBackendDir = path.join(buildDir, 'backend');
  if (!fs.existsSync(buildBackendDir)) {
    fs.mkdirSync(buildBackendDir, { recursive: true });
  }
  
  // Copy essential backend files including the updated .env file
  const backendFiles = [
    'server.js',
    'package.json',
    '.env'  // This is the important file that contains your updated configuration
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
        // Skip test directories
        if (childItemName !== 'test') {
          copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        }
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
    if (item !== 'node_modules' && item !== 'uploads' && item !== 'test') {
      const srcPath = path.join(backendSourceDir, item);
      const destPath = path.join(buildBackendDir, item);
      copyRecursiveSync(srcPath, destPath);
      console.log(`✅ Copied ${item} to build/backend/`);
    }
  });

  console.log('🎉 Required files copied successfully!');
  console.log('📝 Note: All dependencies from package.json will be installed during packaging');
  
} catch (error) {
  console.error('❌ Error copying files:', error.message);
  process.exit(1);
}