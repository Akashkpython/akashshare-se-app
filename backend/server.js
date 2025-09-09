import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import multer from "multer";
import cors from "cors";
import { validationResult, param } from "express-validator";
import { WebSocketServer } from "ws";
import http from "http";
// shortid import removed as it is not used
import mongoose from "mongoose";
import connectToMongoDB from "./mongo-connection.js";
import { validateFile, sanitizeFilename } from "./utils/fileValidation.js";
// Rate limiting functions are now used in group.js module
// DISABLED AI WebSocket system to prevent conflicts
// import { initializeGroupChat, getChatClients, getRooms, getRoomHistory, summarizeMessages } from "./utils/aiWebSocket.js";
import { 
  asyncErrorHandler, 
  globalErrorHandler, 
  setupGlobalErrorHandlers, 
  validateEnvironment 
} from "./utils/errorHandler.js";
import backendPerformanceManager from "./utils/performance.js";
import backendSecurityManager from "./utils/security.js";
import memoryMonitor from "./utils/memoryMonitor.js";
import { httpConnectionPool, wsConnectionPool } from "./utils/connectionPool.js";
import performanceRoutes from "./routes/performance.js";
import { trackConnection } from "./middleware/connectionTracking.js";
import { PathUtils, OSUtils, FileUtils } from "./utils/crossPlatform.js";
import ConnectionLimiter from "./middleware/connectionLimiter.js";
import PerformanceOptimizer from "./utils/performanceOptimizer.js";
import dotenv from "dotenv";

dotenv.config();

// For ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection is now handled by the mongo-connection module

// Setup global error handlers
setupGlobalErrorHandlers();

// Environment validation with enhanced error handling
try {
  validateEnvironment(['MONGO_URI', 'JWT_SECRET']);
} catch (error) {
  console.error('❌ Environment validation failed');
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

// Removed localhost override: always use MONGO_URI (Atlas recommended)

const app = express();

// Initialize performance optimizations
const connectionLimiter = new ConnectionLimiter({
  maxConnections: parseInt(process.env.WS_CONNECTION_LIMIT) || 100,
  maxConnectionsPerIP: parseInt(process.env.WS_RATE_LIMIT_MAX) || 10
});

const performanceOptimizer = new PerformanceOptimizer({
  maxCacheSize: 500,
  defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
  bufferTimeout: 100
});

// Explicitly create server with IPv4 to avoid ::1 binding issues on Render
const server = http.createServer({ family: 4 }, app);

// WebSocket Server with production-ready options
const wss = new WebSocketServer({ 
  server, 
  path: '/chat',
  perMessageDeflate: false, // Disable compression for lower latency
  clientTracking: true, // Track clients for cleanup
  maxPayload: 1024 * 1024 // 1MB max message size
});

// DISABLED AI system - using simple WebSocket handling instead
// console.log('🤖 Initializing AI-Enhanced WebSocket Chat System');
// initializeGroupChat(wss);

// Simple WebSocket handling - no AI interference
const chatClients = new Map();
const rooms = new Map();

wss.on('connection', (ws, req) => {
  // New WebSocket connection established
  
  try {
    const ip = req.socket.remoteAddress;
    const connectionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Track connection with limiter
    try {
      connectionLimiter.trackConnection(connectionId, ip, { type: 'websocket' });
    } catch (error) {
      ws.close(1008, error.message);
      return;
    }
    
    const url = new URL(req.url, 'http://localhost');
    const username = url.searchParams.get('username') || `User${Math.floor(Math.random() * 10000)}`;
    const room = url.searchParams.get('room') || 'general';
    
    console.log(`🔌 WebSocket connected - User: ${username}, Room: ${room}, IP: ${ip}`);
    
    // Store connection
    const connectionData = {
      id: connectionId,
      ws,
      username,
      room,
      joinedAt: new Date(),
      isActive: true
    };
    
    chatClients.set(connectionId, connectionData);
    ws.connectionId = connectionId;
    
    // Add to room
    if (!rooms.has(room)) {
      rooms.set(room, new Set());
    }
    rooms.get(room).add(connectionId);
    
    // Notify other users in the room
    const roomUsers = Array.from(rooms.get(room) || [])
      .map(id => chatClients.get(id)?.username)
      .filter(Boolean);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'system',
      message: `Welcome ${username} to ${room}!`,
      timestamp: new Date().toISOString()
    }));
    
    // Send user list to the new user
    ws.send(JSON.stringify({
      type: 'userList',
      users: roomUsers,
      timestamp: new Date().toISOString()
    }));
    
    // Notify other users about the new user
    const roomConnections = rooms.get(room) || new Set();
    roomConnections.forEach(id => {
      const client = chatClients.get(id);
      if (client && client.ws.readyState === 1 && client.ws !== ws) { // OPEN and not the sender
        client.ws.send(JSON.stringify({
          type: 'userJoined',
          username,
          message: `${username} joined the chat`,
          users: roomUsers,
          timestamp: new Date().toISOString()
        }));
      }
    });
    
    // Handle messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('📨 Message received:', message);
        
        if (message.type === 'message') {
          // Broadcast to room (exclude sender)
          const roomConnections = rooms.get(room) || new Set();
          roomConnections.forEach(id => {
            const client = chatClients.get(id);
            if (client && client.ws.readyState === 1 && client.ws !== ws) { // OPEN and not the sender
              client.ws.send(JSON.stringify({
                type: 'message',
                messageId: Date.now() + Math.random(),
                message: message.message,
                username,
                timestamp: new Date().toISOString()
              }));
            }
          });
        } else if (message.type === 'image') {
          // Broadcast image to room (exclude sender)
          const roomConnections = rooms.get(room) || new Set();
          roomConnections.forEach(id => {
            const client = chatClients.get(id);
            if (client && client.ws.readyState === 1 && client.ws !== ws) { // OPEN and not the sender
              client.ws.send(JSON.stringify({
                type: 'image',
                messageId: Date.now() + Math.random(),
                imageUrl: message.imageUrl,
                caption: message.caption || '',
                username,
                timestamp: new Date().toISOString()
              }));
            }
          });
        }
      } catch (error) {
        console.error('Message processing error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process your message'
        }));
      }
    });
    
    // Handle disconnect
    ws.on('close', () => {
      console.log(`🔌 User ${username} disconnected from room ${room}`);
      
      // Remove from room
      if (rooms.has(room)) {
        rooms.get(room).delete(connectionId);
      }
      
      // Remove from clients
      chatClients.delete(connectionId);
      
      // Remove from connection limiter
      connectionLimiter.removeConnection(connectionId);
      
      // Notify other users about the disconnected user
      const roomUsers = Array.from(rooms.get(room) || [])
        .map(id => chatClients.get(id)?.username)
        .filter(Boolean);
        
      const roomConnections = rooms.get(room) || new Set();
      roomConnections.forEach(id => {
        const client = chatClients.get(id);
        if (client && client.ws.readyState === 1 && client.ws !== ws) { // OPEN and not the sender
          client.ws.send(JSON.stringify({
            type: 'userLeft',
            username,
            message: `${username} left the chat`,
            users: roomUsers,
            timestamp: new Date().toISOString()
          }));
        }
      });
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error for user', username, ':', error);
    });
    
  } catch (error) {
    console.error('Connection setup error:', error);
    ws.close();
  }
});

// Add WebSocket server event listeners for debugging
wss.on('listening', () => {
  // Get the actual address the server is listening on
  const address = server.address();
  if (address) {
    if (typeof address === 'string') {
      // WebSocket server listening
    } else {
      // WebSocket server listening on port
    }
  } else {
    // WebSocket server listening
  }
});

wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

wss.on('headers', (_headers, _request) => {
  // WebSocket headers received
});

// WebSocket server initialized with path /chat

// Store connected clients (moved from direct implementation to using group.js)
// These are now exported from group.js for access in other parts of the application
// const chatClients = new Map();
// const rooms = new Map();

// WebSocket chat functionality (moved to group.js)
// The previous implementation has been moved to the group.js module for better organization

// broadcastToRoom function moved to group.js module

// Ultra-Powerful Security Middleware (temporarily relaxed for WebSocket debugging)
app.use((req, res, next) => {
  // Set permissive CSP for development WebSocket connections
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' localhost:* 127.0.0.1:* ws: wss: *; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'none'"
  );
  next();
});
// app.use(backendSecurityManager.createSecurityHeaders());


// Performance monitoring middleware
app.use(backendPerformanceManager.createPerformanceMiddleware());

// Add performance optimization middleware
app.use(performanceOptimizer.cacheMiddleware());

// Connection tracking middleware
app.use(trackConnection);

// Ultra-Powerful Rate Limiting with Security Integration
const limiter = backendSecurityManager.createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_RATE_LIMIT_TEST === 'true') {
  app.use(limiter);
}

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://akashshare-se.onrender.com', // Your Render frontend domain
        'https://akashshare-se-backend.onrender.com', // Your Render backend domain
        'https://44.229.227.142:5002', // Your production IP
        process.env.CORS_ORIGIN || 'https://akashshare-se.onrender.com'
      ]
    : function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // List of allowed origins for development
        const allowedOrigins = [
          'http://localhost:5002', 'http://localhost:5003', 'http://localhost:5004', 'http://localhost:59489',
          'http://127.0.0.1:5002', 'http://127.0.0.1:5003', 'http://127.0.0.1:5004', 'http://127.0.0.1:59489',
          'http://[::1]:5002',
          'http://0.0.0.0:5002',
          'http://192.168.0.185:5002', 'http://192.168.0.185:5003', 'http://192.168.0.185:5004', 'http://192.168.0.185:59489'
        ];
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // CORS origin blocked
        callback(new Error('Not allowed by CORS'));
      },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File type validation
// Expanded file type support for better user experience
const allowedFileTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-rar-compressed,application/x-7z-compressed,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,audio/mpeg,audio/wav,audio/mp4,audio/aac,application/json,application/xml,application/javascript,text/html,text/css,application/vnd.openxmlformats-officedocument.presentationml.slideshow,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation,application/x-tar,application/gzip,text/markdown,application/rtf').split(',');
const maxFileSize = parseInt(process.env.FILE_SIZE_LIMIT) || 10 * 1024 * 1024; // 10MB default

const fileFilter = (req, file, cb) => {
  // Enhanced file validation using our new validation utility
  const validation = validateFile(file);
  if (validation.success) {
    cb(null, true);
  } else {
    cb(new Error(validation.error), false);
  }
};

// Storage (Multer) with cross-platform path handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = PathUtils.normalize("uploads");
    // Ensure uploads directory exists using cross-platform utility
    FileUtils.createDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use enhanced filename sanitization with cross-platform safe path
    const sanitizedName = sanitizeFilename(file.originalname);
    const uniqueName = `${Date.now()}_${sanitizedName}`;
    const safePath = PathUtils.createSafeFilePath(uniqueName);
    cb(null, safePath);
  }
});

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 1
  }
});

// Validation middleware
const validateUpload = [
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('File upload error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            error: `File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB` 
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: "Too many files uploaded" });
        }
        return res.status(400).json({ error: `File upload error: ${err.message}` });
      }
      
      if (err) {
        console.error('File processing error:', err);
        if (err.message && err.message.includes('File type')) {
          return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: `File processing failed: ${err.message}` });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      // File validation successful
      next();
    });
  },
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: errors.array() 
      });
    }
    next();
  }
];

const validateDownload = [
  param('code').isLength({ min: 4, max: 4 }).withMessage('Code must be exactly 4 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: "Invalid code format", 
        details: errors.array() 
      });
    }
    next();
  }
];

// IMPORTANT: API routes must be defined BEFORE static file serving to avoid conflicts
// API status endpoint (moved from root to avoid conflicts with React app)
app.get("/api", (req, res) => {
  res.status(200).json({ 
    message: "Akash Share Backend API",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// File Schema - Moved here to ensure it's defined before routes that use it
const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  originalName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  path: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 10,
    index: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now,
    expires: 24 * 60 * 60, // Auto-delete after 24 hours
    index: true
  },
  // AI metadata (optional)
  ai: {
    tags: { type: [String], default: [] },
    nsfw: {
      flag: { type: Boolean, default: false },
      confidence: { type: Number, default: 0 }
    },
    ocr: {
      performed: { type: Boolean, default: false },
      textPreview: { type: String, default: '' }
    },
    pii: {
      performed: { type: Boolean, default: false },
      items: { type: [Object], default: [] }
    }
  }
});

// Indexes are now defined in the schema fields above

const File = mongoose.model("File", FileSchema);

// Health check endpoint with performance monitoring
app.get("/health", (req, res) => {
  const chatStats = {
    totalClients: chatClients.size,
    totalRooms: rooms.size,
    roomStats: {}
  };

  // Get stats for each room
  rooms.forEach((clientIds, roomName) => {
    chatStats.roomStats[roomName] = clientIds.size;
  });

  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    websocket: chatStats,
    system: {
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    },
    database: {
      connected: mongoose.connection.readyState === 1,
      name: mongoose.connection.name,
      host: mongoose.connection.host
    },
    performance: {
      memory: memoryMonitor.getMemoryStats(),
      connections: {
        http: httpConnectionPool.getPoolStats(),
        websocket: wsConnectionPool.getPoolStats(),
        rooms: wsConnectionPool.getRoomStats()
      }
    }
  });
});

// Debug endpoint to list all files (temporary for troubleshooting)
app.get("/debug/files", async (req, res) => {
  try {
    const files = await File.find({}, { _id: 1, code: 1, originalName: 1, uploadedAt: 1, expires: 1 }).sort({ uploadedAt: -1 }).limit(10);
    res.json({
      total: files.length,
      files: files.map(f => ({
        code: f.code,
        name: f.originalName,
        uploaded: f.uploadedAt,
        expired: f.expires ? new Date() > f.expires : false
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ultra-Powerful Upload Route with Advanced Security and Performance Monitoring
app.post("/upload", validateUpload, asyncErrorHandler(async (req, res) => {
  const uploadStartTime = performance.now();
  
  try {
    // Security validation
    const securityValidation = backendSecurityManager.validateFileUpload(req.file);
    if (!securityValidation.isValid) {
      return res.status(400).json({ 
        error: "File validation failed", 
        details: securityValidation.errors 
      });
    }

    // Sanitize filename
    const sanitizedFilename = securityValidation.sanitizedFilename;
    
    console.log('Upload request received:', {
      filename: sanitizedFilename,
      originalName: req.file?.originalname,
      size: req.file?.size,
      mimetype: req.file?.mimetype,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Check if file was actually saved to disk using cross-platform file utilities
    if (!req.file || !FileUtils.exists(req.file.path)) {
      return res.status(500).json({ error: "File not saved to disk" });
    }

    // Generate a secure random code with retry logic to avoid duplicates
    let randomCode;
    let newFile;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      randomCode = backendSecurityManager.generateSecureRandom(4, 'numeric');
      
      try {
        newFile = new File({
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path,
          code: randomCode,
          size: req.file.size,
          mimetype: req.file.mimetype
        });
        
        await newFile.save();
        break; // Success, exit the loop
      } catch (saveErr) {
        // Clean up the uploaded file if database save fails using cross-platform utilities
        try {
          if (req.file.path && FileUtils.exists(req.file.path)) {
            FileUtils.deleteFile(req.file.path);
          }
        } catch (cleanupErr) {
          console.error('Cleanup error:', cleanupErr);
        }
        
        if (saveErr.code === 11000) { // Duplicate key error
          attempts++;
          if (attempts >= maxAttempts) {
            throw new Error("Unable to generate unique code after multiple attempts");
          }
          continue; // Try again with a new code
        }
        throw saveErr; // Some other error, re-throw
      }
    }
    
    const uploadDuration = performance.now() - uploadStartTime;
    console.log(`File saved successfully with code: ${randomCode} (${uploadDuration.toFixed(2)}ms)`);
    
    // Performance monitoring
    backendPerformanceManager.addPerformanceEntry({
      name: 'file-upload',
      duration: Math.round(uploadDuration * 100) / 100,
      memoryDelta: 0,
      metadata: {
        filename: sanitizedFilename,
        size: req.file.size,
        code: randomCode,
        ip: req.ip
      },
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json({ 
      code: randomCode,
      filename: sanitizedFilename,
      size: req.file.size,
      message: "File uploaded successfully"
    });

    // Trigger async lightweight AI analysis (non-blocking)
    ;(async () => {
      try {
        if (process.env.AI_CLASSIFY_ENABLED === 'false') return;
        const fileDoc = await File.findOne({ code: randomCode });
        if (!fileDoc) return;
        // AI analysis functions would be implemented here
        const tags = [];
        const nsfw = { nsfw: false, confidence: 0 };
        const ocr = { performed: false, text: '' };
        const pii = { performed: false, pii: [] };
        const textPreview = (ocr.text || '').slice(0, 300);
        await File.updateOne({ _id: fileDoc._id }, {
          $set: {
            ai: {
              tags,
    nsfw: { flag: !!nsfw.nsfw, confidence: Number(nsfw.confidence || 0) },
              ocr: { performed: !!ocr.performed, textPreview },
              pii: { performed: !!pii.performed, items: pii.pii || [] }
            }
          }
        });
      } catch (e) {
        console.warn('AI analysis failed:', e?.message);
      }
    })();
  } catch (err) {
    console.error('Upload error:', err);
    
    // Clean up uploaded file if it exists using cross-platform utilities
    try {
      if (req.file && req.file.path && FileUtils.exists(req.file.path)) {
        FileUtils.deleteFile(req.file.path);
      }
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr);
    }
    
    if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
      return res.status(500).json({ error: "Database connection failed. Please check MongoDB Atlas connection and network access." });
    }
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
}, { fileOperation: 'upload' }));

// Download Route with enhanced error handling
app.get("/download/:code", validateDownload, asyncErrorHandler(async (req, res) => {
  const { code } = req.params;
  
  const file = await File.findOne({ code });
  if (!file) {
    return res.status(404).json({ error: "File not found or code is invalid" });
  }

  // Check if file exists on disk using cross-platform utilities
  if (!FileUtils.exists(file.path)) {
    await File.deleteOne({ _id: file._id });
    return res.status(404).json({ error: "File not found on server" });
  }

  // Set cache headers for better performance
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.setHeader('ETag', file.code);
  
  res.download(file.path, file.originalName || file.filename, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(500).json({ error: "Download failed" });
    }
  });
}, { fileOperation: 'download' }));

// Serve static files with cross-platform path handling
// This must come AFTER all API routes to avoid conflicts

// Try to serve React build files first if they exist
const buildPath = PathUtils.join(__dirname, '../build');
const indexHtmlPath = PathUtils.join(buildPath, 'index.html');

if (FileUtils.exists(indexHtmlPath)) {
  console.log('🗂️  Serving React build files from:', buildPath);
  app.use(express.static(buildPath));
  
  // Catch-all handler to serve the React app for any non-API routes
  // This must come AFTER all API routes to avoid conflicts
  app.get('*', (req, res) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  // Fallback to public directory if build doesn't exist
  const publicPath = PathUtils.join(__dirname, '../public');
  console.log('🗂️  Serving static files from:', publicPath);
  app.use(express.static(publicPath));
  
  // Debug route to test static file serving with cross-platform support
  app.get('/debug/static', (req, res) => {
    const akashPath = PathUtils.join(publicPath, 'akash.jpg');
    res.json({
      publicPath,
      akashExists: FileUtils.exists(akashPath),
      akashPath,
      platform: OSUtils.getOS(),
      systemInfo: OSUtils.getSystemInfo()
    });
  });
}

// Performance monitoring routes
app.use('/api/performance', performanceRoutes);

// Summary endpoint: quick extractive summary for recent messages in a room
app.get('/chat/:room/summary', (req, res) => {
  try {
    const roomName = (req.params.room || '').toLowerCase().trim();
    if (!roomName) return res.status(400).json({ error: 'Room is required' });
    
    if (!rooms.has(roomName)) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Simple implementation - just return room info without AI features
    const clientCount = rooms.get(roomName)?.size || 0;
    return res.json({ 
      room: roomName, 
      summary: `Room ${roomName} has ${clientCount} active users.`,
      message: 'AI summarization disabled - using simple WebSocket mode'
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Global error handling middleware - must be defined after routes
app.use(globalErrorHandler);

// MongoDB Connect - this should be at the end to ensure all routes are defined
// Add more robust connection options for Render deployment

// Handle potential MongoDB connection issues more gracefully
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB Connection Error:', err);
  console.error('📋 Please ensure MongoDB Atlas is accessible and your connection string is correct');
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB Disconnected');
});

// Try to reconnect if disconnected
mongoose.connection.on('reconnect', () => {
  console.log('✅ MongoDB Reconnected');
});



// Start server only when this file is run directly (not when imported for testing)
// Simple approach: always start unless explicitly disabled
const shouldStartServer = process.env.START_SERVER !== 'false';

console.log('🔧 Server start check:', {
  shouldStartServer,
  startServerEnv: process.env.START_SERVER
});

if (shouldStartServer) {
  (async () => {
    console.log('🔧 Starting server initialization...');
    
    // Start performance monitoring
    console.log('📊 Initializing performance monitoring...');
    memoryMonitor.start();
    
    // Setup memory monitoring event listeners
    memoryMonitor.on('criticalMemory', (entry) => {
      console.error(`🚨 CRITICAL MEMORY: ${(entry.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      // Force cleanup of idle connections
      httpConnectionPool.forceCleanup({ maxAge: 30000 });
      wsConnectionPool.forceCleanup({ maxAge: 60000 });
    });
    
    memoryMonitor.on('warningMemory', (entry) => {
      console.warn(`⚠️ HIGH MEMORY: ${(entry.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      // Trigger regular cleanup
      httpConnectionPool.cleanup();
      wsConnectionPool.cleanup();
    });
    
    let dbConnected = false;
    try {
      await connectToMongoDB();
      dbConnected = true;
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error.message);
      console.error("🔧 Continuing to start HTTP/WebSocket server in degraded mode.");
      console.error("📋 MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");
    }

    // Start server regardless of DB status so Electron app can function (chat/UI)
    const PORT = process.env.PORT || 5003;
    const HOST = process.env.HOST || 'localhost'; // Bind to localhost explicitly for development
    console.log(`🔧 Configuring server to bind to ${HOST}:${PORT}`);

    server.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📁 File size limit: ${maxFileSize / (1024 * 1024)}MB`);
      console.log(`🔒 Allowed file types: ${allowedFileTypes.join(', ')}`);
      console.log(`⏱️  Rate limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / (60 * 1000)} minutes`);
      console.log(`🌐 API endpoints available at: http://${HOST}:${PORT}`);
      console.log(`💬 WebSocket chat available at: ws://${HOST}:${PORT}/chat`);
      console.log(`📊 Performance monitoring active`);
      console.log(`🔗 Connection pools initialized (HTTP: ${httpConnectionPool.maxConnections}, WS: ${wsConnectionPool.maxConnections})`);
      if (!dbConnected) {
        console.warn('⚠️ Server started in degraded mode: database not connected. Upload/download endpoints may fail.');
      }
      if (process.env.NODE_ENV === 'production') {
        console.log(`🖥️  Frontend available at: http://${HOST}:${PORT}`);
      }
    });

    // Add error handler for the server
    server.on('error', (err) => {
      console.error('❌ Server failed to start:', err.message);
      if (err.code === 'EADDRINUSE') {
        console.error(`   Port ${PORT} is already in use. Please stop the process using this port or use a different port.`);
      } else if (err.code === 'EACCES') {
        console.error(`   Permission denied. You may need to run this with elevated privileges or use a port number above 1024.`);
      } else {
        console.error(`   Error details:`, err);
      }
    });
    
    // Keep the process alive
    console.log('🔧 Server process will remain active...');
    
    // Add a keep-alive mechanism
    setInterval(() => {
      // This will keep the event loop active
    }, 1000);
  })();
} else {
  console.log('📦 server.js imported as module, not starting server directly');
}

// Export app and simple WebSocket data structures for testing
export {
  app,
  chatClients,
  rooms
};


