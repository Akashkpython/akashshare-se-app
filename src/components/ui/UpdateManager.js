import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';

const UpdateManager = () => {
  const [updateStatus, setUpdateStatus] = useState('idle'); // idle, checking, available, not-available, downloading, downloaded, error
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    // Listen for update status messages from main process
    const handleUpdateStatus = (data) => {
      console.log('Update status received:', data);
      setUpdateStatus(data.status);
      
      switch (data.status) {
        case 'available':
          setUpdateInfo({ version: data.version });
          break;
        case 'downloading':
          setDownloadProgress(data.percent);
          break;
        case 'downloaded':
          setUpdateInfo({ version: data.version });
          break;
        case 'error':
          setUpdateInfo({ error: data.message });
          break;
        default:
          break;
      }
    };

    // Add event listener
    if (window.electronAPI) {
      window.electronAPI.onUpdateStatus(handleUpdateStatus);
    }

    // Cleanup
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeUpdateStatusListener();
      }
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      setUpdateStatus('checking');
      if (window.electronAPI) {
        await window.electronAPI.checkForUpdates();
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      setUpdateStatus('error');
      setUpdateInfo({ error: error.message });
    }
  };

  const downloadUpdate = async () => {
    try {
      setUpdateStatus('downloading');
      setDownloadProgress(0);
      if (window.electronAPI) {
        await window.electronAPI.downloadUpdate();
      }
    } catch (error) {
      console.error('Failed to download update:', error);
      setUpdateStatus('error');
      setUpdateInfo({ error: error.message });
    }
  };

  const installUpdate = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.quitAndInstall();
      }
    } catch (error) {
      console.error('Failed to install update:', error);
      setUpdateStatus('error');
      setUpdateInfo({ error: error.message });
    }
  };

  // Don't show anything if we're in a browser environment
  if (!window.electronAPI) {
    return null;
  }

  return (
    <div className="fixed z-50 bottom-4 right-4">
      {updateStatus === 'idle' && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 transition-colors rounded-full shadow-lg glass-card hover:bg-foreground/10"
          onClick={checkForUpdates}
          title="Check for updates"
        >
          <RefreshCw className="w-5 h-5 text-foreground" />
        </motion.button>
      )}

      {updateStatus === 'checking' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center p-4 space-x-3 shadow-lg glass-card rounded-xl"
        >
          <motion.div
            className="w-5 h-5 border-2 rounded-full border-akash-400 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-sm text-foreground">Checking for updates...</span>
        </motion.div>
      )}

      {updateStatus === 'available' && updateInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xs p-4 shadow-lg glass-card rounded-xl"
        >
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-akash-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Update Available</h3>
              <p className="mt-1 text-sm text-foreground/70">
                Version {updateInfo.version} is available for download
              </p>
              <div className="flex mt-3 space-x-2">
                <button
                  onClick={downloadUpdate}
                  className="flex items-center text-xs btn-primary"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </button>
                <button
                  onClick={() => setUpdateStatus('idle')}
                  className="text-xs btn-secondary"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {updateStatus === 'downloading' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-64 p-4 shadow-lg glass-card rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground">Downloading update...</span>
            <span className="text-sm text-foreground/70">{downloadProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-foreground/20">
            <motion.div
              className="h-2 rounded-full bg-akash-400"
              initial={{ width: 0 }}
              animate={{ width: `${downloadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {updateStatus === 'downloaded' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xs p-4 shadow-lg glass-card rounded-xl"
        >
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Update Downloaded</h3>
              <p className="mt-1 text-sm text-foreground/70">
                Version {updateInfo?.version} is ready to install
              </p>
              <div className="flex mt-3 space-x-2">
                <button
                  onClick={installUpdate}
                  className="text-xs btn-primary"
                >
                  Install Now
                </button>
                <button
                  onClick={() => setUpdateStatus('idle')}
                  className="text-xs btn-secondary"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {updateStatus === 'not-available' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center p-4 space-x-3 shadow-lg glass-card rounded-xl"
        >
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-sm text-foreground">You&apos;re up to date!</span>
        </motion.div>
      )}

      {updateStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xs p-4 shadow-lg glass-card rounded-xl"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Update Error</h3>
              <p className="mt-1 text-sm text-foreground/70">
                {updateInfo?.error || 'Failed to check for updates'}
              </p>
              <div className="flex mt-3 space-x-2">
                <button
                  onClick={checkForUpdates}
                  className="text-xs btn-primary"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setUpdateStatus('idle')}
                  className="text-xs btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UpdateManager;