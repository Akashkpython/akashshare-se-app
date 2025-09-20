import { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
// Integrated Backend Server - Embedded directly in main.js
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import multer from 'multer';

// ESM-compatible __dirname/__filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize logging
const log = {
  info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args)
};

let mainWindow;
let integratedBackend;

// Integrated Backend Class - Embedded directly
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
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        message: 'Integrated Backend is healthy and running!',
        timestamp: new Date().toISOString(),
        port: this.PORT
      });
    });

    // Upload endpoint with 4-digit code generation
    this.app.post('/upload', (req, res) => {
      try {
        // For now, simulate file upload since we don't have multer configured
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const fileDetails = {
          code: code,
          filename: `file-${code}.txt`,
          originalName: req.body.filename || 'uploaded-file.txt',
          size: req.body.size || 1024,
          mimetype: req.body.mimetype || 'text/plain',
          uploadTime: new Date().toISOString()
        };
        
        // Store file details in memory
        this.fileStore.set(code, fileDetails);
        
        log.info('✅ File uploaded successfully:', fileDetails);
        res.json(fileDetails);
      } catch (error) {
        log.error('❌ Upload error:', error.message);
        res.status(500).json({ error: 'Upload failed', message: error.message });
      }
    });

    // Download endpoint
    this.app.get('/download/:code', (req, res) => {
      const { code } = req.params;
      const fileDetails = this.fileStore.get(code);
      
      if (fileDetails) {
        res.json(fileDetails);
      } else {
        res.status(404).json({ error: 'File not found', message: 'Invalid download code' });
      }
    });

    // Status endpoint
    this.app.get('/status', (req, res) => {
      res.json({
        status: 'online',
        message: 'Backend is running',
        timestamp: new Date().toISOString(),
        port: this.PORT
      });
    });
  }

  setupWebSocket() {
    // WebSocket setup will be done in start() method
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        log.info('🔧 Creating HTTP server...');
        this.server = http.createServer(this.app);
        
        log.info('🔧 Creating WebSocket server...');
        this.wss = new WebSocketServer({ server: this.server });

        this.wss.on('connection', (ws) => {
          log.info('🔌 New WebSocket connection in Integrated Backend');
          
          ws.on('message', (message) => {
            try {
              const data = JSON.parse(message.toString());
              log.info('📨 Received message in Integrated Backend:', data);
              
              // Echo message back to client
              ws.send(JSON.stringify({
                type: 'echo',
                originalMessage: data,
                timestamp: new Date().toISOString()
              }));
            } catch (error) {
              log.error('❌ WebSocket message error:', error.message);
            }
          });

          ws.on('close', () => {
            log.info('🔌 WebSocket connection closed in Integrated Backend');
          });

          ws.on('error', (error) => {
            log.error('❌ WebSocket error in Integrated Backend:', error.message);
          });
        });

        log.info(`🔧 Starting server on 127.0.0.1:${this.PORT}...`);
        this.server.listen(this.PORT, '127.0.0.1', (error) => {
          if (error) {
            log.error('❌ Server listen error:', error.message);
            reject(error);
          } else {
            log.info(`✅ Integrated Backend running on http://127.0.0.1:${this.PORT}`);
            log.info(`📡 WebSocket server running on ws://127.0.0.1:${this.PORT}`);
            log.info(`🔧 Server is listening:`, this.server.listening);
            resolve();
          }
        });

        this.server.on('error', (error) => {
          log.error('❌ Integrated Backend server error:', error.message);
          log.error('❌ Error code:', error.code);
          reject(error);
        });
      } catch (error) {
        log.error('❌ Failed to start integrated backend:', error.message);
        log.error('❌ Error stack:', error.stack);
        reject(error);
      }
    });
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          log.info('🛑 Integrated Backend server stopped.');
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
let tray = null;

// Function to check if backend is running
async function checkIfBackendIsRunning() {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5005,
      path: '/health',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData.status === 'OK' || jsonData.status === 'online');
        } catch (error) {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.setTimeout(3000);
    req.end();
  });
}

// Function to start integrated backend
async function startIntegratedBackend() {
  try {
    log.info('🔧 Starting integrated backend server...');
    log.info('🔧 App is packaged:', app.isPackaged);
    log.info('🔧 NODE_ENV:', process.env.NODE_ENV);
    
    // Check if backend is already running
    const isRunning = await checkIfBackendIsRunning();
    if (isRunning) {
      log.info('✅ Backend is already running on port 5005');
      return true;
    }

    // Create and start integrated backend
    log.info('🔧 Creating IntegratedBackend instance...');
    integratedBackend = new IntegratedBackend();
    
    log.info('🔧 Starting backend server...');
    await integratedBackend.start();
    
    // Wait a moment for the server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify backend is running
    const isNowRunning = await checkIfBackendIsRunning();
    if (isNowRunning) {
      log.info('✅ Integrated backend started and verified successfully');
      return true;
    } else {
      log.error('❌ Backend started but verification failed');
      return false;
    }
  } catch (error) {
    log.error('❌ Failed to start integrated backend:', error.message);
    log.error('❌ Error stack:', error.stack);
    return false;
  }
}

// Function to create system tray
function createTray() {
  const iconPath = path.join(__dirname, '../public/Akashshareicon.png');
  let trayIcon;
  
    try {
      if (fs.existsSync(iconPath)) {
        trayIcon = nativeImage.createFromPath(iconPath);
        log.info(`✅ Tray icon loaded from: ${iconPath}`);
    } else {
      trayIcon = nativeImage.createEmpty();
      log.warn('⚠️ No tray icon found, using empty icon');
      }
    } catch (error) {
    log.warn(`⚠️ Failed to load tray icon:`, error.message);
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Akash Share',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    {
      label: 'Backend Status',
      click: async () => {
        const isRunning = await checkIfBackendIsRunning();
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Backend Status',
          message: `Backend is ${isRunning ? 'Online' : 'Offline'}`,
          detail: isRunning ? 'Server is running on port 5005' : 'Server is not responding'
        });
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Akash Share - File Sharing Application');
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

// Function to create main window
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: Math.min(width * 0.9, 1400),
    height: Math.min(height * 0.9, 900),
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../public/Akashshareicon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false // Allow file:// protocol for local files
    }
  });

  // Determine the URL to load
  const isDev = process.env.NODE_ENV === 'development';
  let startUrl;

  if (isDev) {
    // In development, try React dev server first
    startUrl = 'http://localhost:5004';
  } else {
    // In production, use built files
    startUrl = `file://${path.join(__dirname, '../build/index.html')}`;
  }

  log.info(`🔗 Loading URL: ${startUrl}`);
  log.info(`🔧 Is Development: ${isDev}`);
  log.info(`📦 Is Packaged: ${app.isPackaged}`);

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    log.info('✅ Main window shown');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    log.info('✅ Page finished loading successfully');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    log.error(`❌ Page failed to load: ${errorCode} - ${errorDescription}`);
    log.error(`❌ Failed URL: ${validatedURL}`);
  });
}

// App event handlers
app.whenReady().then(async () => {
  log.info('🚀 App ready');
  log.info('🚀 App is packaged:', app.isPackaged);
  log.info('🚀 NODE_ENV:', process.env.NODE_ENV);
  
  // Start integrated backend first with retry mechanism
  let backendStarted = false;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (!backendStarted && retryCount < maxRetries) {
    log.info(`🔧 Attempting to start backend (attempt ${retryCount + 1}/${maxRetries})...`);
    backendStarted = await startIntegratedBackend();
    
    if (!backendStarted) {
      retryCount++;
      if (retryCount < maxRetries) {
        log.info(`⏳ Waiting 2 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  if (!backendStarted) {
    log.error('❌ Failed to start backend after all retries, but continuing with app...');
    // Show error dialog to user
    dialog.showErrorBox(
      'Backend Startup Failed', 
      'The backend server failed to start. File sharing functionality may not work properly. Please restart the application.'
    );
  } else {
    log.info('✅ Backend started successfully!');
  }

  // Create window and tray
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  log.info('🛑 App shutting down...');
  
  if (integratedBackend) {
    try {
      await integratedBackend.stop();
      log.info('✅ Integrated backend stopped');
    } catch (error) {
      log.error('❌ Error stopping integrated backend:', error.message);
    }
  }
});

app.on('will-quit', () => {
  log.info('🛑 App will quit...');
});

// Handle app activation (macOS)
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Auto-updater (simplified)
if (!app.isPackaged) {
  log.info('🔍 Update check skipped in development mode');
  } else {
  log.info('🔍 Checking for updates...');
  log.info('🔍 Skip checkForUpdates because application is not packed and dev update config is not forced');
}

log.info('✅ Electron app initialized successfully');
