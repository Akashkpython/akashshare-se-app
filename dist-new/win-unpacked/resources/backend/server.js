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
import { GridFSBucket } from "mongodb";
import connectToMongoDB from "./mongo-connection.js";

// Suppress Mongoose deprecation warning for strictQuery
mongoose.set('strictQuery', false);
import { validateFile } from "./utils/fileValidation.js";
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
import { tagFile, detectNSFW } from "./services/ai/classify.js";
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
      'http://44.229.227.142:5005'
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
  origin: (origin, callback) => {
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
    
    // Allow app://. origins for Electron
    if (origin.startsWith('app://.')) {
      return callback(null, true);
    }
    
    // Allow null origins
    if (origin === 'null') {
      return callback(null, true);
    }
    
    // Allow specific production origins
    const allowedOrigins = [
      'https://akashshare-se.onrender.com',
      'https://akash-share-backend.onrender.com',
      'http://44.229.227.142:5005',
      // Allow local network IPs for LAN access
      'http://192.168.0.185:5005'
    ];
    
    // Allow any local network IP
    if (origin.match(/^http:\/\/192\.168\.\d+\.\d+:(5005)$/)) {
      return callback(null, true);
    }
    
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

// GridFS Storage for Render deployment (persistent file storage)
let gridFSBucket;

// Initialize GridFS bucket when MongoDB connects
const initializeGridFS = () => {
  if (mongoose.connection.readyState === 1) {
    gridFSBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'files'
    });
    console.log('✅ GridFS bucket initialized for persistent file storage');
  }
};

// Storage (Multer) - Memory storage for GridFS
const storage = multer.memoryStorage();

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

// File Schema - Updated for GridFS storage
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
  gridFSId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
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

// Simple test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Backend is working!", timestamp: new Date().toISOString() });
});

// Simple status endpoint that will always work
app.get("/status", (req, res) => {
  res.json({ 
    status: "online", 
    message: "Backend is running", 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5005
  });
});

// Health check endpoints - defined before static file serving to avoid conflicts
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
    port: process.env.PORT || 5005,
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
    port: process.env.PORT || 5005,
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
    const sanitizedFilename = securityValidation.sanitizedFilename || req.file.originalname;
    
    console.log('Upload request received:', {
      filename: sanitizedFilename,
      originalName: req.file?.originalname,
      size: req.file?.size,
      mimetype: req.file?.mimetype,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Check if file was received in memory
    if (!req.file || !req.file.buffer) {
      return res.status(500).json({ error: "File not received" });
    }

    // Store file in GridFS
    if (!gridFSBucket) {
      return res.status(500).json({ error: "File storage not initialized" });
    }

    // Generate a secure random code with retry logic to avoid duplicates
    let randomCode;
    let newFile;
    let uploadStream = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    try {
      while (attempts < maxAttempts) {
        randomCode = backendSecurityManager.generateSecureRandom(4, 'numeric');
        
        try {
          // Create upload stream for this attempt
          uploadStream = gridFSBucket.openUploadStream(sanitizedFilename, {
            metadata: {
              originalName: req.file.originalname,
              mimetype: req.file.mimetype,
              uploadedAt: new Date()
            }
          });

          // Write file to GridFS
          await new Promise((resolve, reject) => {
            uploadStream.end(req.file.buffer, (error) => {
              if (error) reject(error);
              else resolve();
            });
          });

          newFile = new File({
            filename: sanitizedFilename,
            originalName: req.file.originalname,
            gridFSId: uploadStream.id,
            code: randomCode,
            size: req.file.size,
            mimetype: req.file.mimetype
          });
          
          await newFile.save();
          break; // Success, exit the loop
        } catch (saveErr) {
          // Clean up GridFS file if database save fails
          try {
            if (uploadStream && uploadStream.id) {
              await gridFSBucket.delete(uploadStream.id);
            }
          } catch (cleanupErr) {
            console.error('GridFS cleanup error:', cleanupErr);
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
    } catch (uploadErr) {
      // Clean up GridFS file if upload fails
      try {
        if (uploadStream && uploadStream.id && gridFSBucket) {
          await gridFSBucket.delete(uploadStream.id);
        }
      } catch (cleanupErr) {
        console.error('GridFS cleanup error:', cleanupErr);
      }
      throw uploadErr;
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
        
        // For GridFS, we'll skip file-based AI analysis for now
        // as it requires file content access which is more complex with GridFS
        // This can be enhanced later with proper GridFS file reading
        const tags = await tagFile({ originalName: fileDoc.originalName, mimetype: fileDoc.mimetype });
        const nsfw = await detectNSFW({ originalName: fileDoc.originalName, mimetype: fileDoc.mimetype });
        
        await File.updateOne({ _id: fileDoc._id }, {
          $set: {
            ai: {
              tags,
              nsfw: { flag: !!nsfw.nsfw, confidence: Number(nsfw.confidence || 0) },
              ocr: { performed: false, textPreview: '' },
              pii: { performed: false, items: [] }
            }
          }
        });
      } catch (e) {
        console.warn('AI analysis failed:', e?.message);
      }
    })();
  } catch (err) {
    console.error('Upload error:', err);
    
    if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
      return res.status(500).json({ error: "Database connection failed. Please check MongoDB Atlas connection and network access." });
    }
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
}, { fileOperation: 'upload' }));

// Download Route with GridFS support
app.get("/download/:code", validateDownload, asyncErrorHandler(async (req, res) => {
  const { code } = req.params;
  
  const file = await File.findOne({ code });
  if (!file) {
    return res.status(404).json({ error: "File not found or code is invalid" });
  }

  if (!gridFSBucket) {
    return res.status(500).json({ error: "File storage not initialized" });
  }

  try {
    // Check if file exists in GridFS
    const gridFSFile = await gridFSBucket.find({ _id: file.gridFSId }).toArray();
    if (gridFSFile.length === 0) {
      await File.deleteOne({ _id: file._id });
      return res.status(404).json({ error: "File not found in storage" });
    }

    // Set response headers
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName || file.filename}"`);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('ETag', file.code);

    // Stream file from GridFS
    const downloadStream = gridFSBucket.openDownloadStream(file.gridFSId);
    
    downloadStream.on('error', (error) => {
      console.error('GridFS download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Download failed" });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: "Download failed" });
  }
}, { fileOperation: 'download' }));

// Serve static files from the React app build directory in production
// This must come AFTER all API routes to avoid conflicts
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible build paths for different deployment scenarios
  const possibleBuildPaths = [
    path.join(__dirname, '../build'),           // Local development
    path.join(__dirname, '../src/build'),       // Render deployment
    path.join(process.cwd(), 'build'),          // Alternative path
    path.join(process.cwd(), 'src/build')       // Render alternative
  ];
  
  let buildPath = null;
  for (const testPath of possibleBuildPaths) {
    if (fs.existsSync(testPath)) {
      buildPath = testPath;
      break;
    }
  }
  
  if (buildPath) {
    console.log('🗂️  Serving React build files from:', buildPath);
    app.use(express.static(buildPath));
    
    // Catch-all handler to serve the React app for any non-API routes
    // This must come AFTER all API routes to avoid conflicts
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/') || req.path.startsWith('/health') || req.path.startsWith('/electron-health') || req.path.startsWith('/debug/') || req.path.startsWith('/upload') || req.path.startsWith('/download') || req.path.startsWith('/chat/')) {
        return next();
      }
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    console.log('⚠️  No React build directory found, serving API only');
    // Serve a simple message for non-API routes
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/') || req.path.startsWith('/health') || req.path.startsWith('/electron-health') || req.path.startsWith('/debug/') || req.path.startsWith('/upload') || req.path.startsWith('/download') || req.path.startsWith('/chat/')) {
        return next();
      }
      res.json({ 
        message: 'Akash Share Backend API', 
        status: 'running',
        note: 'Frontend build files not found - API only mode'
      });
    });
  }
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
      // Initialize GridFS after successful MongoDB connection
      initializeGridFS();
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error.message);
      console.error("🔧 Continuing to start HTTP/WebSocket server in degraded mode.");
      console.error("📋 MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");
    }

    // Set default server configuration for local development
    if (!process.env.PORT) {
      process.env.PORT = '5005';
    }
    // Change HOST from '0.0.0.0' to '0.0.0.0' to accept connections from any IP
    if (!process.env.HOST) {
      process.env.HOST = '0.0.0.0'; // This allows connections from any IP address
    }

    // Start server regardless of DB status so Electron app can function (chat/UI)
    const PORT = process.env.PORT || 5005;
    // Change HOST to accept connections from any IP address
    const HOST = process.env.HOST || '0.0.0.0'; // Changed from '127.0.0.1' to '0.0.0.0'
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


