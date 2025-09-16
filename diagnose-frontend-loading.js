import fs from 'fs';
import path from 'path';

console.log('=== Akash Share Frontend Loading Diagnostic ===');
console.log();

// Check if we're in a packaged app
const isPackaged = !!process.env.NODE_ENV || process.argv.includes('--packaged');
console.log('Is Packaged:', isPackaged);

// Check various possible paths for index.html
const possiblePaths = [];

// Only add paths that have valid base paths
if (process.resourcesPath) {
  possiblePaths.push(
    path.join(process.resourcesPath, 'app.asar', 'build', 'index.html'),
    path.join(process.resourcesPath, 'app.asar.unpacked', 'build', 'index.html'),
    path.join(process.resourcesPath, 'build', 'index.html'),
    path.join(process.resourcesPath, 'app', 'build', 'index.html')
  );
}

// Always add these paths
possiblePaths.push(
  path.join(process.cwd(), 'build', 'index.html'),
  path.join(process.cwd(), 'public', 'index.html')
);

console.log('Resources Path:', process.resourcesPath || 'Not set');
console.log('Current Directory:', process.cwd());
console.log('App Path:', process.argv[1] || 'Unknown');
console.log();

console.log('Checking for index.html in possible locations:');
let foundPath = null;

for (const possiblePath of possiblePaths) {
  try {
    const exists = fs.existsSync(possiblePath);
    console.log(`  ${exists ? '✅' : '❌'} ${possiblePath}`);
    if (exists && !foundPath) {
      foundPath = possiblePath;
    }
  } catch (err) {
    console.log(`  ❌ ${possiblePath} (Error: ${err.message})`);
  }
}

console.log();
if (foundPath) {
  console.log('✅ Found index.html at:', foundPath);
  try {
    const stats = fs.statSync(foundPath);
    console.log('   File Size:', stats.size, 'bytes');
    console.log('   Last Modified:', stats.mtime.toString());
  } catch (err) {
    console.log('   Error getting file stats:', err.message);
  }
} else {
  console.log('❌ Could not find index.html in any expected location');
  console.log();
  console.log('Creating a diagnostic HTML page...');
  
  const diagnosticHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Akash Share - Diagnostic</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px; 
          background: #1a1a1a; 
          color: #fff;
        }
        .container { 
          background: #2d2d2d; 
          padding: 30px; 
          border-radius: 8px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.3); 
        }
        .error { color: #ff6b6b; }
        .info { color: #4dabf7; }
        .path { 
          font-family: monospace; 
          background: #3d3d3d; 
          padding: 5px; 
          margin: 5px 0; 
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Akash Share - Application Diagnostic</h1>
        <div class="error">
          <h2>❌ Application failed to load</h2>
          <p>The main application files could not be found. This is likely a packaging issue.</p>
        </div>
        <div class="info">
          <h3>Diagnostic Information:</h3>
          <p><strong>Resources Path:</strong> <span class="path">${process.resourcesPath || 'Not set'}</span></p>
          <p><strong>Current Directory:</strong> <span class="path">${process.cwd()}</span></p>
          <p><strong>App Path:</strong> <span class="path">${process.argv[1] || 'Not set'}</span></p>
        </div>
        <div class="info">
          <h3>Expected Locations:</h3>
          ${possiblePaths.map(p => `<p class="path">${p}</p>`).join('')}
        </div>
        <div class="info">
          <h3>Solutions:</h3>
          <ul>
            <li>Try reinstalling the application</li>
            <li>Run the application as Administrator</li>
            <li>Check if antivirus software is blocking the application</li>
            <li>Contact support if the issue persists</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;
  
  console.log('Diagnostic HTML created successfully');
  console.log('Length:', diagnosticHtml.length, 'characters');
}