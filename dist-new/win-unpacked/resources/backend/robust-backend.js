// Robust backend server with proper error handling
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const PORT = 5005;

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5005', 'http://localhost:3000', 'http://localhost:5004'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Root endpoint
app.get('/', (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error in root endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health endpoint
app.get('/health', (req, res) => {
  try {
    res.json({
      status: 'OK',
      message: 'Backend is healthy and running!',
      timestamp: new Date().toISOString(),
      port: PORT
    });
  } catch (error) {
    console.error('Error in health endpoint:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Status endpoint
app.get('/status', (req, res) => {
  try {
    res.json({ 
      status: 'online', 
      message: 'Backend is running', 
      timestamp: new Date().toISOString(),
      port: PORT
    });
  } catch (error) {
    console.error('Error in status endpoint:', error);
    res.status(500).json({ error: 'Status check failed' });
  }
});

// Upload endpoint (simple test)
app.post('/upload', (req, res) => {
  try {
    // Generate a random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    res.json({
      code: code,
      message: 'File uploaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in upload endpoint:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Set max listeners to prevent memory leak warning
server.setMaxListeners(20);

// Create WebSocket server
let wss;
try {
  wss = new WebSocketServer({ 
    server, 
    path: '/chat' 
  });

  wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('📨 Received message:', data);
        
        // Echo back the message
        ws.send(JSON.stringify({
          type: 'echo',
          message: data,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          timestamp: new Date().toISOString()
        }));
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  });

  wss.on('error', (error) => {
    console.error('❌ WebSocket server error:', error);
  });

} catch (error) {
  console.error('❌ Failed to create WebSocket server:', error);
}

// Start server with error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the process using this port.`);
    console.error('💡 You can find and kill the process with: netstat -ano | findstr :5005');
  } else {
    console.error('❌ Server error:', error);
  }
});

// Handle graceful shutdown
let isShuttingDown = false;

process.on('SIGINT', () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
  
  // Force exit after 5 seconds if graceful shutdown fails
  setTimeout(() => {
    console.log('⚠️ Forcing exit...');
    process.exit(1);
  }, 5000);
});

// Start the server
try {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Robust backend running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket chat server running on ws://localhost:${PORT}/chat`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`📤 Upload test: POST http://localhost:${PORT}/upload`);
    console.log(`💬 Chat test: Connect to ws://localhost:${PORT}/chat`);
    console.log(`🔧 Server process ID: ${process.pid}`);
    console.log('📋 Press Ctrl+C to stop the server');
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
}

console.log('🔧 Starting robust backend...');
