const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { param, validationResult } = require("express-validator");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const url = require("url");
require("dotenv").config();

// Environment validation
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocket.Server({ server, path: '/chat' });

// Store connected clients
const chatClients = new Map();
const rooms = new Map();

// WebSocket chat functionality
wss.on('connection', (ws, req) => {
  const query = url.parse(req.url, true).query;
  const username = query.username || 'Anonymous';
  const room = query.room || 'general';
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  
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
          // Remove from old room
          const oldRoom = clientInfo.room;
          if (rooms.has(oldRoom)) {
            rooms.get(oldRoom).delete(ws);
            broadcastToRoom(oldRoom, {
              type: 'userLeft',
              username,
              users: Array.from(rooms.get(oldRoom)).map(client => chatClients.get(client).username)
            });
          }
          
          // Add to new room
          const newRoom = message.room;
          clientInfo.room = newRoom;
          if (!rooms.has(newRoom)) {
            rooms.set(newRoom, new Set());
          }
          rooms.get(newRoom).add(ws);
          
          // Broadcast user joined new room
          broadcastToRoom(newRoom, {
            type: 'userJoined',
            username,
            users: Array.from(rooms.get(newRoom)).map(client => chatClients.get(client).username)
          });
          break;
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
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
    }
  });
  
  ws.on('error', (error) => {
    const clientData = chatClients.get(ws);
    const username = clientData?.username || 'Unknown';
    console.error(`🚨 WebSocket Error for user ${username}:`, error);
  });
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
});

// Only apply rate limiting if not in test mode
if (process.env.NODE_ENV !== 'test') {
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
        
        // Check if origin is from local network (192.168.x.x)
        if (/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        
        // Check if origin is from other private networks (10.x.x.x or 172.16-31.x.x)
        if (/^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
            /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        
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
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedFileTypes.join(', ')}`), false);
  }
};

// Storage (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    // Ensure uploads directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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

// Upload Route
app.post("/upload", validateUpload, async (req, res) => {
  try {
    console.log('Upload request received:', {
      filename: req.file?.originalname,
      size: req.file?.size,
      mimetype: req.file?.mimetype
    });
    
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
    if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
      return res.status(500).json({ error: "Database connection failed. Please check MongoDB Atlas connection and network access." });
    }
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
});

// Download Route with caching
app.get("/download/:code", validateDownload, async (req, res) => {
  try {
    // Use lean() for faster query performance
    const file = await File.findOne({ code: req.params.code }).lean();
    if (!file) {
      return res.status(404).json({ error: "File not found or code is invalid" });
    }

    // Check if file exists on disk
    const fs = require('fs');
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
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: "Download failed" });
  }
});

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

// Error handling middleware - must be defined after routes
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: `File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB` 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: "Too many files uploaded" });
    }
    return res.status(400).json({ error: "File upload error" });
  }
  
  if (err.message && err.message.includes('File type')) {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ error: "Internal server error" });
});

// MongoDB Connect - this should be at the end to ensure all routes are defined
mongoose.connect(process.env.MONGO_URI, {
  // Additional options for MongoDB Atlas
  serverSelectionTimeoutMS: 30000, // Increase server selection timeout
  socketTimeoutMS: 45000, // Increase socket timeout
  bufferCommands: false, // Disable command buffering
  // Retry connection options
  retryWrites: true,
  retryReads: true
})
.then(() => {
  console.log("✅ MongoDB Connected successfully");
  
  // Start server only after MongoDB connection is established
  const PORT = process.env.PORT || 5002;
  const HOST = process.env.HOST || 'localhost'; // Bind to localhost for testing
  
  console.log(`Attempting to start server on ${HOST}:${PORT}`);
  
  server.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on ${HOST}:${PORT}`);
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
    }
    process.exit(1);
  });
})
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err.message);
  console.error("📋 Please ensure MongoDB Atlas is accessible at:", process.env.MONGO_URI);
  console.error("💡 Check your network connection and MongoDB Atlas cluster status.");
  console.error("🔧 MongoDB Atlas connection requires:");
  console.error("   1. Correct connection string");
  console.error("   2. Network access configured in MongoDB Atlas");
  console.error("   3. Proper IP whitelist settings");
  process.exit(1);
});

// File Schema
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

// Export app for testing
module.exports = app;


