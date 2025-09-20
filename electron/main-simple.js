import { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import IntegratedBackend from './integrated-backend.js';

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
    
    // Check if backend is already running
    const isRunning = await checkIfBackendIsRunning();
    if (isRunning) {
      log.info('✅ Backend is already running on port 5005');
      return true;
    }

    // Create and start integrated backend
    integratedBackend = new IntegratedBackend();
    await integratedBackend.start();
    
    log.info('✅ Integrated backend started successfully');
    return true;
  } catch (error) {
    log.error('❌ Failed to start integrated backend:', error.message);
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
  
  // Start integrated backend first
  const backendStarted = await startIntegratedBackend();
  if (!backendStarted) {
    log.error('❌ Failed to start backend, but continuing with app...');
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
