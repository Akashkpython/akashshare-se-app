import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('=== Verifying Build Directory Inclusion ===');
console.log();

// Check if build directory exists
const buildDir = path.join(process.cwd(), 'build');
console.log('Build directory:', buildDir);

if (fs.existsSync(buildDir)) {
  console.log('✅ Build directory exists');
  
  // List some key files
  const keyFiles = ['index.html', 'static'];
  for (const file of keyFiles) {
    const filePath = path.join(buildDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} found`);
      if (fs.statSync(filePath).isDirectory()) {
        const files = fs.readdirSync(filePath);
        console.log(`   Directory contains ${files.length} items`);
      }
    } else {
      console.log(`❌ ${file} not found`);
    }
  }
} else {
  console.log('❌ Build directory does not exist');
}

console.log();
console.log('=== Checking ASAR File Contents ===');

// Check if app.asar exists and what it contains
const asarPath = path.join(process.cwd(), 'dist-new', 'win-unpacked', 'resources', 'app.asar');
console.log('ASAR file:', asarPath);

if (fs.existsSync(asarPath)) {
  console.log('✅ ASAR file exists');
  
  try {
    // List contents of ASAR file
    const output = execSync(`npx asar list "${asarPath}"`, { encoding: 'utf8' });
    const lines = output.split('\n').filter(line => line.trim() !== '');
    
    console.log(`ASAR file contains ${lines.length} entries`);
    
    // Check for build directory
    const hasBuildDir = lines.some(line => line.includes('build/'));
    const hasIndexHtml = lines.some(line => line.includes('index.html'));
    
    console.log(`Has build directory: ${hasBuildDir ? '✅' : '❌'}`);
    console.log(`Has index.html: ${hasIndexHtml ? '✅' : '❌'}`);
    
    // Show some sample entries
    console.log('\nSample entries:');
    lines.slice(0, 20).forEach(line => console.log(`  ${line}`));
    
  } catch (error) {
    console.log('❌ Error reading ASAR file:', error.message);
  }
} else {
  console.log('❌ ASAR file does not exist');
}