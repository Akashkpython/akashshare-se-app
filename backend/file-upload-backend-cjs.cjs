// Complete backend with file upload functionality - CommonJS version for packaged app
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  }
});

// Store for file codes and WebSocket connections
const fileStore = new Map();
const wsConnections = new Map();

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is healthy and running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Upload endpoint with 4-digit code generation
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded', 
        message: 'Please select a file to upload' 
      });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
    const fileDetails = {
      code: code,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadTime: new Date().toISOString(),
      path: req.file.path
    };

    // Store file details
    fileStore.set(code, fileDetails);
    
    console.log('✅ File uploaded successfully:', fileDetails);
    
    // Broadcast to all connected WebSocket clients
    const message = {
      type: 'file_uploaded',
      code: code,
      filename: req.file.originalname,
      size: req.file.size,
      timestamp: new Date().toISOString()
    };
    
    wsConnections.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });

    res.json(fileDetails);
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message 
    });
  }
});

// Download endpoint
app.get('/download/:code', (req, res) => {
  try {
    const code = req.params.code;
    const fileDetails = fileStore.get(code);
    
    if (!fileDetails) {
      return res.status(404).json({ 
        error: 'File not found', 
        message: 'Invalid download code' 
      });
    }

    const filePath = fileDetails.path;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'File not found', 
        message: 'File has been deleted' 
      });
    }

    res.download(filePath, fileDetails.originalName, (err) => {
      if (err) {
        console.error('❌ Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ 
            error: 'Download failed', 
            message: err.message 
          });
        }
      }
    });
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ 
      error: 'Download failed', 
      message: error.message 
    });
  }
});

// Get file info endpoint
app.get('/file/:code', (req, res) => {
  try {
    const code = req.params.code;
    const fileDetails = fileStore.get(code);
    
    if (!fileDetails) {
      return res.status(404).json({ 
        error: 'File not found', 
        message: 'Invalid file code' 
      });
    }

    // Remove sensitive path information
    const publicFileDetails = {
      code: fileDetails.code,
      originalName: fileDetails.originalName,
      size: fileDetails.size,
      mimetype: fileDetails.mimetype,
      uploadTime: fileDetails.uploadTime
    };

    res.json(publicFileDetails);
  } catch (error) {
    console.error('❌ File info error:', error);
    res.status(500).json({ 
      error: 'Failed to get file info', 
      message: error.message 
    });
  }
});

// WebSocket server for real-time communication
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection');
  
  // Generate unique ID for this connection
  const connectionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  wsConnections.set(connectionId, ws);
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📨 Received message:', message);
      
      // Broadcast message to all connected clients
      const broadcastMessage = {
        ...message,
        timestamp: new Date().toISOString(),
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      };
      
      wsConnections.forEach((clientWs, id) => {
        if (clientWs.readyState === clientWs.OPEN && id !== connectionId) {
          clientWs.send(JSON.stringify(broadcastMessage));
        }
      });
      
      // Send confirmation back to sender
      ws.send(JSON.stringify({
        ...broadcastMessage,
        type: 'message_sent'
      }));
      
    } catch (error) {
      console.error('❌ WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
    wsConnections.delete(connectionId);
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
    wsConnections.delete(connectionId);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Akash Share',
    timestamp: new Date().toISOString(),
    connectionId: connectionId
  }));
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('🔧 Starting file upload backend...');
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

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
