import { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage, screen } from 'electron';
import path from 'path';
import { spawn, exec, execSync } from 'child_process';
import IntegratedBackend from './integrated-backend.js';
import { promisify } from 'util';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname/__filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to safely load a module with detailed error reporting
async function safeRequire(moduleName, fallback = null) {
  try {
    // For ES modules, we need to use dynamic imports
    const module = await import(moduleName);
    if (log && log.info) {
      log.info(`✅ Successfully loaded module: ${moduleName}`);
    } else {
      console.log(`✅ Successfully loaded module: ${moduleName}`);
    }
    return module.default || module;
  } catch (error) {
    if (log && log.warn) {
      log.warn(`⚠️ Failed to load module: ${moduleName}`);
      log.warn('Error details:', error.message);
      log.warn('Error stack:', error.stack);
    } else {
      console.warn(`⚠️ Failed to load module: ${moduleName}`);
      console.warn('Error details:', error.message);
      console.warn('Error stack:', error.stack);
    }
    
    // Additional debugging for electron-log specifically
    if (moduleName === 'electron-log') {
      try {
        const modulePath = path.join(__dirname, '../node_modules/electron-log');
        if (log && log.warn) {
          log.warn('Checking module path:', modulePath);
          log.warn('Module exists:', fs.existsSync(modulePath));
        } else {
          console.warn('Checking module path:', modulePath);
          console.warn('Module exists:', fs.existsSync(modulePath));
        }
      } catch (pathError) {
        if (log && log.warn) {
          log.warn('Error checking module path:', pathError.message);
        } else {
          console.warn('Error checking module path:', pathError.message);
        }
      }
    }
    
    return fallback;
  }
}

// Try to load electron-log, with fallback if not available
let autoUpdater, log;

// Load electron-log with improved error handling
(async () => {
try {
  const electronLog = await safeRequire('electron-log');
  if (electronLog) {
    log = electronLog;
    try {
      const electronUpdater = await safeRequire('electron-updater');
      if (electronUpdater && electronUpdater.autoUpdater) {
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
} catch (error) {
  if (log && log.error) {
    log.error('Error loading electron-log:', error);
  } else {
    console.error('Error loading electron-log:', error);
  }
}

// Create a mock autoUpdater that does nothing but logs if electron-updater is not available
if (!autoUpdater) {
  autoUpdater = {
    logger: log,
    checkForUpdatesAndNotify: () => {
      if (log && log.info) {
        log.info('ℹ️ Update check skipped - autoUpdater not available');
      } else {
        console.log('ℹ️ Update check skipped - autoUpdater not available');
      }
      return Promise.resolve();
    },
    on: (event, _callback) => {
      if (log && log.info) {
        log.info(`ℹ️ AutoUpdater event listener registered for: ${event}`);
      } else {
        console.log(`ℹ️ AutoUpdater event listener registered for: ${event}`);
      }
      // Do nothing - no events will be emitted
    },
    setFeedURL: (url) => {
      if (log && log.info) {
        log.info(`ℹ️ AutoUpdater feed URL set:`, url);
      } else {
        console.log(`ℹ️ AutoUpdater feed URL set:`, url);
      }
    }
  };
}

// Add performance monitoring
const startTime = Date.now();

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Set update feed URL from package.json
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  if (packageJson.build && packageJson.build.publish && packageJson.build.publish[0]) {
    const publishConfig = packageJson.build.publish[0];
    if (publishConfig.provider === 'generic' && publishConfig.url) {
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: publishConfig.url
      });
      if (log && log.info) {
        log.info(`✅ Auto-updater feed URL set to: ${publishConfig.url}`);
      } else {
        console.log(`✅ Auto-updater feed URL set to: ${publishConfig.url}`);
      }
    }
  }
} catch (error) {
  if (log && log.warn) {
    log.warn('⚠️ Could not set auto-updater feed URL:', error.message);
  } else {
    console.warn('⚠️ Could not set auto-updater feed URL:', error.message);
  }
}

// Add performance tracking
if (log && log.info) {
  log.info(`🚀 Electron main process started at ${new Date().toISOString()}`);
} else {
  console.log(`🚀 Electron main process started at ${new Date().toISOString()}`);
}

// Conditionally import electron-devtools-installer in development mode
if (isDev) {
  try {
    const devToolsInstaller = await import('electron-devtools-installer');
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = devToolsInstaller;
    app.whenReady().then(() => {
      installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => {
          if (log && log.info) {
            log.info(`Added Extension: ${name}`);
          } else {
            console.log(`Added Extension: ${name}`);
          }
        })
        .catch((err) => {
          if (log && log.warn) {
            log.warn('An error occurred: ', err);
          } else {
            console.warn('An error occurred: ', err);
          }
        });
    });
  } catch (err) {
    if (log && log.warn) {
      log.warn('electron-devtools-installer not available in this environment');
    } else {
      console.warn('electron-devtools-installer not available in this environment');
    }
  }
}

// Function to check if React dev server is ready
async function checkReactDevServer() {
  try {
    const response = await fetch('http://localhost:5004');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Function to create the main window
function createWindow() {
  // Get screen size to set appropriate window dimensions
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
      backgroundColor: '#0f0f0f', // Dark background to match app
      // Use standard Windows title bar to avoid duplicates
      frame: true,
      titleBarStyle: 'default',
      webPreferences: {
        preload: app.isPackaged 
          ? path.join(process.resourcesPath, 'preload.js')
          : path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false,
        sandbox: false, // Required for some Electron functionality
        // Add performance optimizations
        devTools: isDev, // Only enable dev tools in development
        backgroundThrottling: false, // Prevent throttling when window is not focused
        webSecurity: false, // Allow localhost connections
      },
      // Add window icon for Windows
      icon: path.join(__dirname, '../public/Akashshareicon.png'),
      // Ensure window controls work properly
      show: false, // Don't show until ready
      autoHideMenuBar: true
    });

  // Remove default menu bar
  mainWindow.setMenuBarVisibility(false);

  // Performance tracking
  const windowCreateTime = Date.now();
  log.info(`⏱️ BrowserWindow created in ${windowCreateTime - startTime}ms with dimensions ${windowWidth}x${windowHeight}`);

  // Load the appropriate URL based on the environment
  const startUrl = isDev 
    ? 'http://localhost:5004'  // React dev server on port 5004
    : `file://${path.join(__dirname, '../build/index.html')}`; // Production build

  console.log(`🌐 Loading URL: ${startUrl}`);
  console.log(`🔧 Is Development: ${isDev}`);
  console.log(`📦 Is Packaged: ${app.isPackaged}`);
  
  // Wait for React dev server to be ready before loading
  const waitForReactDevServer = async () => {
    if (isDev) {
      console.log('🔍 Checking if React dev server is ready...');
      let attempts = 0;
      const maxAttempts = 10;
      const checkDelay = 1000; // 1 second
      
      while (attempts < maxAttempts) {
        const isReady = await checkReactDevServer();
        if (isReady) {
          console.log('✅ React dev server is ready!');
          break;
        }
        attempts++;
        console.log(`⏳ React dev server not ready yet (attempt ${attempts}/${maxAttempts}), waiting ${checkDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, checkDelay));
      }
      
      if (attempts >= maxAttempts) {
        console.error('❌ React dev server is not responding. Please start it with: npm start');
        log.error('❌ React dev server is not responding. Please start it with: npm start');
      }
    }
    
    // Load the URL
    mainWindow.loadURL(startUrl).catch((error) => {
      console.error('❌ Failed to load URL:', error);
      log.error('❌ Failed to load URL:', error);
    });
  };
  
  waitForReactDevServer();
  
  // Performance tracking
  const loadUrlTime = Date.now();
  log.info(`⏱️ URL loading started in ${loadUrlTime - windowCreateTime}ms`);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    log.info('✅ Main window shown');
  });

  // Handle page load events
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page finished loading');
    log.info('✅ Page finished loading successfully');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`❌ Page failed to load: ${errorCode} - ${errorDescription}`);
    console.error(`❌ Failed URL: ${validatedURL}`);
    log.error(`❌ Page failed to load: ${errorCode} - ${errorDescription} - URL: ${validatedURL}`);
  });

  mainWindow.webContents.on('did-start-loading', () => {
    console.log('🔄 Page started loading...');
    log.info('🔄 Page started loading...');
  });

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
    // Determine the correct path for the backend based on whether we're in a packaged app or development
    let backendDir;

    if (app.isPackaged) {
      // In packaged app, backend is in resources/backend
      backendDir = path.join(process.resourcesPath, 'backend');
      log.info(`📦 Running in packaged mode. Backend dir: ${backendDir}`);
    } else {
      // In development, backend is in the backend directory relative to project root
      backendDir = path.join(__dirname, '../backend');
      log.info(`💻 Running in development mode. Backend dir: ${backendDir}`);
    }

    const nodeModulesPath = path.join(backendDir, 'node_modules');

    log.info(`🔧 Checking backend dependencies in: ${backendDir}`);

    // In a packaged app, check if dependencies are installed and install if needed
    if (app.isPackaged) {
      if (fs.existsSync(nodeModulesPath)) {
        log.info('✅ Backend dependencies already installed in packaged app');
        return true;
      } else {
        log.warn('⚠️ Backend dependencies not found in packaged app. Attempting to install...');
        
        // Try to install backend dependencies using npm install directly
        try {
          log.info('🔧 Installing backend dependencies in packaged app...');
          
          // Use spawn to run npm install in the backend directory
          const npmInstall = spawn('npm', ['install', '--production'], {
            cwd: backendDir,
            stdio: 'pipe',
            shell: true
          });
          
          // Capture output
          let stdout = '';
          let stderr = '';
          
          npmInstall.stdout.on('data', (data) => {
            stdout += data.toString();
          });
          
          npmInstall.stderr.on('data', (data) => {
            stderr += data.toString();
          });
          
          // Wait for the process to complete
          const exitCode = await new Promise((resolve) => {
            npmInstall.on('close', resolve);
          });
          
          if (stdout) log.info(`[npm install stdout] ${stdout}`);
          if (stderr) log.warn(`[npm install stderr] ${stderr}`);
          
          if (exitCode === 0) {
            log.info('✅ Backend dependencies installed successfully in packaged app');
            return true;
          } else {
            log.error('❌ Failed to install backend dependencies in packaged app. Exit code:', exitCode);
            return false;
          }
        } catch (installError) {
          log.error('❌ Failed to install backend dependencies in packaged app:', installError.message);
          return false;
        }
      }
    }

    // Check if node_modules exists (development mode)
    if (!fs.existsSync(nodeModulesPath)) {
      log.warn('⚠️ Backend dependencies not found, attempting to install...');

      // Try to install backend dependencies
      const execAsync = promisify(exec);

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

// Simple .env parser (KEY=VALUE, ignores comments/empty lines)
function parseEnvFile(content) {
  const env = {};
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  });
  return env;
}

// Cache of env vars to inject into spawned backend
let backendEnvCache = {};

// Function to ensure backend environment variables are set
async function ensureBackendEnv() {
  try {
    // Determine the correct path for the backend based on whether we're in a packaged app or development
    let backendDir, envExamplePath;
    
    if (app.isPackaged) {
      // In packaged app, backend is in resources/backend
      backendDir = path.join(process.resourcesPath, 'backend');
      envExamplePath = path.join(process.resourcesPath, 'backend', '.env.example');
      log.info(`📦 Running in packaged mode. Backend dir: ${backendDir}`);
    } else {
      // In development, backend is in the backend directory relative to project root
      backendDir = path.join(__dirname, '../backend');
      envExamplePath = path.join(__dirname, '../.env.example');
      log.info(`💻 Running in development mode. Backend dir: ${backendDir}`);
    }
    
    const envPath = path.join(backendDir, '.env');
    const rootEnvProductionPath = path.join(__dirname, '../.env.production');
    
    log.info(`🔧 Checking backend environment configuration...`);
    
    // Check if .env file exists in backend
    if (!fs.existsSync(envPath)) {
      log.warn('⚠️ Backend .env file not found, checking for .env.example...');
      
      // Prefer copying real production env if available at project root
      if (fs.existsSync(rootEnvProductionPath)) {
        try {
          const prodContent = fs.readFileSync(rootEnvProductionPath, 'utf8');
          fs.writeFileSync(envPath, prodContent, 'utf8');
          log.info('✅ Copied .env.production to backend/.env');
        } catch (copyErr) {
          log.warn('⚠️ Failed to copy .env.production to backend/.env:', copyErr.message);
        }
      }

      // Check if .env.example exists
      if (fs.existsSync(envExamplePath)) {
        log.info('✅ Found .env.example, copying to backend directory...');
        fs.copyFileSync(envExamplePath, envPath);
        log.info('✅ Created backend .env file from .env.example');
      } else {
        log.warn('⚠️ No .env.example found, creating minimal .env file...');
        
        // Create a minimal .env file with required variables
        const minimalEnv = `# Auto-generated .env file for Akash Share
MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare
PORT=5004
HOST=0.0.0.0
JWT_SECRET=f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09
NODE_ENV=production
TRUST_PROXY=true
FILE_SIZE_LIMIT=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-rar-compressed,application/x-7z-compressed,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,audio/mpeg,audio/wav,audio/mp4,audio/aac,application/json,application/xml,application/javascript,text/html,text/css,application/vnd.openxmlformats-officedocument.presentationml.slideshow,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation,application/x-tar,application/gzip,text/markdown,application/rtf
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AI_CLASSIFY_ENABLED=true
`;
        fs.writeFileSync(envPath, minimalEnv);
        log.info('✅ Created minimal backend .env file');
      }
    } else {
      log.info('✅ Backend .env file already exists');
    }
    
    // Parse env file ourselves to later inject into spawned backend
    try {
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        backendEnvCache = parseEnvFile(envContent);
        // Do not log secrets; only keys
        log.info('✅ Parsed backend .env keys:', Object.keys(backendEnvCache));
      } else {
        backendEnvCache = {};
      }
    } catch (e) {
      log.warn('⚠️ Failed to parse backend .env:', e.message);
    }
    log.info('✅ Backend environment configuration ready');
    return true;
  } catch (error) {
    log.error('❌ Error ensuring backend environment:', error.message);
    return false;
  }
}

async function checkIfBackendIsRunning() {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',  // Use IPv4 instead of localhost to avoid IPv6 issues
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
          if (res.statusCode === 200 && jsonData.status === 'OK') {
            log.info('🔍 Backend health check successful - backend is already running');
            resolve(true);
          } else {
            log.info(`🔍 Backend health check returned status ${res.statusCode} - backend may not be running`);
            resolve(false);
          }
        } catch (parseError) {
          log.info(`🔍 Backend health check failed to parse response - backend may not be running: ${parseError.message}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log.info(`🔍 Backend health check failed - backend is likely not running: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      log.info('🔍 Backend health check timed out - backend may not be running');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Aggressive port cleanup function
async function aggressivePortCleanup(port) {
  log.info(`🔧 Performing aggressive cleanup for port ${port}...`);
  
  if (process.platform === 'win32') {
    try {
      
      // Kill all node processes to ensure clean slate
      try {
        execSync(`taskkill /F /IM node.exe`, { timeout: 5000 });
        log.info(`✅ Killed all node processes`);
      } catch (error) {
        log.info(`✅ No node processes to kill`);
      }
      
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      log.warn(`⚠️ Error during aggressive cleanup:`, error.message);
    }
  }
}


// Function to create the integrated backend server
async function createBackendProcess() {
  // Prevent multiple backend starts
  if (isBackendStarting) {
    log.info('🔧 Backend is already starting, skipping...');
    return null;
  }
  
  isBackendStarting = true;
  
  try {
    log.info('🔧 Starting integrated backend server...');
    const backendStartTime = Date.now();
  
    // Check if we should use local backend or public backend
    const backendMode = process.env.BACKEND_MODE || 'local';
    
    // If using public backend, we don't need to start a local backend process
    if (backendMode === 'public') {
      log.info('🌐 Using public backend, skipping local backend startup');
      return Promise.resolve(null);
    }
    
    // Always check if backend is already running first
    const isBackendRunning = await checkIfBackendIsRunning();
    if (isBackendRunning) {
      log.info('✅ Backend server is already running on port 5005, using existing instance');
      return Promise.resolve(null);
    }
    
    // Try to kill any process using port 5005 with aggressive cleanup
    log.info('🔧 Ensuring port 5005 is available...');
    await aggressivePortCleanup(5005);
    
    // Wait a moment for the port to be freed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create integrated backend instance
    const integratedBackend = new IntegratedBackend();
    
    // Start the integrated backend
    await integratedBackend.start();
    
    const processCreateTime = Date.now();
    log.info(`⏱️ Integrated backend process created in ${processCreateTime - backendStartTime}ms`);
    
    // Return a mock process object that matches the expected interface
    const mockProcess = {
      integratedBackend: integratedBackend,
      kill: async () => {
        log.info('🛑 Stopping integrated backend...');
        await integratedBackend.stop();
      },
      isHealthy: () => integratedBackend.isHealthy(),
      startupTimeout: null,
      monitoringInterval: null
    };
    
    log.info('✅ Integrated backend server started successfully');
    return mockProcess;
  
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
  
  // Spawn the backend process with enhanced error handling
  log.info('🚀 Spawning backend process...');
  log.info(`📁 Working directory: ${backendDir}`);
  log.info(`📄 Script path: ${backendPath}`);
  
  log.info('🚀 Spawning backend process with the following configuration:');
  log.info(`   - Command: node ${backendPath}`);
  log.info(`   - Working directory: ${backendDir}`);
  log.info(`   - NODE_ENV: ${isDev ? 'development' : 'production'}`);
  log.info(`   - PORT: 5005`);
  log.info(`   - HOST: 0.0.0.0`);
  log.info(`   - MONGO_URI: set`);
  log.info(`   - JWT_SECRET: set`);

  // Use working backend for guaranteed functionality
  let backendProcess;
  const workingBackendPath = path.join(backendDir, 'file-upload-backend-cjs.cjs');
  
  if (fs.existsSync(workingBackendPath)) {
    log.info('🚀 Starting working backend for guaranteed functionality...');
    backendProcess = spawn('node', [`"${workingBackendPath}"`], {
    cwd: backendDir,
    env: {
      ...process.env,
      // Inject parsed backend env (if any)
      ...backendEnvCache,
      // Ensure these are set explicitly
      NODE_ENV: isDev ? 'development' : 'production',
      PORT: '5005',
      HOST: '0.0.0.0',
      // Add additional environment variables for better debugging
      DEBUG: isDev ? '*' : undefined,
      LOG_LEVEL: isDev ? 'debug' : 'info',
      // Ensure MongoDB connection works
      MONGO_URI: 'mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare',
      JWT_SECRET: 'f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09',
      // Additional required environment variables
      TRUST_PROXY: 'true',
      FILE_SIZE_LIMIT: '10485760',
      RATE_LIMIT_WINDOW_MS: '900000',
      RATE_LIMIT_MAX_REQUESTS: '100',
      AI_CLASSIFY_ENABLED: 'true'
    },
      stdio: ['ignore', 'pipe', 'pipe'],
      // Add process options for better stability
      detached: false,
      windowsHide: true,
      shell: true // Use shell for better Windows compatibility
    });
  } else {
    log.info('🚀 Starting full backend server with complete functionality...');
    backendProcess = spawn('node', [`"${backendPath}"`], {
      cwd: backendDir,
      env: {
        ...process.env,
        // Inject parsed backend env (if any)
        ...backendEnvCache,
        // Ensure these are set explicitly
        NODE_ENV: isDev ? 'development' : 'production',
        PORT: '5005',
        HOST: '0.0.0.0',
        // Add additional environment variables for better debugging
        DEBUG: isDev ? '*' : undefined,
        LOG_LEVEL: isDev ? 'debug' : 'info',
        // Ensure MongoDB connection works
        MONGO_URI: 'mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare',
        JWT_SECRET: 'f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09',
        // Additional required environment variables
        TRUST_PROXY: 'true',
        FILE_SIZE_LIMIT: '10485760',
        RATE_LIMIT_WINDOW_MS: '900000',
        RATE_LIMIT_MAX_REQUESTS: '100',
        AI_CLASSIFY_ENABLED: 'true'
      },
        stdio: ['ignore', 'pipe', 'pipe'],
        // Add process options for better stability
        detached: false,
        windowsHide: true,
        shell: true // Use shell for better Windows compatibility
      });
  }

  // Performance tracking
  const processCreateTime = Date.now();
  log.info(`⏱️ Backend process created in ${processCreateTime - backendStartTime}ms`);

  // Handle backend process output
  backendProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    log.info(`[Backend] ${output}`);
    
    // Performance tracking for backend startup
    if (output.includes('Server running on') || output.includes('listening on') || output.includes('started on')) {
      const serverStartTime = Date.now();
      log.info(`✅ Backend server started successfully in ${serverStartTime - backendStartTime}ms`);
      log.info('🎉 Backend server is now online and ready to handle requests');
    }
    
    // Check for MongoDB connection success
    if (output.includes('MongoDB connected successfully') || output.includes('Connected to MongoDB')) {
      log.info('✅ MongoDB connection established successfully');
    }
    
    // Check for MongoDB connection errors
    if (output.includes('MongoDB Connection Error') || output.includes('MongoNetworkError') || output.includes('MongoError')) {
      log.error('❌ MongoDB connection failed. Please check your MONGO_URI in the backend .env file.');
    }
    
    // Check for any other errors
    if (output.includes('Error:') || output.includes('error:') || output.includes('ERROR:')) {
      log.error(`❌ Backend error detected: ${output}`);
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
    } else if (error.code === 'EADDRINUSE') {
      log.error('❌ Port 5004 is already in use. Please check for conflicting processes.');
    } else {
      log.error(`❌ Unexpected error starting backend: ${error.message}`);
    }
    
    // Note: backend process failed to start
    log.error('❌ Backend process startup failed');
  });

  backendProcess.on('close', (code, signal) => {
    log.info(`🔧 Backend process exited with code ${code} and signal ${signal}`);
    if (code !== 0 && code !== null) {
      log.warn(`⚠️ Backend process exited unexpectedly with code ${code}`);
      
      // Auto-restart backend if it crashes
      if (backendRestartAttempts < maxBackendRestartAttempts) {
        backendRestartAttempts++;
        log.info(`🔄 Backend crashed, attempting restart (attempt ${backendRestartAttempts}/${maxBackendRestartAttempts})`);
        
        // Restart backend after a short delay with aggressive cleanup
        setTimeout(async () => {
          try {
            // Only restart if not already starting
            if (!isBackendStarting) {
              // Clean up any lingering processes before restart
              await aggressivePortCleanup(5005);
              backendProcess = await createBackendProcess();
              if (backendProcess) {
                log.info('✅ Backend process restarted after crash');
                startBackendMonitoring();
              }
            } else {
              log.info('🔧 Backend is already starting, skipping crash restart...');
            }
          } catch (restartError) {
            log.error('❌ Failed to restart backend after crash:', restartError.message);
          }
        }, 3000); // Wait 3 seconds before restarting
      } else {
        log.error('❌ Maximum backend restart attempts reached. Backend may be unstable.');
      }
      
      // Provide specific guidance based on exit code
      if (code === 1) {
        log.error('❌ Backend process exited due to a general error. Check the logs above for details.');
      } else if (code === 2) {
        log.error('❌ Backend process exited due to incorrect usage. Check configuration.');
      } else if (code === 3) {
        log.error('❌ Backend process exited due to internal error. Check dependencies and configuration.');
      }
    } else {
      log.info('✅ Backend process exited normally');
    }
  });

  backendProcess.on('exit', (code, signal) => {
    log.info(`🔧 Backend process exit event: code ${code}, signal ${signal}`);
  });

  // Wait for backend to start properly before returning
  return new Promise((resolve) => {
    let backendStarted = false;
    
    const handleOutput = (data) => {
      const output = data.toString().trim();
      log.info(`[Backend Output] ${output}`);
      
      // Check for various startup success indicators
      if (output.includes('Server running on') || 
          output.includes('Server started') || 
          output.includes('Listening on port') ||
          output.includes('WebSocket server is listening') ||
          output.includes('🚀 Server running on') ||
          output.includes('Server running on http://') ||
          output.includes('✅ Server running on')) {
        backendStarted = true;
        log.info('✅ Backend server confirmed running');
        
        // Remove listeners to prevent memory leaks
        backendProcess.stdout.removeListener('data', handleOutput);
        backendProcess.stderr.removeListener('data', handleOutput);
        resolve(backendProcess);
      }
    };
    
    // Listen for startup confirmation
    backendProcess.stdout.on('data', handleOutput);
    backendProcess.stderr.on('data', handleOutput);
    
  // Handle process errors
  backendProcess.on('error', (error) => {
    log.error('❌ Backend process error:', error);
    log.error('❌ Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      path: error.path,
      message: error.message
    });
    if (!backendStarted) {
      backendStarted = true;
      clearTimeout(startupTimeout);
      resolve(null);
    }
  });
    
    // Handle process exit
    backendProcess.on('exit', (code, signal) => {
      log.error(`❌ Backend process exited with code ${code} and signal ${signal}`);
      if (!backendStarted) {
        backendStarted = true;
        clearTimeout(startupTimeout);
        resolve(null);
      }
    });
    
    // Timeout if backend doesn't start in 15 seconds (reduced for responsiveness)
    const startupTimeout = setTimeout(() => {
      if (!backendStarted) {
        log.error('❌ Backend server startup timeout. The backend process did not start in time.');
        log.error('❌ This could be due to:');
        log.error('   - Missing dependencies (run npm install in backend directory)');
        log.error('   - Port 5004 already in use');
        log.error('   - MongoDB connection issues');
        log.error('   - Invalid environment configuration');
        log.error('   - Network connectivity issues');
        
        // Remove listeners
        backendProcess.stdout.removeListener('data', handleOutput);
        backendProcess.stderr.removeListener('data', handleOutput);
        
        resolve(null);
      }
    }, 15000);
    
    // Store timeout reference for potential cleanup
    backendProcess.startupTimeout = startupTimeout;
  });
  
  } catch (error) {
    log.error('❌ Error creating backend process:', error);
    return null;
  } finally {
    // Reset the lock
    isBackendStarting = false;
  }
}

// Function to monitor backend health and restart if needed
async function monitorBackendHealth() {
  if (!backendProcess || backendProcess.killed) {
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:5005/health', {
      method: 'GET',
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error(`Backend status not OK: ${data.status}`);
    }
    
    // Backend is healthy, reset restart attempts
    backendRestartAttempts = 0;
    log.info('✅ Backend health check passed');
    
  } catch (error) {
    log.warn(`⚠️ Backend health check failed: ${error.message}`);
    
    // Try to restart backend if it's not responding
    if (backendRestartAttempts < maxBackendRestartAttempts) {
      backendRestartAttempts++;
      log.info(`🔄 Attempting to restart backend (attempt ${backendRestartAttempts}/${maxBackendRestartAttempts})`);
      
      // Kill existing backend process
      if (backendProcess && !backendProcess.killed) {
        try {
          backendProcess.kill('SIGTERM');
          await new Promise(resolve => setTimeout(resolve, 2000));
          if (!backendProcess.killed) {
            backendProcess.kill('SIGKILL');
          }
        } catch (killError) {
          log.warn('⚠️ Error killing backend process:', killError.message);
        }
      }
      
      // Start new backend process
      try {
        backendProcess = await createBackendProcess();
        if (backendProcess) {
          log.info('✅ Backend process restarted successfully');
        } else {
          log.error('❌ Failed to restart backend process');
        }
      } catch (restartError) {
        log.error('❌ Error restarting backend:', restartError.message);
      }
    } else {
      log.error('❌ Maximum backend restart attempts reached. Backend may be unstable.');
    }
  }
}

// Function to start backend monitoring
function startBackendMonitoring() {
  // Check backend health every 30 seconds
  const monitoringInterval = setInterval(async () => {
    if (backendProcess && !backendProcess.killed) {
      await monitorBackendHealth();
    } else {
      log.warn('⚠️ Backend process not running, attempting to restart...');
      try {
        // Only restart if not already starting
        if (!isBackendStarting) {
          // Clean up any lingering processes before restart
          await aggressivePortCleanup(5005);
          backendProcess = await createBackendProcess();
          if (backendProcess) {
            log.info('✅ Backend process restarted via monitoring');
          }
        } else {
          log.info('🔧 Backend is already starting, skipping restart...');
        }
      } catch (error) {
        log.error('❌ Failed to restart backend via monitoring:', error.message);
      }
    }
  }, 30000); // Check every 30 seconds
  
  // Store interval reference for cleanup
  backendProcess.monitoringInterval = monitoringInterval;
}

let mainWindow;
let backendProcess;
let tray = null;
let backendRestartAttempts = 0;
const maxBackendRestartAttempts = 5;
let isBackendStarting = false; // Lock to prevent multiple backend starts

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
  log.info(`   Backend Mode: ${process.env.BACKEND_MODE || 'local'}`);
  
  try {
    // Create backend process first and wait for it to start (only if using local mode)
    const backendMode = process.env.BACKEND_MODE || 'local';
    if (backendMode !== 'public') {
      log.info('🔧 Initializing local backend server...');
      backendProcess = await createBackendProcess();
      
      // Wait for backend to be fully ready
      if (backendProcess) {
        log.info('⏳ Waiting for backend server to initialize...');
        
        // Wait for backend to be ready with health checks
        let backendReady = false;
        let attempts = 0;
        const maxAttempts = 15; // 15 attempts = 15 seconds max (reduced for better responsiveness)
        
        while (!backendReady && attempts < maxAttempts) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout to 5 seconds
            
            const response = await fetch('http://127.0.0.1:5005/health', {
              method: 'GET',
              signal: controller.signal,
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'AkashShare-Electron/1.0.5'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              const data = await response.json();
              if (data.status === 'OK') {
                backendReady = true;
                log.info('✅ Backend health check successful - backend is ready!');
                log.info('🎉 Backend server is now fully operational and ready to handle requests');
              } else {
                log.info(`⏳ Backend health check returned status: ${data.status}, waiting...`);
              }
            } else {
              log.info(`⏳ Backend responded with status ${response.status}, waiting...`);
            }
          } catch (error) {
            // Backend not ready yet, continue waiting
            if (error.name === 'AbortError') {
              log.info(`⏳ Backend health check timed out (attempt ${attempts + 1})`);
            } else {
              log.info(`⏳ Backend health check failed (attempt ${attempts + 1}):`, error.message);
            }
          }
          
          if (!backendReady) {
            attempts++;
            log.info(`⏳ Backend not ready yet (attempt ${attempts}/${maxAttempts}), waiting...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!backendReady) {
          log.warn('⚠️ Backend server may not be fully ready, but continuing...');
        }
        
        log.info('✅ Backend server initialization complete');
        
        // Start backend monitoring for auto-restart
        if (backendProcess) {
          startBackendMonitoring();
          log.info('🔍 Backend monitoring started');
        }
      }
    } else {
      log.info('🌐 Using public backend, skipping local backend initialization');
    }
    
    // Now create the main window
    mainWindow = createWindow();
    
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
    
    // Clear monitoring interval
    if (backendProcess.monitoringInterval) {
      clearInterval(backendProcess.monitoringInterval);
      log.info('🛑 Backend monitoring stopped');
    }
    
    try {
      // Try graceful termination first
      backendProcess.kill('SIGTERM');
      
      // Wait a moment for graceful shutdown
      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          log.info('🛑 Force killing backend process...');
          backendProcess.kill('SIGKILL');
        }
      }, 3000);
    } catch (error) {
      log.error('❌ Error terminating backend process:', error);
    }
  }
});

// Handle app termination on Windows
app.on('will-quit', (_event) => {
  log.info('🛑 App will quit...');
  
  // Kill backend process if it exists
  if (backendProcess) {
    log.info('🛑 Terminating backend process...');
    
    // Clear monitoring interval
    if (backendProcess.monitoringInterval) {
      clearInterval(backendProcess.monitoringInterval);
      log.info('🛑 Backend monitoring stopped');
    }
    
    try {
      backendProcess.kill('SIGTERM');
    } catch (error) {
      log.error('❌ Error terminating backend process:', error);
    }
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

// Using standard Windows title bar - no custom window controls needed

})();
