const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('📦 Checking backend dependencies...');

try {
  const backendDir = path.join(__dirname, '..', 'backend');
  const rootDir = path.join(__dirname, '..');
  
  // Check if backend directory exists
  if (!fs.existsSync(backendDir)) {
    console.error('❌ Backend directory not found');
    process.exit(1);
  }
  
  // Check if node_modules exists in backend
  const nodeModulesPath = path.join(backendDir, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠️ Backend dependencies not found, installing...');
    
    try {
      // Install backend dependencies
      execSync('npm install', { 
        cwd: backendDir,
        stdio: 'inherit'
      });
      
      console.log('✅ Backend dependencies installed successfully');
    } catch (installError) {
      console.error('❌ Failed to install backend dependencies:', installError.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Backend dependencies already installed');
  }
  
  // Check if .env file exists in backend, create from .env.example if not
  const envPath = path.join(backendDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️ Backend .env file not found, creating from .env.example...');
    
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created backend .env file from .env.example');
    } else {
      console.log('⚠️ No .env.example found, creating minimal .env file...');
      
      // Create a minimal .env file with required variables
      const minimalEnv = `# Auto-generated .env file
MONGO_URI=mongodb://localhost:27017/akashshare
PORT=5002
HOST=localhost
JWT_SECRET=your-jwt-secret-here
NODE_ENV=production
`;
      fs.writeFileSync(envPath, minimalEnv);
      console.log('✅ Created minimal backend .env file');
    }
  } else {
    console.log('✅ Backend .env file already exists');
  }
  
  // Check if uploads directory exists, create if not
  const uploadsDir = path.join(backendDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
  }
  
} catch (error) {
  console.error('❌ Error checking backend dependencies:', error.message);
  process.exit(1);
}