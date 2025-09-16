import fs from 'fs';
import path from 'path';

// Check if the build folder exists
const buildPath = path.join(process.cwd(), 'build');
console.log('Build folder exists:', fs.existsSync(buildPath));

if (fs.existsSync(buildPath)) {
  console.log('Build folder contents:');
  const buildContents = fs.readdirSync(buildPath);
  console.log(buildContents);
  
  // Check if index.html exists
  const indexPath = path.join(buildPath, 'index.html');
  console.log('index.html exists:', fs.existsSync(indexPath));
}

// Check if the ASAR file exists
const asarPath = path.join(process.cwd(), 'dist-new', 'win-unpacked', 'resources', 'app.asar');
console.log('ASAR file exists:', fs.existsSync(asarPath));

if (fs.existsSync(asarPath)) {
  console.log('ASAR file size:', fs.statSync(asarPath).size, 'bytes');
}