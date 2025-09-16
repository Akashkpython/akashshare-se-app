import fs from "fs";
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
import { initializeGroupChat, getChatClients } from "./utils/group.js";
import { 
  asyncErrorHandler, 
  globalErrorHandler, 
  setupGlobalErrorHandlers, 
  validateEnvironment 
} from "./utils/errorHandler.js";
import backendSecurityManager from "./utils/security.js";
import backendPerformanceManager from "./utils/performance.js";
import dotenv from "dotenv";
import { tagFile, detectNSFW, runOCR, detectPII } from "./services/ai/classify.js";
import { summarizeMessages } from "./services/ai/summary.js";
import { getRooms, getRoomHistory } from "./utils/group.js";

// Load environment variables from root .env file
dotenv.config({ path: '../.env' });

// Debug: Check if environment variables are loaded
console.log('🔍 Environment Variables Debug:');
console.log('   MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not Set');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'Not Set');
console.log('   PORT:', process.env.PORT || 'Not Set');

// For ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection is now handled by the mongo-connection module

// Setup global error handlers
setupGlobalErrorHandlers();

// Set default environment variables for local development
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare';
  console.log('🔧 Using default MongoDB URI for local development');
} else {
  console.log('✅ Using MongoDB URI from environment variables');
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09';
  console.log('🔧 Using default JWT secret for local development');
} else {
  console.log('✅ Using JWT secret from environment variables');
}

// Environment validation with enhanced error handling
try {
  validateEnvironment(['MONGO_URI', 'JWT_SECRET']);
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.log('⚠️  Continuing in development mode with defaults...');
  }
}

// Removed localhost override: always use MONGO_URI (Atlas recommended)

const app = express();

// Trust proxy configuration for production deployments (Render, etc.)
if (process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);
  console.log('🔒 Trust proxy enabled for production deployment');
}

// Create server with proper binding for Electron
const server = http.createServer(app);

// WebSocket Server with CORS support
const wss = new WebSocketServer({ 
  server, 
  path: '/chat',
  verifyClient: (info) => {
    const origin = info.origin;
    
    // Allow connections with no origin (Electron)
    if (!origin) {
      console.log('🔌 WebSocket connection from no origin (likely Electron)');
      return true;
    }
    
    // Allow all localhost and 127.0.0.1 origins
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('🔌 WebSocket connection from localhost:', origin);
      return true;
    }
    
    // Allow file:// origins for Electron
    if (origin.startsWith('file://')) {
      console.log('🔌 WebSocket connection from file:// origin (Electron)');
      return true;
    }
    
    // Allow null origins
    if (origin === 'null') {
      console.log('🔌 WebSocket connection from null origin');
      return true;
    }
    
    console.log('🚫 WebSocket connection blocked from origin:', origin);
    return false;
  }
});

// Initialize group chat functionality
initializeGroupChat(wss);

// Add WebSocket server event listeners for debugging
wss.on('listening', () => {
  // Get the actual address the server is listening on
  const address = server.address();
  if (address) {
    if (typeof address === 'string') {
      console.log('💬 WebSocket server is listening on', address);
    } else {
      console.log('💬 WebSocket server is listening on', `${address.address}:${address.port}`);
    }
  } else {
    console.log('💬 WebSocket server is listening');
  }
});

wss.on('error', (error) => {
  console.error('❌ WebSocket server error:', error);
});

wss.on('headers', (headers, _request) => {
  console.log('📋 WebSocket headers:', headers);
});

console.log('🔧 WebSocket server initialized with path /chat');

// Store connected clients (moved from direct implementation to using group.js)
// These are now exported from group.js for access in other parts of the application
// const chatClients = new Map();
// const rooms = new Map();

// WebSocket chat functionality (moved to group.js)
// The previous implementation has been moved to the group.js module for better organization

// broadcastToRoom function moved to group.js module

// Ultra-Powerful Security Middleware
app.use(backendSecurityManager.createSecurityHeaders());

// Performance monitoring middleware
app.use(backendPerformanceManager.createPerformanceMiddleware());

// Ultra-Powerful Rate Limiting with Security Integration
const limiter = backendSecurityManager.createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_RATE_LIMIT_TEST === 'true') {
  app.use(limiter);
}

// Handle preflight requests explicitly - BEFORE CORS middleware
app.options('*', (req, res) => {
  const origin = req.get('Origin');
  console.log('🔍 Preflight request from:', origin || 'no-origin');
  
  // Check if origin is allowed (same logic as CORS middleware)
  let isAllowed = false;
  
  if (!origin) {
    // Allow requests with no origin (Electron, mobile apps, curl)
    isAllowed = true;
  } else if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    // Allow all localhost and 127.0.0.1 origins
    isAllowed = true;
  } else if (origin.startsWith('file://')) {
    // Allow file:// origins for Electron
    isAllowed = true;
  } else if (origin === 'null') {
    // Allow null origins
    isAllowed = true;
  } else {
    // Check specific production origins
    const allowedOrigins = [
      'https://akashshare-se.onrender.com',
      'https://akashshare-se-backend.onrender.com',
      'http://44.229.227.142:5004'
    ];
    isAllowed = allowedOrigins.includes(origin);
  }
  
  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Request-Start, Cache-Control, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    res.status(200).end();
  } else {
    console.log('🚫 CORS blocked origin in preflight:', origin);
    res.status(403).end('Not allowed by CORS');
  }
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Electron, mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Allow all localhost and 127.0.0.1 origins
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow file:// origins for Electron
    if (origin.startsWith('file://')) {
      return callback(null, true);
    }
    
    // Allow null origins
    if (origin === 'null') {
      return callback(null, true);
    }
    
    // Allow specific production origins
    const allowedOrigins = [
      'https://akashshare-se.onrender.com',
      'https://akashshare-se-backend.onrender.com',
      'http://44.229.227.142:5004'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('🚫 CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Request-Start', 'Cache-Control', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
  handlePreflight: false
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

// Storage (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use enhanced filename sanitization
    const sanitizedName = sanitizeFilename(file.originalname);
    const uniqueName = `${Date.now()}_${sanitizedName}`;
    cb(null, uniqueName);
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
        console.error('Multer error:', err);
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
        console.error('Upload middleware error:', err);
        if (err.message && err.message.includes('File type')) {
          return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: `File processing failed: ${err.message}` });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      console.log('File validation passed:', req.file.originalname);
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
// Root endpoint
app.get("/", (req, res) => {
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

// Health check endpoint
app.get("/health", (req, res) => {
  console.log('🔍 Health check request from:', req.get('Origin') || 'no-origin', req.ip);
  
  const chatStats = getChatClients && getRooms ? {
    totalClients: getChatClients().size,
    totalRooms: getRooms().size,
    roomStats: {}
  } : {
    totalClients: 0,
    totalRooms: 0,
    roomStats: {}
  };

  // Get stats for each room if functions are available
  if (getRooms) {
    getRooms().forEach((clients, roomName) => {
      chatStats.roomStats[roomName] = clients.size;
    });
  }

  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT || 5004,
    host: process.env.HOST || '0.0.0.0',
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
    }
  });
});

// Add a health check endpoint specifically for Electron app to verify backend is running
app.get("/electron-health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend server is running",
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5004,
    host: process.env.HOST || "0.0.0.0"
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
  console.log('🔍 Upload request from:', req.get('Origin') || 'no-origin', req.ip);
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

    // Check if file was actually saved to disk
    if (!req.file || !fs.existsSync(req.file.path)) {
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
        // Clean up the uploaded file if database save fails
        try {
          if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
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
        const fullPath = path.isAbsolute(fileDoc.path) ? fileDoc.path : path.join(process.cwd(), fileDoc.path);
        const tags = await tagFile({ originalName: fileDoc.originalName, mimetype: fileDoc.mimetype, filePath: fullPath });
        const nsfw = await detectNSFW({ originalName: fileDoc.originalName, mimetype: fileDoc.mimetype });
        const ocr = await runOCR({ mimetype: fileDoc.mimetype, filePath: fullPath });
        const pii = await detectPII({ text: ocr.text });
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
    
    // Clean up uploaded file if it exists
    try {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
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

  // Check if file exists on disk
  if (!fs.existsSync(file.path)) {
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

// Serve static files from the React app build directory in production
// This must come AFTER all API routes to avoid conflicts
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../build');
  console.log('🗂️  Serving React build files from:', buildPath);
  app.use(express.static(buildPath));
  
  // Catch-all handler to serve the React app for any non-API routes
  // This must come AFTER all API routes to avoid conflicts
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // In development, still serve static files from public directory
  const publicPath = path.join(__dirname, '../public');
  console.log('🗂️  Serving static files from:', publicPath);
  app.use(express.static(publicPath));
  
  // Debug route to test static file serving
  app.get('/debug/static', (req, res) => {
    const akashPath = path.join(publicPath, 'akash.jpg');
    res.json({
      publicPath,
      akashExists: fs.existsSync(akashPath),
      akashPath
    });
  });
}

// Summary endpoint: quick extractive summary for recent messages in a room
app.get('/chat/:room/summary', (req, res) => {
  try {
    const roomName = (req.params.room || '').toLowerCase().trim();
    if (!roomName) return res.status(400).json({ error: 'Room is required' });
    const roomMap = getRooms();
    if (!roomMap || !roomMap.has(roomName)) {
      return res.status(404).json({ error: 'Room not found or has no messages' });
    }
    const history = getRoomHistory(roomName, 100);
    const texts = history.map(h => `${h.username}: ${h.message}`);
    const summary = summarizeMessages(texts);
    return res.json({ room: roomName, summary });
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
    let dbConnected = false;
    try {
      await connectToMongoDB();
      dbConnected = true;
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error.message);
      console.error("🔧 Continuing to start HTTP/WebSocket server in degraded mode.");
      console.error("📋 MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");
    }

    // Set default server configuration for local development
    if (!process.env.PORT) {
      process.env.PORT = '5004';
    }
    if (!process.env.HOST) {
      process.env.HOST = '0.0.0.0'; // Changed from 127.0.0.1 to 0.0.0.0 for Electron compatibility
    }

    // Start server regardless of DB status so Electron app can function (chat/UI)
    const PORT = process.env.PORT || 5004;
    const HOST = process.env.HOST || '0.0.0.0';
    console.log(`🔧 Configuring server to bind to ${HOST}:${PORT}`);

    server.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📁 File size limit: ${maxFileSize / (1024 * 1024)}MB`);
      console.log(`🔒 Allowed file types: ${allowedFileTypes.join(', ')}`);
      console.log(`⏱️  Rate limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / (60 * 1000)} minutes`);
      console.log(`🌐 API endpoints available at: http://${HOST}:${PORT}`);
      console.log(`💬 WebSocket chat available at: ws://${HOST}:${PORT}/chat`);
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

// Export app and WebSocket data structures for testing
export {
  app,
  getChatClients as chatClients,
  getRooms as rooms
};


