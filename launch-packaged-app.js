import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Launching packaged Akash Share app...');

// Path to the packaged application executable
const appPath = path.join('dist', 'win-unpacked', 'Akash Share.exe');

// Launch the application
const appProcess = spawn(appPath, {
  cwd: process.cwd(),
  stdio: 'inherit'
});

appProcess.on('error', (error) => {
  console.error('❌ Failed to launch packaged app:', error.message);
});

appProcess.on('close', (code) => {
  console.log(`📦 Packaged app exited with code ${code}`);
});

// Keep the launcher process alive for a while to allow the app to start
setTimeout(() => {
  console.log('⏰ Launcher process ending, but app should still be running');
}, 10000);