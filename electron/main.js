const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  console.log('Creating window...');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false, // Remove all window frame including title bar
    titleBarStyle: 'hidden', // Hide title bar completely
    trafficLightPosition: { x: 10, y: 10 }, // Position window controls (macOS)
    show: false,
    icon: path.join(__dirname, '../public/Akashshareicon.png'),
    title: 'Akash Share',
    backgroundColor: '#0f0f23'
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  console.log('Loading URL:', startUrl);

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
    mainWindow.maximize(); // Start maximized but keep controls
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
  // Add error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load URL:', validatedURL, 'Error:', errorDescription, 'Code:', errorCode);
  });
  
  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error('Renderer process crashed, killed:', killed);
  });
}

app.whenReady().then(() => {
  console.log('App ready');
  // Remove application menu globally
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    console.log('Quitting app');
    app.quit();
  }
});

app.on('activate', () => {
  console.log('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers for window controls
ipcMain.handle('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// IPC Handlers for file operations
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
      { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'] },
      { name: 'Videos', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv'] },
      { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg'] }
    ]
  });
  
  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
});

ipcMain.handle('select-save-directory', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    properties: ['createDirectory']
  });
  
  if (!result.canceled) {
    return result.filePath;
  }
  return null;
});

ipcMain.handle('show-notification', async (_event, { title: _title, body: _body, type: _type }) => {
  // Handle native notifications
  if (process.platform === 'darwin') {
    // macOS notification
  } else if (process.platform === 'win32') {
    // Windows notification
  }
  return true;
});

// Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
