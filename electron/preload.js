const { contextBridge, ipcRenderer } = require('electron');

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
  
  // Window controls (for custom titlebar)
  minimize: async () => {
    try {
      return await ipcRenderer.invoke('window-minimize');
    } catch (error) {
      console.error('Error minimizing window:', error);
      return null;
    }
  },
  maximize: async () => {
    try {
      return await ipcRenderer.invoke('window-maximize');
    } catch (error) {
      console.error('Error maximizing window:', error);
      return null;
    }
  },
  close: async () => {
    try {
      return await ipcRenderer.invoke('window-close');
    } catch (error) {
      console.error('Error closing window:', error);
      return null;
    }
  },
  
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

// Handle window control events
window.addEventListener('DOMContentLoaded', () => {
  // Add window control event listeners if needed
  const minimizeBtn = document.getElementById('minimize-btn');
  const maximizeBtn = document.getElementById('maximize-btn');
  const closeBtn = document.getElementById('close-btn');
  
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', async () => {
      try {
        await ipcRenderer.invoke('window-minimize');
      } catch (error) {
        console.error('Error minimizing window:', error);
      }
    });
  }
  
  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', async () => {
      try {
        await ipcRenderer.invoke('window-maximize');
      } catch (error) {
        console.error('Error maximizing window:', error);
      }
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', async () => {
      try {
        await ipcRenderer.invoke('window-close');
      } catch (error) {
        console.error('Error closing window:', error);
      }
    });
  }
});