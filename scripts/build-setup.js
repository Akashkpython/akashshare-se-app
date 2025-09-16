import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Starting build setup...');

// Ensure backend directory has .env file
const backendDir = path.join(__dirname, '../backend');
const envPath = path.join(backendDir, '.env');
const envExamplePath = path.join(backendDir, '.env.example');

console.log(`📁 Checking backend directory: ${backendDir}`);

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found in backend directory');
  
  // Try to copy .env.example if it exists
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Copying .env.example to .env');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from .env.example');
  } else {
    console.log('⚠️  .env.example not found, creating minimal .env file');
    
    // Create a minimal .env file
    const minimalEnv = `# Development environment configuration
NODE_ENV=production
HOST=0.0.0.0
PORT=5004

# MongoDB connection string
MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare

# Security
JWT_SECRET=f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09

# File upload settings
FILE_SIZE_LIMIT=10485760

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
    
    fs.writeFileSync(envPath, minimalEnv);
    console.log('✅ Minimal .env file created');
  }
} else {
  console.log('✅ .env file already exists');
}

// Ensure build directory exists
const buildDir = path.join(__dirname, '../build');
if (!fs.existsSync(buildDir)) {
  console.log('📁 Creating build directory');
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('✅ Build directory created');
} else {
  console.log('✅ Build directory already exists');
}

// Ensure build-resources directory exists
const buildResourcesDir = path.join(__dirname, '../build-resources');
if (!fs.existsSync(buildResourcesDir)) {
  console.log('📁 Creating build-resources directory');
  fs.mkdirSync(buildResourcesDir, { recursive: true });
  console.log('✅ Build-resources directory created');
} else {
  console.log('✅ Build-resources directory already exists');
}

console.log('✅ Build setup completed successfully');