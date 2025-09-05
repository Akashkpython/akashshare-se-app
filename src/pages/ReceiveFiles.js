import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  File, 
  Image, 
  Video, 
  Music, 
  Archive,
  Code,
  Share2,
  CheckCircle,
  AlertCircle,
  Wifi,
  Search
} from 'lucide-react';
import useStore from '../store/useStore';
import { formatFileSize } from '../lib/utils';
import api from '../lib/api';
import environment from '../config/environment';

const ReceiveFiles = () => {
  const { addTransfer, updateTransferProgress, completeTransfer, addNotification } = useStore();
  const [code, setCode] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [isValidating, setIsValidating] = useState(false);

  const checkBackendStatus = useCallback(async () => {
    setBackendStatus('checking');
    try {
      console.log('🔍 Checking backend status at:', `${environment.baseApiUrl}/health`);
      await api.healthCheck();
      setBackendStatus('online');
      console.log('✅ Backend is online');
    } catch (error) {
      console.error('Backend health check failed:', error);
      console.log('❌ Backend is offline');
      setBackendStatus('offline');
      
      // Add a more descriptive error notification
      addNotification({
        type: 'error',
        title: 'Backend Server Offline',
        message: 'The backend server is not running. Please start the backend server on port 5002.'
      });
    }
  }, [addNotification]);

  useEffect(() => {
    // Simulate data loading with a more realistic delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    
    // Check backend status
    checkBackendStatus();
    
    return () => clearTimeout(timer);
  }, [checkBackendStatus]);

  // Debounced validation function
  const debouncedValidateCode = useCallback(
    (codeValue) => {
      const validate = async () => {
        if (codeValue.length === 4) {
          setIsValidating(true);
          try {
            // Validate code by attempting to get file info
            const response = await fetch(`${environment.baseApiUrl}/download/${codeValue}`, {
              method: 'HEAD' // Use HEAD request for faster validation
            });
            
            if (response.ok) {
              // If HEAD request is successful, get file info
              const contentDisposition = response.headers.get('content-disposition');
              const contentLength = response.headers.get('content-length');
              const contentType = response.headers.get('content-type');
              
              // Extract filename from content-disposition header
              let filename = 'unknown-file';
              if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
                if (filenameMatch) {
                  filename = filenameMatch[1];
                }
              }
              
              setFileInfo({
                name: filename,
                size: contentLength ? parseInt(contentLength) : 0,
                type: contentType || 'application/octet-stream'
              });
            } else {
              setFileInfo(null);
            }
          } catch (error) {
            console.error('Validation error:', error);
            setFileInfo(null);
          } finally {
            setIsValidating(false);
          }
        } else {
          setFileInfo(null);
        }
      };
      
      const timeoutId = setTimeout(validate, 500);
      return () => clearTimeout(timeoutId);
    },
    []
  );

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(value);
    
    if (value.length === 4) {
      debouncedValidateCode(value);
    } else {
      setFileInfo(null);
    }
  };

  const handleDownload = async () => {
    if (!code || code.length !== 4) {
      addNotification({
        type: 'warning',
        title: 'Invalid Code',
        message: 'Please enter a valid 4-digit code'
      });
      return;
    }

    if (backendStatus !== 'online') {
      addNotification({
        type: 'error',
        title: 'Backend Offline',
        message: 'Cannot download files. Please ensure the backend server is running on port 5002.'
      });
      return;
    }

    if (!fileInfo) {
      addNotification({
        type: 'warning',
        title: 'No File Found',
        message: 'Please validate the code first'
      });
      return;
    }

    setDownloading(true);

    try {
      const transferId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      addTransfer({
        fileName: fileInfo.name,
        fileSize: fileInfo.size,
        fileType: fileInfo.type,
        direction: 'download'
      });

      // Simulate download progress
      for (let progress = 0; progress <= 90; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 30)); // Faster simulation
        updateTransferProgress(transferId, progress, 'downloading');
      }

      // Make actual API call
      const response = await api.downloadFile(code);
      
      updateTransferProgress(transferId, 100, 'downloading');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      completeTransfer(transferId, 'completed');
      
      setDownloading(false);
      addNotification({
        type: 'success',
        title: 'Download Complete!',
        message: `${fileInfo.name} has been downloaded`
      });
    } catch (error) {
      setDownloading(false);
      
      // Provide more specific error messages
      let errorMessage = error.message || 'Failed to download file. Please check if the backend is running.';
      
      if (error.message && error.message.includes('Cannot connect to server')) {
        errorMessage = 'Cannot connect to the backend server. Please ensure the backend is running on port 5002.';
      } else if (error.message && error.message.includes('fetch')) {
        errorMessage = 'Network error occurred. Please check your connection and ensure the backend server is running.';
      } else if (error.message && error.message.includes('404')) {
        errorMessage = 'File not found. The code may be invalid or the file may have expired.';
      }
      
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: errorMessage
      });
    }
  };

  const getFileIconComponent = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6 text-white" />;
    if (fileType.startsWith('video/')) return <Video className="w-6 h-6 text-white" />;
    if (fileType.startsWith('audio/')) return <Music className="w-6 h-6 text-white" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return <Archive className="w-6 h-6 text-white" />;
    if (fileType.includes('javascript') || fileType.includes('json') || fileType.includes('xml')) return <Code className="w-6 h-6 text-white" />;
    return <File className="w-6 h-6 text-white" />;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center mb-8">
          <div className="h-10 bg-foreground/10 rounded-xl animate-pulse mx-auto mb-4 w-1/4"></div>
          <div className="h-6 bg-foreground/10 rounded-lg animate-pulse mx-auto w-1/3"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-foreground/10 rounded-2xl animate-pulse"></div>
          <div className="h-96 bg-foreground/10 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">Receive Files</h1>
        <p className="text-foreground/70">Enter a share code to download files</p>
        
        {/* Backend Status Indicator */}
        <div className="mt-4 flex items-center justify-center">
          {backendStatus === 'checking' ? (
            <div className="flex items-center text-foreground/70">
              <div className="w-4 h-4 border-2 border-akash-400 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Checking backend status...</span>
            </div>
          ) : backendStatus === 'online' ? (
            <div className="flex items-center text-green-400">
              <Wifi className="w-4 h-4 mr-2" />
              <span>Backend server is online</span>
            </div>
          ) : (
            <div className="flex items-center text-red-400">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>Backend server is offline. Please start the backend server on port 5002.</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enter Code */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card p-6 rounded-lg border border-border"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2 text-akash-400" />
            Enter Share Code
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Share Code</label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="Enter 4-digit code"
                  className="w-full p-4 text-2xl text-center bg-background border border-foreground/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-akash-400"
                  maxLength={4}
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-akash-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <p className="text-sm text-foreground/50 mt-2">Ask the sender for the 4-digit share code</p>
            </div>
            
            {fileInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-foreground/5 rounded-xl"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-akash-400/20 flex items-center justify-center mr-3">
                    {getFileIconComponent(fileInfo.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{fileInfo.name}</p>
                    <p className="text-sm text-foreground/50">{formatFileSize(fileInfo.size)}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <button
              onClick={handleDownload}
              disabled={!code || code.length !== 4 || downloading || !fileInfo || backendStatus !== 'online'}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                !code || code.length !== 4 || downloading || !fileInfo || backendStatus !== 'online'
                  ? 'bg-foreground/10 text-foreground/50 cursor-not-allowed'
                  : 'bg-akash-500 hover:bg-akash-400 text-white hover:shadow-lg'
              }`}
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card p-6 rounded-lg border border-border"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-akash-400" />
            How It Works
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-akash-400/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-akash-400 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium">Get Share Code</h3>
                <p className="text-sm text-foreground/70 mt-1">Ask the sender for the 4-digit share code</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-akash-400/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-akash-400 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium">Enter Code</h3>
                <p className="text-sm text-foreground/70 mt-1">Type the code in the input field above</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-akash-400/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-akash-400 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium">Download File</h3>
                <p className="text-sm text-foreground/70 mt-1">Click download to save the file to your device</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-foreground/5 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-akash-400 mr-2" />
                <span className="font-medium">Files expire after 24 hours</span>
              </div>
              <p className="text-sm text-foreground/70 mt-2">
                For security, all files are automatically deleted 24 hours after upload
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReceiveFiles;