// Integrated Backend Server - Runs directly within Electron app
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

class IntegratedBackend {
  constructor() {
    this.app = express();
    this.PORT = 5005;
    this.server = null;
    this.wss = null;
    this.fileStore = new Map();
    this.wsConnections = new Map();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupMiddleware() {
    // CORS configuration for all environments
    this.app.use(cors({
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

    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Create uploads directory
    const uploadsDir = path.join(__dirname, '..', 'backend', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    this.upload = multer({ 
      storage: storage,
      limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
      },
      fileFilter: (req, file, cb) => {
        cb(null, true);
      }
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        message: 'Integrated Backend is healthy and running!',
        timestamp: new Date().toISOString(),
        port: this.PORT,
        mode: 'integrated'
      });
    });

    // Status endpoint
    this.app.get('/status', (req, res) => {
      res.json({
        status: 'online',
        message: 'Integrated Backend is running',
        timestamp: new Date().toISOString(),
        port: this.PORT,
        mode: 'integrated'
      });
    });

    // File upload endpoint
    this.app.post('/upload', this.upload.single('file'), (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ 
            error: 'No file uploaded', 
            message: 'Please select a file to upload' 
          });
        }

        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const fileDetails = {
          code: code,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          uploadTime: new Date().toISOString(),
          path: req.file.path
        };

        this.fileStore.set(code, fileDetails);
        
        console.log('✅ File uploaded successfully:', fileDetails);
        
        // Broadcast to all connected WebSocket clients
        const message = {
          type: 'file_uploaded',
          code: code,
          filename: req.file.originalname,
          size: req.file.size,
          timestamp: new Date().toISOString()
        };
        
        this.wsConnections.forEach((ws) => {
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

    // File download endpoint
    this.app.get('/download/:code', (req, res) => {
      try {
        const code = req.params.code;
        const fileDetails = this.fileStore.get(code);
        
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

    // File info endpoint
    this.app.get('/file/:code', (req, res) => {
      try {
        const code = req.params.code;
        const fileDetails = this.fileStore.get(code);
        
        if (!fileDetails) {
          return res.status(404).json({ 
            error: 'File not found', 
            message: 'Invalid file code' 
          });
        }

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
  }

  setupWebSocket() {
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });

    this.wss.on('connection', (ws, req) => {
      console.log('🔌 New WebSocket connection');
      
      const connectionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      this.wsConnections.set(connectionId, ws);
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          console.log('📨 Received message:', message);
          
          const broadcastMessage = {
            ...message,
            timestamp: new Date().toISOString(),
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9)
          };
          
          this.wsConnections.forEach((clientWs, id) => {
            if (clientWs.readyState === clientWs.OPEN && id !== connectionId) {
              clientWs.send(JSON.stringify(broadcastMessage));
            }
          });
          
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
        this.wsConnections.delete(connectionId);
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.wsConnections.delete(connectionId);
      });
      
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Akash Share',
        timestamp: new Date().toISOString(),
        connectionId: connectionId
      }));
    });
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(this.PORT, '127.0.0.1', () => {
          console.log('🔧 Starting integrated backend server...');
          console.log(`🚀 Integrated Backend running on http://127.0.0.1:${this.PORT}`);
          console.log(`📡 WebSocket chat server running on ws://127.0.0.1:${this.PORT}/chat`);
          console.log(`✅ Health check: http://127.0.0.1:${this.PORT}/health`);
          console.log(`📤 Upload endpoint: POST http://127.0.0.1:${this.PORT}/upload`);
          console.log(`📥 Download endpoint: GET http://127.0.0.1:${this.PORT}/download/:code`);
          console.log('💪 Integrated backend is running within Electron app');
          resolve();
        });

        this.server.on('error', (error) => {
          console.error('❌ Integrated backend server error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ Failed to start integrated backend:', error);
        reject(error);
      }
    });
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('✅ Integrated backend server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  isHealthy() {
    return this.server && this.server.listening;
  }
}

export default IntegratedBackend;
