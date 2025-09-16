import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Info, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const AppUpdates = () => {
  const [updateInfo, setUpdateInfo] = useState({
    currentVersion: '1.0.4',
    latestVersion: '1.0.4',
    lastChecked: new Date().toLocaleString(),
    updateAvailable: false,
    status: 'idle', // idle, checking, available, downloading, downloaded, error
    progress: 0,
    error: null
  });
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if we're running in Electron
    setIsElectron(!!window.electronAPI);
    
    // Listen for update status from main process
    if (window.electronAPI) {
      const handleUpdateStatus = (event, data) => {
        console.log('📱 Update status received:', data);
        
        switch (data.status) {
          case 'checking':
            setUpdateInfo(prev => ({
              ...prev,
              status: 'checking',
              lastChecked: new Date().toLocaleString(),
              error: null
            }));
            break;
          case 'available':
            setUpdateInfo(prev => ({
              ...prev,
              status: 'available',
              updateAvailable: true,
              latestVersion: data.version || prev.latestVersion,
              error: null
            }));
            break;
          case 'not-available':
            setUpdateInfo(prev => ({
              ...prev,
              status: 'idle',
              updateAvailable: false,
              error: null
            }));
            break;
          case 'downloading':
            setUpdateInfo(prev => ({
              ...prev,
              status: 'downloading',
              progress: data.percent || 0,
              error: null
            }));
            break;
          case 'downloaded':
            setUpdateInfo(prev => ({
              ...prev,
              status: 'downloaded',
              progress: 100,
              latestVersion: data.version || prev.latestVersion,
              error: null
            }));
            break;
          case 'error':
            setUpdateInfo(prev => ({
              ...prev,
              status: 'error',
              error: data.message || 'Unknown error occurred',
              updateAvailable: false
            }));
            break;
        }
      };

      window.electronAPI.onUpdateStatus(handleUpdateStatus);
      
      return () => {
        if (window.electronAPI && window.electronAPI.removeUpdateStatusListener) {
          window.electronAPI.removeUpdateStatusListener(handleUpdateStatus);
        }
      };
    }
  }, []);

  const handleCheckForUpdates = async () => {
    if (!isElectron) {
      alert('Auto-updates are only available in the Electron app.');
      return;
    }

    try {
      setUpdateInfo(prev => ({ ...prev, status: 'checking', error: null }));
      await window.electronAPI.checkForUpdates();
    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateInfo(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error.message || 'Failed to check for updates' 
      }));
    }
  };

  const handleDownloadUpdate = async () => {
    if (!isElectron) {
      alert('Auto-updates are only available in the Electron app.');
      return;
    }

    try {
      setUpdateInfo(prev => ({ ...prev, status: 'downloading', error: null }));
      await window.electronAPI.downloadUpdate();
    } catch (error) {
      console.error('Error downloading update:', error);
      setUpdateInfo(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error.message || 'Failed to download update' 
      }));
    }
  };

  const handleInstallUpdate = () => {
    if (!isElectron) {
      alert('Auto-updates are only available in the Electron app.');
      return;
    }

    if (window.electronAPI.quitAndInstall) {
      window.electronAPI.quitAndInstall();
    }
  };

  const getStatusIcon = () => {
    switch (updateInfo.status) {
      case 'checking':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'available':
        return <Download className="w-4 h-4 text-orange-400" />;
      case 'downloading':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'downloaded':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getStatusText = () => {
    switch (updateInfo.status) {
      case 'checking':
        return 'Checking for updates...';
      case 'available':
        return 'Update Available';
      case 'downloading':
        return `Downloading... ${updateInfo.progress}%`;
      case 'downloaded':
        return 'Update Downloaded';
      case 'error':
        return 'Error';
      default:
        return updateInfo.updateAvailable ? 'Update Available' : 'Up to Date';
    }
  };

  const getStatusColor = () => {
    switch (updateInfo.status) {
      case 'checking':
      case 'downloading':
        return 'text-blue-400';
      case 'available':
        return 'text-orange-400';
      case 'downloaded':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return updateInfo.updateAvailable ? 'text-orange-400' : 'text-green-400';
    }
  };

  return (
    <div className="h-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-2 text-3xl font-bold text-foreground"
          >
            App Updates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-foreground/70"
          >
            Manage and check for application updates
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 mb-6 glass-card rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="mb-1 text-xl font-semibold text-foreground">Current Version</h2>
              <p className="text-foreground/70">v{updateInfo.currentVersion}</p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-foreground/10">
              <span className="text-foreground/70">Latest Version</span>
              <span className="font-medium text-foreground">v{updateInfo.latestVersion}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-foreground/10">
              <span className="text-foreground/70">Last Checked</span>
              <span className="font-medium text-foreground">{updateInfo.lastChecked}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-foreground/70">Status</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
            </div>
            
            {updateInfo.status === 'downloading' && (
              <div className="mt-4">
                <div className="flex justify-between mb-2 text-sm text-foreground/70">
                  <span>Download Progress</span>
                  <span>{updateInfo.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full">
                  <div 
                    className="h-2 transition-all duration-300 bg-blue-500 rounded-full"
                    style={{ width: `${updateInfo.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {updateInfo.error && (
              <div className="p-3 mt-4 border rounded-lg bg-red-900/20 border-red-500/30">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{updateInfo.error}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 glass-card rounded-2xl"
        >
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-akash-400 to-blue-500">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">How Updates Work</h3>
              <p className="mb-4 text-foreground/70">
                When an update is available, you&apos;ll be notified and can choose when to install it.
              </p>
              <div className="flex flex-wrap gap-2">
                <button 
                  className="flex items-center btn-primary"
                  onClick={handleCheckForUpdates}
                  disabled={updateInfo.status === 'checking' || updateInfo.status === 'downloading'}
                >
                  {updateInfo.status === 'checking' ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Check for Updates
                </button>
                
                {updateInfo.status === 'available' && (
                  <button 
                    className="flex items-center btn-secondary"
                    onClick={handleDownloadUpdate}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Update
                  </button>
                )}
                
                {updateInfo.status === 'downloaded' && (
                  <button 
                    className="flex items-center btn-primary"
                    onClick={handleInstallUpdate}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Install & Restart
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AppUpdates;