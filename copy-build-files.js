const fs = require('fs');
const path = require('path');

// Function to copy directory recursively
function copyDir(src, dest) {
  console.log('Creating directory:', dest);
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      console.log('Copying directory:', entry.name);
      copyDir(srcPath, destPath);
    } else {
      console.log('Copying file:', entry.name);
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy build files to resources/app directory
const buildSrc = path.join(__dirname, 'build');
const buildDest = path.join(__dirname, 'dist-final', 'win-unpacked', 'resources', 'app');

console.log('Copying build files from', buildSrc);
console.log('To', buildDest);

if (fs.existsSync(buildSrc)) {
  const files = fs.readdirSync(buildSrc);
  console.log('Files in build directory:', files);
  
  if (files.length > 0) {
    copyDir(buildSrc, buildDest);
    console.log('Build files copied successfully!');
  } else {
    console.error('Build directory is empty!');
  }
} else {
  console.error('Build directory not found!');
}