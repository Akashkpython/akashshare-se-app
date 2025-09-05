const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectSaveDirectory: () => ipcRenderer.invoke('select-save-directory'),
  
  // Notifications
  showNotification: (notification) => ipcRenderer.invoke('show-notification', notification),
  
  // Platform info
  platform: process.platform,
  
  // App info
  appVersion: process.env.npm_package_version || '1.0.0',
  
  // Window controls (for custom titlebar)
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // Window state
  onWindowStateChange: (callback) => {
    ipcRenderer.on('window-state-changed', callback);
  }
});

// Handle window control events
window.addEventListener('DOMContentLoaded', () => {
  // Add window control event listeners if needed
  const minimizeBtn = document.getElementById('minimize-btn');
  const maximizeBtn = document.getElementById('maximize-btn');
  const closeBtn = document.getElementById('close-btn');
  
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      ipcRenderer.invoke('window-minimize');
    });
  }
  
  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', () => {
      ipcRenderer.invoke('window-maximize');
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      ipcRenderer.invoke('window-close');
    });
  }
});
