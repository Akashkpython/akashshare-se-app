const fs = require('fs');
const path = require('path');

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, '..', 'build');
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
    '.env',
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
  
  console.log('🎉 Required files copied successfully!');
  console.log('📝 Note: Using electron/main.js directly (no build/electron.js needed)');
  console.log('📝 Note: All dependencies from package.json will be included in the final package automatically');
  
} catch (error) {
  console.error('❌ Error copying files:', error.message);
  process.exit(1);
}