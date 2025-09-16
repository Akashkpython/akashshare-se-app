#!/usr/bin/env node

/**
 * Simple backend server for Electron
 * This is a minimal backend that will definitely work
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Simple Akash Share Backend...');

const app = express();
const PORT = process.env.PORT || 5004;
const HOST = process.env.HOST || '0.0.0.0';

// Enable CORS
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*'
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple status endpoint - this will always work
app.get('/status', (req, res) => {
  console.log('✅ Status check received');
  res.json({ 
    status: 'online', 
    message: 'Simple backend is running', 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Simple health endpoint
app.get('/health', (req, res) => {
  console.log('✅ Health check received');
  res.json({ 
    status: 'OK', 
    message: 'Simple backend is healthy', 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('✅ Test endpoint received');
  res.json({ 
    message: 'Simple backend is working!', 
    timestamp: new Date().toISOString()
  });
});

// Serve static files from build directory (but don't use catch-all yet)
const buildPath = path.join(__dirname, '../build');
if (fs.existsSync(buildPath)) {
  console.log('📁 Serving static files from:', buildPath);
  app.use(express.static(buildPath));
}

// Catch-all handler for React app (must come after all API routes)
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/status') || req.path.startsWith('/health') || req.path.startsWith('/test')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve React app if build directory exists
  if (fs.existsSync(buildPath)) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    res.json({ 
      message: 'Simple Akash Share Backend API', 
      status: 'running',
      note: 'Frontend build files not found - API only mode'
    });
  }
});

// Start the server
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Simple backend server running on http://${HOST}:${PORT}`);
  console.log(`✅ Status endpoint: http://${HOST}:${PORT}/status`);
  console.log(`✅ Health endpoint: http://${HOST}:${PORT}/health`);
  console.log(`✅ Test endpoint: http://${HOST}:${PORT}/test`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server failed to start:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`   Port ${PORT} is already in use. Please stop the process using this port or use a different port.`);
  } else if (err.code === 'EACCES') {
    console.error(`   Permission denied. You may need to run this with elevated privileges or use a port number above 1024.`);
  } else {
    console.error(`   Error details:`, err);
  }
  process.exit(1);
});

// Keep the process alive
console.log('🔧 Simple backend process will remain active...');

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

console.log('✅ Simple backend initialized successfully');
