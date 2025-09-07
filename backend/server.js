import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import multer from "multer";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, validationResult, param } from "express-validator";
import { WebSocketServer } from "ws";
import http from "http";
import shortid from "shortid";
import connectToMongoDB from "./mongo-connection.js";
import { validateFile, sanitizeFilename } from "./utils/fileValidation.js";
import { 
  isRateLimited, 
  recordConnectionAttempt, 
  hasExceededConnectionLimit, 
  incrementConnectionCount, 
  decrementConnectionCount 
} from "./utils/websocketRateLimit.js";
import { 
  logError, 
  asyncErrorHandler, 
  globalErrorHandler, 
  setupGlobalErrorHandlers, 
  validateEnvironment 
} from "./utils/errorHandler.js";
import { URL } from "url";
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

// Override MONGO_URI for testing - but only if not already set in test environment
if (process.env.NODE_ENV === 'test' && !process.env.MONGO_URI.includes('localhost')) {
  process.env.MONGO_URI = 'mongodb://localhost:27017/akashshare_test';
  console.log('🔧 Using test MongoDB URI:', process.env.MONGO_URI);
}

const app = express();
// Explicitly create server with IPv4 to avoid ::1 binding issues on Render
const server = http.createServer({ family: 4 }, app);

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/chat' });

// Store connected clients
const chatClients = new Map();
const rooms = new Map();

// WebSocket chat functionality
wss.on('connection', (ws, req) => {
  try {
    const parsedUrl = new URL(req.url, 'http://localhost');
    const username = parsedUrl.searchParams.get('username') || 'Anonymous';
    const room = parsedUrl.searchParams.get('room') || 'general';
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    // Rate limiting checks
    recordConnectionAttempt(clientIP);
    
    if (isRateLimited(clientIP)) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Rate limit exceeded. Too many connection attempts.'
      }));
      ws.close(1008, 'Rate limit exceeded');
      return;
    }
    
    if (hasExceededConnectionLimit(clientIP)) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Connection limit exceeded for this IP.'
      }));
      ws.close(1008, 'Connection limit exceeded');
      return;
    }
    
    // Increment connection count
    incrementConnectionCount(clientIP);
    
    // Validate username and room
    if (username.length > 50) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Username too long (max 50 characters)'
      }));
      ws.close();
      return;
    }
    
    if (room.length > 50) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Room name too long (max 50 characters)'
      }));
      ws.close();
      return;
    }
    
    console.log(`🔗 WebSocket Connection:`);
    console.log(`  👤 User: ${username}`);
    console.log(`  🏠 Room: ${room}`);
    console.log(`  🌐 IP: ${clientIP}`);
    console.log(`  📍 URL: ${req.url}`);
    
    // Store client info
    const clientInfo = { username, room, ws, connectedAt: new Date() };
    chatClients.set(ws, clientInfo);
    
    // Add to room
    if (!rooms.has(room)) {
      rooms.set(room, new Set());
      console.log(`  🆕 Created new room: ${room}`);
    }
    rooms.get(room).add(ws);
    
    const roomUserCount = rooms.get(room).size;
    console.log(`  📊 Room ${room} now has ${roomUserCount} users`);
    
    // Broadcast user joined
    const userList = Array.from(rooms.get(room)).map(client => chatClients.get(client).username);
    broadcastToRoom(room, {
      type: 'userJoined',
      username,
      users: userList,
      timestamp: new Date().toISOString()
    });
    
    console.log(`  👥 Broadcasting user list:`, userList);
    
    // Send current user list
    const welcomeMessage = {
      type: 'userList',
      users: userList
    };
    
    try {
      ws.send(JSON.stringify(welcomeMessage));
      console.log(`  ✅ Welcome message sent to ${username}`);
    } catch (error) {
      console.error(`  ❌ Failed to send welcome message:`, error);
    }
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        
        switch (message.type) {
          case 'message':
            broadcastToRoom(room, {
              type: 'message',
              username,
              message: message.message,
              room: message.room || room,
              timestamp: new Date().toISOString()
            });
            break;
              
            case 'switchRoom': {
              try {
                // Validate new room name
                const newRoom = message.room;
                if (!newRoom || typeof newRoom !== 'string') {
                  ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid room name'
                  }));
                  break;
                }

                // Remove from old room
                const oldRoom = clientInfo.room;
                if (rooms.has(oldRoom)) {
                  rooms.get(oldRoom).delete(ws);
                  // Notify others in old room
                  broadcastToRoom(oldRoom, {
                    type: 'userLeft',
                    username,
                    users: Array.from(rooms.get(oldRoom)).map(client => chatClients.get(client).username)
                  });
                }

                // Add to new room
                clientInfo.room = newRoom;
                if (!rooms.has(newRoom)) {
                  rooms.set(newRoom, new Set());
                }
                rooms.get(newRoom).add(ws);

                // Notify others in new room
                broadcastToRoom(newRoom, {
                  type: 'userJoined',
                  username,
                  users: Array.from(rooms.get(newRoom)).map(client => chatClients.get(client).username)
                });

                // Send confirmation to the client that initiated the switch
                const userList = Array.from(rooms.get(newRoom)).map(client => chatClients.get(client).username);
                ws.send(JSON.stringify({
                  type: 'roomSwitched',
                  room: newRoom,
                  users: userList
                }));

                console.log(`  🔄 ${username} switched from room ${oldRoom} to ${newRoom}`);
              } catch (error) {
                console.error('Error switching rooms:', error);
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Failed to switch rooms'
                }));
              }
              break;
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
          // Send error message to client
          try {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to process message'
            }));
          } catch (sendErr) {
            console.error('Failed to send error to client:', sendErr);
          }
        }
      });
    
    ws.on('close', (code, reason) => {
      const clientData = chatClients.get(ws);
      if (clientData) {
        const { username, room: currentRoom, connectedAt } = clientData;
        const connectionDuration = new Date() - connectedAt;
        
        console.log(`🔌 WebSocket Disconnection:`);
        console.log(`  👤 User: ${username}`);
        console.log(`  🏠 Room: ${currentRoom}`);
        console.log(`  🗑️ Code: ${code}`);
        console.log(`  📝 Reason: ${reason || 'No reason provided'}`);
        console.log(`  ⏱️ Duration: ${Math.round(connectionDuration / 1000)}s`);
        
        // Decrement connection count for IP
        decrementConnectionCount(clientIP);
        
        // Remove from room
        if (rooms.has(currentRoom)) {
          rooms.get(currentRoom).delete(ws);
          const remainingUsers = Array.from(rooms.get(currentRoom)).map(client => chatClients.get(client).username);
          
          console.log(`  📊 Room ${currentRoom} now has ${remainingUsers.length} users`);
          
          broadcastToRoom(currentRoom, {
            type: 'userLeft',
            username,
            users: remainingUsers
          });
        }
        
        // Remove client
        chatClients.delete(ws);
      } else {
        console.log(`❌ Unknown WebSocket disconnected (code: ${code}, reason: ${reason || 'none'})`);
        // Still decrement connection count even for unknown clients
        decrementConnectionCount(clientIP);
      }
    });
    
    ws.on('error', (error) => {
      const clientData = chatClients.get(ws);
      const username = clientData?.username || 'Unknown';
      console.error(`🚨 WebSocket Error for user ${username}:`, error);
      
      // Clean up on error
      if (clientData) {
        const { room: currentRoom } = clientData;
        
        // Decrement connection count
        decrementConnectionCount(clientIP);
        
        // Remove from room
        if (rooms.has(currentRoom)) {
          rooms.get(currentRoom).delete(ws);
          broadcastToRoom(currentRoom, {
            type: 'userLeft',
            username,
            users: Array.from(rooms.get(currentRoom)).map(client => chatClients.get(client).username)
          });
        }
        
        // Remove client
        chatClients.delete(ws);
      }
    });
  } catch (error) {
    console.error('Error in WebSocket connection handler:', error);
    try {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Connection initialization failed'
      }));
    } catch (sendErr) {
      console.error('Failed to send error to client:', sendErr);
    }
    ws.close();
  }
});

function broadcastToRoom(room, message) {
  if (rooms.has(room)) {
    rooms.get(room).forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Add logging for rate limiting in test mode
    if (process.env.NODE_ENV === 'test') {
      console.log(`🚫 Rate limit exceeded for IP: ${req.ip}, URL: ${req.url}`);
    }
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    });
  }
});

if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_RATE_LIMIT_TEST === 'true') {
  app.use(limiter);
}

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with your actual domain
    : function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
          'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5002', 'http://localhost:5003', 'http://localhost:5004', 'http://localhost:59489',
          'http://127.0.0.1:3000', 'http://127.0.0.1:5002', 'http://127.0.0.1:5003', 'http://127.0.0.1:5004', 'http://127.0.0.1:59489',
          'http://192.168.0.185:3000', 'http://192.168.0.185:3001', 'http://192.168.0.185:5002', 'http://192.168.0.185:5003', 'http://192.168.0.185:5004', 'http://192.168.0.185:59489'
        ];
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // Removed overly permissive private network access for security
        // Only allow explicitly listed origins above
        
        // For development, log the origin for debugging
        console.log('🚫 CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      },
  credentials: true
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
    maxlength: 10
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
    expires: 24 * 60 * 60 // Auto-delete after 24 hours
  }
});

// Add indexes for better query performance
FileSchema.index({ code: 1 });
FileSchema.index({ uploadedAt: 1 });

const File = mongoose.model("File", FileSchema);

// Health check endpoint
app.get("/health", (req, res) => {
  const totalClients = chatClients.size;
  const totalRooms = rooms.size;
  const roomStats = {};

  // Get stats for each room
  rooms.forEach((clients, roomName) => {
    roomStats[roomName] = clients.size;
  });

  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    websocket: {
      totalClients,
      totalRooms,
      roomStats
    },
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

// Upload Route with enhanced error handling
app.post("/upload", validateUpload, asyncErrorHandler(async (req, res) => {
  try {
    console.log('Upload request received:', {
      filename: req.file?.originalname,
      size: req.file?.size,
      mimetype: req.file?.mimetype
    });

    // Check if file was actually saved to disk
    if (!req.file || !fs.existsSync(req.file.path)) {
      return res.status(500).json({ error: "File not saved to disk" });
    }

    // Generate a 4-digit random code with retry logic to avoid duplicates
    let randomCode;
    let newFile;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      
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
    
    console.log('File saved successfully with code:', randomCode);
    
    res.status(201).json({ 
      code: randomCode,
      filename: req.file.originalname,
      size: req.file.size,
      message: "File uploaded successfully"
    });
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
    const fs = require('fs');
    const akashPath = path.join(publicPath, 'akash.jpg');
    res.json({
      publicPath,
      akashExists: fs.existsSync(akashPath),
      akashPath
    });
  });
}

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
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await connectToMongoDB(process.env.MONGO_URI);

      // Start server only after MongoDB connection is established
      // Use Render's PORT if available, otherwise default to 5002
      const PORT = process.env.PORT || 5002;

      // Explicitly bind to 0.0.0.0 for Render deployment
      const HOST = process.env.HOST || '0.0.0.0';

      console.log(`🔧 Configuring server to bind to ${HOST}:${PORT}`);

      server.listen(PORT, HOST, () => {
        // Log the exact message requested for Render detection
        console.log(`Server running on http://${HOST}:${PORT}`);
        console.log(`📁 File size limit: ${maxFileSize / (1024 * 1024)}MB`);
        console.log(`🔒 Allowed file types: ${allowedFileTypes.join(', ')}`);
        console.log(`⏱️  Rate limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / (60 * 1000)} minutes`);
        console.log(`🌐 API endpoints available at: http://${HOST}:${PORT}`);
        console.log(`💬 WebSocket chat available at: ws://${HOST}:${PORT}/chat`);

        // In production, serve the React app
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
        // Don't exit in production, let Render handle it
        if (process.env.NODE_ENV !== 'production') {
          process.exit(1);
        }
      });
    } catch (error) {
      console.error("❌ Failed to start server due to MongoDB connection issues:", error.message);
      console.error("🔧 Please check your MongoDB connection string and network access.");
      console.error("📋 MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");
      // Don't exit in production, let Render handle it
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
    }
  })();
}

// Export app and WebSocket data structures for testing
export {
  app,
  chatClients,
  rooms
};


