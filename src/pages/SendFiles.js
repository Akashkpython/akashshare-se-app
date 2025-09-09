import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Copy, Check, AlertCircle, Image, Video, Music, Archive, Code, Wifi, Share2, CheckCircle, X } from 'lucide-react';
import useStore from '../store/useStore.js';
import { api } from '../lib/api.js';
import { environment } from '../config/environment.js';
import { formatFileSize, copyToClipboard } from '../lib/utils.js';

const SendFiles = () => {
  const { addTransfer, updateTransferProgress, completeTransfer, addNotification, addShareCode } = useStore();
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const fileInputRef = useRef(null);

  // Debounce function for backend status checks
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  const checkBackendStatus = useCallback(async () => {
    setBackendStatus('checking');
    try {
      console.log('🔍 Checking backend status at:', `${environment.baseApiUrl}/health`);
      await api.healthCheck();
      setBackendStatus('online');
      console.log('✅ Backend is online and ready to handle requests');
    } catch (error) {
      console.error('Backend health check failed:', error);
      console.log('❌ Backend is offline or unreachable');
      setBackendStatus('offline');
      
      // Add a more descriptive error notification
      addNotification({
        type: 'error',
        title: 'Backend Server Offline',
        message: 'The backend server is not running or not accessible. Please ensure the Akash Share application is fully started and the backend server is running on port 5002.'
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
    
    // Set up periodic backend status checks with debouncing
    const debouncedStatusCheck = debounce(() => {
      if (!uploading) { // Only check when not uploading
        checkBackendStatus();
      }
    }, 5000); // Debounce for 5 seconds
    
    const statusCheckInterval = setInterval(debouncedStatusCheck, 30000); // Check every 30 seconds instead of 10
    
    return () => {
      clearTimeout(timer);
      clearInterval(statusCheckInterval);
    };
  }, [uploading, checkBackendStatus, debounce]);

  const handleFileSelect = useCallback((selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Batch upload function for better performance with multiple files
  const handleBatchUpload = async () => {
    if (files.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Files Selected',
        message: 'Please select files to upload'
      });
      return;
    }

    if (backendStatus !== 'online') {
      addNotification({
        type: 'error',
        title: 'Backend Offline',
        message: 'Cannot upload files. Please ensure the backend server is running on port 5002.'
      });
      return;
    }

    setUploading(true);

    try {
      // Upload files in parallel for better performance (limit to 3 concurrent uploads)
      const concurrencyLimit = 3;
      const uploadResults = [];
      
      // Process files in batches
      for (let i = 0; i < files.length; i += concurrencyLimit) {
        const batch = files.slice(i, i + concurrencyLimit);
        const batchPromises = batch.map(async (fileItem) => {
          const transferId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          
          addTransfer({
            fileName: fileItem.name,
            fileSize: fileItem.size,
            fileType: fileItem.type,
            direction: 'upload'
          });

          try {
            // Make actual API call
            const result = await api.uploadFile(fileItem.file);
            
            updateTransferProgress(transferId, 100, 'uploading');
            completeTransfer(transferId, 'completed');
            
            // Add share code
            addShareCode(result.code, {
              fileName: fileItem.name,
              fileSize: fileItem.size,
              fileType: fileItem.type,
              uploadStats: result.uploadStats
            });
            
            return result;
          } catch (error) {
            updateTransferProgress(transferId, 0, 'failed');
            completeTransfer(transferId, 'failed');
            throw error;
          }
        });
        
        // Wait for all uploads in this batch to complete
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process results
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            uploadResults.push(result.value);
          } else {
            console.error('Upload failed for file:', batch[index].name, result.reason);
          }
        });
      }

      // Use the first upload's code as the primary share code
      if (uploadResults.length > 0) {
        setShareCode(uploadResults[0].code);
      }

      setUploading(false);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Upload Complete!',
        message: `${uploadResults.length} file(s) uploaded successfully with code: ${uploadResults[0]?.code || 'N/A'}`
      });
      
      // Show performance notification if stats are available
      if (uploadResults[0]?.uploadStats) {
        const stats = uploadResults[0].uploadStats;
        addNotification({
          type: 'info',
          title: 'Upload Performance',
          message: `Speed: ${stats.formattedSpeed} | Duration: ${stats.duration.toFixed(2)}s`
        });
      }
      
      // Clear files after successful upload
      setFiles([]);
    } catch (error) {
      setUploading(false);
      
      // Provide more specific error messages
      let errorMessage = error.message || 'Failed to upload files. Please check if the backend is running.';
      
      if (error.message && error.message.includes('Cannot connect to server')) {
        errorMessage = 'Cannot connect to the backend server. Please ensure the backend is running on port 5002.';
      } else if (error.message && error.message.includes('fetch')) {
        errorMessage = 'Network error occurred. Please check your connection and ensure the backend server is running.';
      }
      
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: errorMessage
      });
    }
  };

  const handleUpload = async () => {
    // Use batch upload for better performance
    await handleBatchUpload();
  };

  const handleCopyCode = async () => {
    if (shareCode) {
      const success = await copyToClipboard(shareCode);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        addNotification({
          type: 'success',
          title: 'Code Copied!',
          message: 'Share code copied to clipboard'
        });
      }
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

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-800 rounded-xl animate-pulse mx-auto mb-4 w-1/4"></div>
          <div className="h-6 bg-gray-800 rounded-lg animate-pulse mx-auto w-1/3"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-900 rounded-2xl animate-pulse"></div>
          <div className="h-96 bg-gray-900 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-black text-white min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 text-white">Send Files</h1>
        <p className="text-gray-400">Upload files and share them with a unique code</p>
        
        {/* Backend Status Indicator */}
        <div className="mt-4 flex items-center justify-center">
          {backendStatus === 'checking' ? (
            <div className="flex items-center text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
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
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900 p-6 rounded-lg border border-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-gray-400" />
            Select Files
          </h2>
          
          {/* Drag & Drop Area */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragOver 
                ? 'border-gray-600 bg-gray-800/50' 
                : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            
            <Upload className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400 mb-2">
              <span className="text-gray-300 font-medium">Click to browse</span> or drag & drop files here
            </p>
            <p className="text-sm text-gray-500">Supports all file types up to 10MB</p>
          </div>
          
          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Selected Files ({files.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center mr-3">
                        {getFileIconComponent(fileItem.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-white">{fileItem.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(fileItem.size)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFile(fileItem.id)}
                      className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading || backendStatus !== 'online'}
            className={`w-full mt-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
              files.length === 0 || uploading || backendStatus !== 'online'
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-white hover:shadow-lg'
            }`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </>
            )}
          </button>
        </motion.div>

        {/* Share Code */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900 p-6 rounded-lg border border-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-gray-400" />
            Share Code
          </h2>
          
          {shareCode ? (
            <div className="text-center">
              <div className="inline-block p-6 bg-gray-800 rounded-2xl mb-6">
                <div className="text-4xl font-bold text-gray-300 tracking-widest">
                  {shareCode}
                </div>
              </div>
              
              <p className="text-gray-400 mb-6">
                Share this 4-digit code with others to download your files
              </p>
              
              <button
                onClick={handleCopyCode}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </button>
              
              <div className="mt-6 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-green-400 font-medium">Upload Successful!</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Files are available for download for 24 hours
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Share2 className="w-12 h-12 mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500">
                Upload files to generate a share code
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SendFiles;