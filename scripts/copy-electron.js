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
  
  console.log('🎉 Required files copied successfully!');
  console.log('📝 Note: Using electron/main.js directly (no build/electron.js needed)');
  
} catch (error) {
  console.error('❌ Error copying files:', error.message);
  process.exit(1);
}