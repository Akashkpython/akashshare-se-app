import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFiles: async () => {
    try {
      return await ipcRenderer.invoke('select-files');
    } catch (error) {
      console.error('Error selecting files:', error);
      return [];
    }
  },
  selectSaveDirectory: async () => {
    try {
      return await ipcRenderer.invoke('select-save-directory');
    } catch (error) {
      console.error('Error selecting save directory:', error);
      return null;
    }
  },
  
  // Notifications
  showNotification: async () => {
    try {
      return await ipcRenderer.invoke('show-notification');
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  },
  
  // Platform info
  platform: process.platform,
  
  // App info
  appVersion: process.env.npm_package_version || '1.0.0',
  
  // Using standard Windows title bar - no custom window controls needed
  
  // Auto-update functions
  checkForUpdates: async () => {
    try {
      return await ipcRenderer.invoke('check-for-updates');
    } catch (error) {
      console.error('Error checking for updates:', error);
      throw error;
    }
  },
  downloadUpdate: async () => {
    try {
      return await ipcRenderer.invoke('download-update');
    } catch (error) {
      console.error('Error downloading update:', error);
      throw error;
    }
  },
  quitAndInstall: async () => {
    try {
      return await ipcRenderer.invoke('quit-and-install');
    } catch (error) {
      console.error('Error quitting and installing update:', error);
      throw error;
    }
  },
  
  // Update status listener
  onUpdateStatus: (callback) => {
    if (typeof callback === 'function') {
      ipcRenderer.on('update-status', (_event, data) => callback(data));
    } else {
      console.error('Invalid callback provided to onUpdateStatus');
    }
  },
  
  // Remove update status listener
  removeUpdateStatusListener: () => {
    ipcRenderer.removeAllListeners('update-status');
  },
  
  // Window state
  onWindowStateChange: (callback) => {
    if (typeof callback === 'function') {
      ipcRenderer.on('window-state-changed', callback);
    } else {
      console.error('Invalid callback provided to onWindowStateChange');
    }
  }
});

// Remove the DOMContentLoaded event listener as we're using React event handlers
// The window control event listeners are now handled in the React components