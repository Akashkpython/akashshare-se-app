const { spawn } = require('child_process');

// Run the build command
const buildProcess = spawn('npx', ['react-scripts', 'build'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

buildProcess.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
});