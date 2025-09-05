const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Function to safely load a module with detailed error reporting
function safeRequire(moduleName, fallback = null) {
  try {
    const module = require(moduleName);
    console.log(`✅ Successfully loaded module: ${moduleName}`);
    return module;
  } catch (error) {
    console.warn(`⚠️ Failed to load module: ${moduleName}`);
    console.warn('Error details:', error.message);
    console.warn('Error stack:', error.stack);
    
    // Additional debugging for electron-log specifically
    if (moduleName === 'electron-log') {
      try {
        const modulePath = path.join(__dirname, '../node_modules/electron-log');
        console.warn('Checking module path:', modulePath);
        console.warn('Module exists:', fs.existsSync(modulePath));
        
        if (fs.existsSync(modulePath)) {
          const packageJsonPath = path.join(modulePath, 'package.json');
          if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            console.warn('Module package.json version:', packageJson.version);
          }
        }
      } catch (pathError) {
        console.warn('Error checking module path:', pathError.message);
      }
    }
    
    return fallback;
  }
}

// Try to load electron-log, with fallback if not available
let autoUpdater, log;

// Load electron-log with improved error handling
const electronLog = safeRequire('electron-log');
if (electronLog) {
  log = electronLog;
  try {
    const electronUpdater = safeRequire('electron-updater');
    if (electronUpdater) {
      autoUpdater = electronUpdater.autoUpdater;
      // Configure autoUpdater logger
      autoUpdater.logger = log;
      autoUpdater.logger.transports.file.level = 'info';
      autoUpdater.logger.transports.console.level = 'info';
      console.log = log.info;
      console.error = log.error;
      console.warn = log.warn;
      log.info('✅ electron-log and electron-updater loaded successfully');
    } else {
      throw new Error('electron-updater not available');
    }
  } catch (error) {
    console.warn('⚠️ electron-updater not available, using basic console logging');
    console.warn('Error details:', error.message);
    autoUpdater = null;
  }
} else {
  console.warn('⚠️ electron-log not available, using basic console logging');
  
  // Create a more robust fallback logging system
  const createFallbackLogger = () => {
    const formatDate = () => new Date().toISOString();
    return {
      info: (...args) => console.log(`[INFO ${formatDate()}]`, ...args),
      error: (...args) => console.error(`[ERROR ${formatDate()}]`, ...args),
      warn: (...args) => console.warn(`[WARN ${formatDate()}]`, ...args),
      transports: {
        file: { level: 'info' },
        console: { level: 'info' }
      }
    };
  };
  
  log = createFallbackLogger();
  log.info('🔧 Using fallback logger');
  autoUpdater = null;
}

// Create a mock autoUpdater that does nothing but logs if electron-updater is not available
if (!autoUpdater) {
  autoUpdater = {
    logger: log,
    checkForUpdatesAndNotify: () => {
      log.info('ℹ️ Update check skipped - autoUpdater not available');
      return Promise.resolve();
    },
    on: (event, _callback) => {
      log.info(`ℹ️ AutoUpdater event listener registered for: ${event}`);
      // Do nothing - no events will be emitted
    },
    setFeedURL: (url) => {
      log.info(`ℹ️ AutoUpdater feed URL set:`, url);
    }
  };
}

// Add performance monitoring
const startTime = Date.now();

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Set update feed URL from package.json
try {
  const packageJson = require('../package.json');
  if (packageJson.build && packageJson.build.publish && packageJson.build.publish[0]) {
    const publishConfig = packageJson.build.publish[0];
    if (publishConfig.provider === 'generic' && publishConfig.url) {
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: publishConfig.url
      });
      log.info(`✅ Auto-updater feed URL set to: ${publishConfig.url}`);
    }
  }
} catch (error) {
  log.warn('⚠️ Could not set auto-updater feed URL:', error.message);
}

// Add performance tracking
log.info(`🚀 Electron main process started at ${new Date().toISOString()}`);

// Conditionally import electron-devtools-installer in development mode
if (isDev) {
  try {
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
    app.whenReady().then(() => {
      installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => log.info(`Added Extension: ${name}`))
        .catch((err) => log.warn('An error occurred: ', err));
    });
  } catch (err) {
    log.warn('electron-devtools-installer not available in this environment');
  }
}

// Function to create the main window
function createWindow() {
  // Get screen size to set appropriate window dimensions
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  // Calculate window dimensions (80% of screen size, with minimums)
  const windowWidth = Math.max(Math.min(Math.floor(width * 0.8), 1400), 800);
  const windowHeight = Math.max(Math.min(Math.floor(height * 0.8), 900), 600);

  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0f0f0f',
    // Remove custom title bar - use default OS title bar
    frame: true, // Use default OS window frame
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      sandbox: false, // Required for some Electron functionality
      // Add performance optimizations
      devTools: isDev, // Only enable dev tools in development
      backgroundThrottling: false, // Prevent throttling when window is not focused
    },
    // Add window icon for Windows
    icon: path.join(__dirname, '../public/Akashshareicon.png')
  });

  // Remove default menu bar
  mainWindow.setMenuBarVisibility(false);

  // Performance tracking
  const windowCreateTime = Date.now();
  log.info(`⏱️ BrowserWindow created in ${windowCreateTime - startTime}ms with dimensions ${windowWidth}x${windowHeight}`);

  // Load the appropriate URL based on the environment
  const startUrl = isDev 
    ? 'http://localhost:3000'  // React dev server
    : `file://${path.join(__dirname, '../build/index.html')}`; // Production build

  mainWindow.loadURL(startUrl);
  
  // Performance tracking
  const loadUrlTime = Date.now();
  log.info(`⏱️ URL loading started in ${loadUrlTime - windowCreateTime}ms`);

  // Handle navigation to external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open all external links in the default browser
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Handle page title updates
  mainWindow.on('page-title-updated', (event) => {
    // Prevent the window title from being changed by the web page
    event.preventDefault();
  });

  // Performance tracking for page load
  mainWindow.webContents.on('did-finish-load', () => {
    const finishLoadTime = Date.now();
    log.info(`✅ Main window loaded in ${finishLoadTime - startTime}ms`);
    // Set the window title explicitly
    mainWindow.setTitle('Akash Share');
  });

  // Handle errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    log.error(`❌ Failed to load: ${errorDescription} (${errorCode}) for URL: ${validatedURL}`);
    // Show an error page or retry mechanism could be implemented here
  });

  return mainWindow;
}

// Function to ensure backend dependencies are installed
async function ensureBackendDependencies() {
  try {
    const backendDir = path.join(__dirname, '../backend');
    const nodeModulesPath = path.join(backendDir, 'node_modules');
    
    log.info(`🔧 Checking backend dependencies in: ${backendDir}`);
    
    // Check if node_modules exists
    if (!fs.existsSync(nodeModulesPath)) {
      log.warn('⚠️ Backend dependencies not found, attempting to install...');
      
      // Try to install backend dependencies
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      try {
        log.info('🔧 Installing backend dependencies...');
        const { stdout, stderr } = await execAsync('npm install', { 
          cwd: backendDir,
          timeout: 120000 // 2 minute timeout
        });
        
        if (stdout) log.info(`[npm install stdout] ${stdout}`);
        if (stderr) log.warn(`[npm install stderr] ${stderr}`);
        
        log.info('✅ Backend dependencies installed successfully');
        return true;
      } catch (installError) {
        log.error('❌ Failed to install backend dependencies:', installError.message);
        log.error('stderr:', installError.stderr);
        return false;
      }
    } else {
      log.info('✅ Backend dependencies already installed');
      return true;
    }
  } catch (error) {
    log.error('❌ Error checking backend dependencies:', error.message);
    return false;
  }
}

// Function to ensure backend environment variables are set
async function ensureBackendEnv() {
  try {
    const backendDir = path.join(__dirname, '../backend');
    const envPath = path.join(backendDir, '.env');
    const envExamplePath = path.join(__dirname, '../.env.example');
    
    log.info(`🔧 Checking backend environment configuration...`);
    
    // Check if .env file exists in backend
    if (!fs.existsSync(envPath)) {
      log.warn('⚠️ Backend .env file not found, checking for .env.example...');
      
      // Check if .env.example exists in root
      if (fs.existsSync(envExamplePath)) {
        log.info('✅ Found .env.example, copying to backend directory...');
        fs.copyFileSync(envExamplePath, envPath);
        log.info('✅ Created backend .env file from .env.example');
      } else {
        log.warn('⚠️ No .env.example found, creating minimal .env file...');
        
        // Create a minimal .env file with required variables
        const minimalEnv = `# Auto-generated .env file
MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/akashshare?retryWrites=true&w=majority
PORT=5002
HOST=0.0.0.0
JWT_SECRET=y3k4WUFsPsv9wQW1ywaEeT9Dg1bdMIUnzqyJBPeZedf7SoRnq19HZI8D02XcUXI5KBWscen/y43UHmYMtKABKg==
NODE_ENV=production
`;
        fs.writeFileSync(envPath, minimalEnv);
        log.info('✅ Created minimal backend .env file');
      }
    } else {
      log.info('✅ Backend .env file already exists');
    }
    
    // Load environment variables
    require('dotenv').config({ path: envPath });
    log.info('✅ Backend environment variables loaded');
    return true;
  } catch (error) {
    log.error('❌ Error ensuring backend environment:', error.message);
    return false;
  }
}

// Function to create the backend server process
async function createBackendProcess() {
  log.info('🔧 Starting backend server process...');
  const backendStartTime = Date.now();
  
  // Ensure backend dependencies are installed
  const depsInstalled = await ensureBackendDependencies();
  if (!depsInstalled) {
    log.error('❌ Cannot start backend - dependencies not available');
    return null;
  }
  
  // Ensure backend environment is configured
  const envConfigured = await ensureBackendEnv();
  if (!envConfigured) {
    log.error('❌ Cannot start backend - environment not configured');
    return null;
  }
  
  // Path to the backend server script
  const backendPath = path.join(__dirname, '../backend/server.js');
  
  // Log the paths for debugging
  log.info(`📁 Backend path: ${backendPath}`);
  log.info(`📁 Backend directory: ${path.join(__dirname, '../backend')}`);
  log.info(`📁 Current working directory: ${process.cwd()}`);
  
  // Check if backend file exists
  if (!fs.existsSync(backendPath)) {
    log.error(`❌ Backend server file not found: ${backendPath}`);
    return null;
  }
  
  // Check if backend directory exists
  const backendDir = path.join(__dirname, '../backend');
  if (!fs.existsSync(backendDir)) {
    log.error(`❌ Backend directory not found: ${backendDir}`);
    return null;
  }
  
  // Check if node_modules exists in backend directory
  const backendNodeModules = path.join(backendDir, 'node_modules');
  const nodeModulesExist = fs.existsSync(backendNodeModules);
  log.info(`📁 Backend node_modules exists: ${nodeModulesExist}`);
  
  if (!nodeModulesExist) {
    log.warn('⚠️ Backend dependencies not found. This may cause the backend to fail.');
  }
  
  // Log environment variables for debugging
  log.info(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  log.info(`🔧 PORT: ${process.env.PORT || 'not set'}`);
  log.info(`🔧 MONGO_URI: ${process.env.MONGO_URI ? 'set' : 'not set'}`);
  
  // Spawn the backend process
  const backendProcess = spawn('node', [backendPath], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'production',
      PORT: process.env.PORT || 5002,
      HOST: process.env.HOST || 'localhost'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Performance tracking
  const processCreateTime = Date.now();
  log.info(`⏱️ Backend process created in ${processCreateTime - backendStartTime}ms`);

  // Handle backend process output
  backendProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    log.info(`[Backend] ${output}`);
    
    // Performance tracking for backend startup
    if (output.includes('Server running on')) {
      const serverStartTime = Date.now();
      log.info(`✅ Backend server started in ${serverStartTime - backendStartTime}ms`);
    }
    
    // Check for MongoDB connection errors
    if (output.includes('MongoDB Connection Error') || output.includes('MongoNetworkError')) {
      log.error('❌ MongoDB connection failed. Please check your MONGO_URI in the backend .env file.');
    }
  });

  backendProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString().trim();
    log.error(`[Backend Error] ${errorOutput}`);
    
    // Handle common backend errors
    if (errorOutput.includes('EADDRINUSE')) {
      log.error('❌ Port already in use. Please check if another instance is running.');
    } else if (errorOutput.includes('MODULE_NOT_FOUND')) {
      log.error('❌ Missing dependencies. Please run npm install in the backend directory.');
    } else if (errorOutput.includes('MONGO_URI')) {
      log.error('❌ MongoDB connection string not found. Check your .env file.');
    } else if (errorOutput.includes('MongoNetworkError') || errorOutput.includes('MongooseServerSelectionError')) {
      log.error('❌ MongoDB connection failed. Please check your MONGO_URI in the backend .env file and ensure MongoDB is accessible.');
    }
  });

  backendProcess.on('error', (error) => {
    log.error('❌ Failed to start backend process:', error);
    
    // Provide specific error messages
    if (error.code === 'ENOENT') {
      log.error('❌ Node.js not found. Please ensure Node.js is installed.');
    } else if (error.code === 'EACCES') {
      log.error('❌ Permission denied. Please check file permissions.');
    }
  });

  backendProcess.on('close', (code) => {
    log.info(`🔧 Backend process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      log.warn(`⚠️ Backend process exited unexpectedly with code ${code}`);
    }
  });

  return backendProcess;
}

let mainWindow;
let backendProcess;
let tray = null;

// Function to create system tray
function createTray() {
  // Try multiple icon paths to ensure we have a fallback
  const iconPaths = [
    path.join(__dirname, '../public/Akashshareicon.png'),
    path.join(__dirname, '../public/Akashshareicon-backup.png'),
    path.join(__dirname, '../build/Akashshareicon.png')
  ];
  
  let trayIcon;
  let iconPathUsed = null;
  
  // Try to find a valid icon file
  for (const iconPath of iconPaths) {
    try {
      if (fs.existsSync(iconPath)) {
        trayIcon = nativeImage.createFromPath(iconPath);
        iconPathUsed = iconPath;
        log.info(`✅ Tray icon loaded from: ${iconPath}`);
        break;
      }
    } catch (error) {
      log.warn(`⚠️ Failed to load tray icon from ${iconPath}:`, error.message);
    }
  }
  
  // If no icon was found, create a simple one
  if (!trayIcon) {
    log.warn('⚠️ No tray icon found, creating a simple icon');
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    {
      label: 'Check for Updates',
      click: () => {
        if (!isDev) {
          autoUpdater.checkForUpdatesAndNotify();
        } else {
          log.info('ℹ️ Update check skipped in development mode');
        }
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Akash Share');
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
  
  log.info(`✅ System tray created with icon: ${iconPathUsed || 'default'}`);
}

// Auto-update event handlers
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'checking' });
  }
});

autoUpdater.on('update-available', (_info) => {
  log.info('Update available.');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'available', version: _info.version });
  }
});

autoUpdater.on('update-not-available', (_info) => {
  log.info('Update not available.');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'not-available' });
  }
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'error', message: err.message });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  log.info(`Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'downloading', percent: Math.round(progressObj.percent) });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'downloaded', version: info.version });
  }
});

// Create window and backend when app is ready
app.whenReady().then(async () => {
  const appReadyTime = Date.now();
  log.info(`⏱️ App ready in ${appReadyTime - startTime}ms`);
  
  // Log environment information for debugging
  log.info(`🔧 Environment Info:`);
  log.info(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  log.info(`   Platform: ${process.platform}`);
  log.info(`   Architecture: ${process.arch}`);
  log.info(`   App Path: ${app.getAppPath()}`);
  log.info(`   User Data Path: ${app.getPath('userData')}`);
  
  try {
    mainWindow = createWindow();
    
    // Create backend process asynchronously
    backendProcess = await createBackendProcess();
    
    createTray();

    // Check for updates on app start (only in production)
    if (!isDev) {
      log.info('🔍 Checking for updates...');
      try {
        await autoUpdater.checkForUpdatesAndNotify();
      } catch (error) {
        log.error('❌ Error checking for updates:', error.message);
      }
    } else {
      log.info('ℹ️ Update check skipped in development mode');
    }

    log.info('✅ Electron app initialized successfully');
  } catch (error) {
    log.error('❌ Error during app initialization:', error);
  }

  // Handle macOS dock activation
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app termination
app.on('before-quit', () => {
  log.info('🛑 App shutting down...');
  
  // Kill backend process if it exists
  if (backendProcess) {
    log.info('🛑 Terminating backend process...');
    backendProcess.kill();
  }
});

// IPC handlers
ipcMain.handle('select-files', async () => {
  if (!mainWindow) {
    console.warn('⚠️ No main window available for file selection');
    return [];
  }
  
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections']
    });
    
    return result.filePaths || [];
  } catch (error) {
    console.error('❌ Error selecting files:', error);
    return [];
  }
});

ipcMain.handle('get-app-version', () => {
  try {
    return app.getVersion();
  } catch (error) {
    console.error('❌ Error getting app version:', error);
    return 'unknown';
  }
});

// Window control handlers with performance tracking
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    try {
      const minimizeStartTime = Date.now();
      mainWindow.minimize();
      console.log(`⏱️ Window minimized in ${Date.now() - minimizeStartTime}ms`);
    } catch (error) {
      console.error('❌ Error minimizing window:', error);
    }
  } else {
    console.warn('⚠️ No main window to minimize');
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    try {
      const maximizeStartTime = Date.now();
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
        console.log(`⏱️ Window unmaximized in ${Date.now() - maximizeStartTime}ms`);
      } else {
        mainWindow.maximize();
        console.log(`⏱️ Window maximized in ${Date.now() - maximizeStartTime}ms`);
      }
    } catch (error) {
      console.error('❌ Error (un)maximizing window:', error);
    }
  } else {
    console.warn('⚠️ No main window to (un)maximize');
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    try {
      const closeStartTime = Date.now();
      mainWindow.hide(); // Hide instead of close to keep app running in tray
      console.log(`⏱️ Window hidden in ${Date.now() - closeStartTime}ms`);
    } catch (error) {
      console.error('❌ Error hiding window:', error);
    }
  } else {
    console.warn('⚠️ No main window to hide');
  }
});

// Auto-update IPC handlers
ipcMain.handle('check-for-updates', async () => {
  if (!isDev) {
    try {
      console.log('🔍 Checking for updates via IPC...');
      return await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
      throw error;
    }
  }
  console.log('ℹ️ Update check skipped in development mode');
  return Promise.resolve();
});

ipcMain.handle('download-update', async () => {
  if (!isDev) {
    try {
      console.log('📥 Downloading update...');
      return await autoUpdater.downloadUpdate();
    } catch (error) {
      console.error('❌ Error downloading update:', error);
      throw error;
    }
  }
  console.log('ℹ️ Update download skipped in development mode');
  return Promise.resolve();
});

ipcMain.handle('quit-and-install', () => {
  if (!isDev) {
    console.log('🔄 Quitting and installing update...');
    setImmediate(() => {
      try {
        autoUpdater.quitAndInstall();
      } catch (error) {
        console.error('❌ Error quitting and installing update:', error);
      }
    });
  } else {
    console.log('ℹ️ Quit and install skipped in development mode');
  }
});

// Platform information
ipcMain.handle('get-platform', () => {
  try {
    return process.platform;
  } catch (error) {
    console.error('❌ Error getting platform:', error);
    return 'unknown';
  }
});