import fs from 'fs';
import path from 'path';

const distPath = path.join(process.cwd(), 'dist');

// Remove dist directory if it exists
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('✅ Removed dist directory');
}

// Create new dist directory
fs.mkdirSync(distPath, { recursive: true });
console.log('✅ Created new dist directory');