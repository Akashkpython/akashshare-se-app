// Simple working backend for testing
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const PORT = 5005;

// Middleware
app.use(cors({
  origin: ['http://localhost:5005', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Akash Share Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT,
    endpoints: {
      health: '/health',
      upload: '/upload',
      chat: '/chat'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is healthy and running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Backend is running', 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Upload endpoint with 4-digit code generation
app.post('/upload', (req, res) => {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  res.json({
    success: true,
    code: code,
    message: 'File uploaded successfully with 4-digit code',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server for chat
const wss = new WebSocketServer({ 
  server, 
  path: '/chat'
});

wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection for chat');
  console.log('🔌 Connection URL:', req.url);
  console.log('🔌 Connection headers:', req.headers);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to Akash Share chat server',
    timestamp: new Date().toISOString()
  }));
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📨 Chat message:', message);
      
      // Broadcast to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({
            ...message,
            timestamp: new Date().toISOString()
          }));
        }
      });
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 Chat connection closed');
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

// WebSocket server error handling
wss.on('error', (error) => {
  console.error('❌ WebSocket server error:', error);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Working backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket chat server running on ws://localhost:${PORT}/chat`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`📤 Upload test: POST http://localhost:${PORT}/upload`);
  console.log(`💬 Chat test: Connect to ws://localhost:${PORT}/chat`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

console.log('🔧 Starting working backend...');