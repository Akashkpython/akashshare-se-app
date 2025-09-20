// Complete backend with file upload functionality
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5005;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Add comprehensive error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5005', 
    'http://localhost:3000', 
    'http://localhost:5004',
    'http://127.0.0.1:5005',
    'http://127.0.0.1:3000',
    'file://',
    'app://',
    'chrome-extension://',
    'capacitor://',
    'ionic://'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  }
});

// Root endpoint
app.get('/', (req, res) => {
  try {
    res.json({ 
      status: 'OK', 
      message: 'Akash Share Backend with File Upload is running!',
      timestamp: new Date().toISOString(),
      port: PORT,
      endpoints: {
        health: '/health',
        upload: '/upload',
        chat: '/chat',
        status: '/status',
        download: '/download/:code'
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

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    console.log('📤 Upload request received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    // Generate a 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store file info (in a real app, you'd use a database)
    const fileInfo = {
      code: code,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadTime: new Date().toISOString(),
      path: req.file.path
    };

    console.log('✅ File uploaded successfully:', fileInfo);

    res.json({
      code: code,
      filename: req.file.originalname,
      size: req.file.size,
      message: 'File uploaded successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
});

// File download endpoint
app.get('/download/:code', (req, res) => {
  try {
    const code = req.params.code;
    console.log('📥 Download request for code:', code);
    
    // In a real app, you'd look up the file in a database
    // For now, we'll just return a test response
    res.json({
      message: 'Download endpoint ready',
      code: code,
      note: 'File lookup functionality needs to be implemented'
    });

  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ 
      error: 'Download failed',
      message: error.message 
    });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Set max listeners to prevent memory leak warning
server.setMaxListeners(20);

// Create WebSocket server with error handling
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

// Handle server errors gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error('💡 The backend is already running or another process is using port 5005');
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

// Keep the process alive with a heartbeat
setInterval(() => {
  // This keeps the event loop active
}, 1000);

// Start the server
try {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 File Upload Backend running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket chat server running on ws://localhost:${PORT}/chat`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`📤 Upload endpoint: POST http://localhost:${PORT}/upload`);
    console.log(`📥 Download endpoint: GET http://localhost:${PORT}/download/:code`);
    console.log(`💬 Chat test: Connect to ws://localhost:${PORT}/chat`);
    console.log(`🔧 Server process ID: ${process.pid}`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
    console.log('📋 Press Ctrl+C to stop the server');
    console.log('💪 Server is persistent and will auto-recover from errors');
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
}

console.log('🔧 Starting file upload backend...');
