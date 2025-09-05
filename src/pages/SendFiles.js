import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  X, 
  Copy, 
  Check, 
  File, 
  Image, 
  Video, 
  Music, 
  Archive,
  Code,
  Share2,
  CheckCircle,
  AlertCircle,
  Wifi
} from 'lucide-react';
import useStore from '../store/useStore';
import { formatFileSize, copyToClipboard } from '../lib/utils';
import api from '../lib/api';
import environment from '../config/environment';

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

  useEffect(() => {
    // Simulate data loading with a more realistic delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    
    // Check backend status
    checkBackendStatus();
    
    // Set up periodic backend status checks
    const statusCheckInterval = setInterval(() => {
      if (!uploading) { // Only check when not uploading
        checkBackendStatus();
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearTimeout(timer);
      clearInterval(statusCheckInterval);
    };
  }, [uploading]);

  const checkBackendStatus = async () => {
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
  };

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

  const handleUpload = async () => {
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
      // Upload each file and collect results
      const uploadResults = [];
      
      for (const fileItem of files) {
        const transferId = Date.now().toString();
        
        addTransfer({
          fileName: fileItem.name,
          fileSize: fileItem.size,
          fileType: fileItem.type,
          direction: 'upload'
        });

        try {
          // Simulate upload progress
          for (let progress = 0; progress <= 90; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 50));
            updateTransferProgress(transferId, progress, 'uploading');
          }

          // Make actual API call
          const result = await api.uploadFile(fileItem.file);
          
          uploadResults.push(result);
          
          updateTransferProgress(transferId, 100, 'uploading');
          completeTransfer(transferId, 'completed');
          
          // Add share code
          addShareCode(result.code, {
            fileName: fileItem.name,
            fileSize: fileItem.size,
            fileType: fileItem.type,
            uploadStats: result.uploadStats // Add upload stats
          });
        } catch (error) {
          updateTransferProgress(transferId, 0, 'failed');
          completeTransfer(transferId, 'failed');
          throw error;
        }
      }

      // Use the first upload's code as the primary share code
      if (uploadResults.length > 0) {
        setShareCode(uploadResults[0].code);
      }

      setUploading(false);
      addNotification({
        type: 'success',
        title: 'Upload Complete!',
        message: `Files uploaded successfully with code: ${uploadResults[0]?.code || 'N/A'}`
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
        <h1 className="text-3xl font-bold gradient-text mb-2">Send Files</h1>
        <p className="text-foreground/70">Upload files and share them with a unique code</p>
        
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
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card p-6 rounded-lg border border-border"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-akash-400" />
            Select Files
          </h2>
          
          {/* Drag & Drop Area */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragOver 
                ? 'border-akash-400 bg-akash-400/10' 
                : 'border-foreground/30 hover:border-akash-400 hover:bg-foreground/5'
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
            
            <Upload className="w-12 h-12 mx-auto text-foreground/50 mb-4" />
            <p className="text-foreground/70 mb-2">
              <span className="text-akash-400 font-medium">Click to browse</span> or drag & drop files here
            </p>
            <p className="text-sm text-foreground/50">Supports all file types up to 10MB</p>
          </div>
          
          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Selected Files ({files.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-akash-400/20 flex items-center justify-center mr-3">
                        {getFileIconComponent(fileItem.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileItem.name}</p>
                        <p className="text-xs text-foreground/50">{formatFileSize(fileItem.size)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFile(fileItem.id)}
                      className="p-1 rounded-full hover:bg-foreground/10 text-foreground/50 hover:text-foreground"
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
                ? 'bg-foreground/10 text-foreground/50 cursor-not-allowed'
                : 'bg-akash-500 hover:bg-akash-400 text-white hover:shadow-lg'
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
          className="bg-card p-6 rounded-lg border border-border"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-akash-400" />
            Share Code
          </h2>
          
          {shareCode ? (
            <div className="text-center">
              <div className="inline-block p-6 bg-foreground/5 rounded-2xl mb-6">
                <div className="text-4xl font-bold text-akash-400 tracking-widest">
                  {shareCode}
                </div>
              </div>
              
              <p className="text-foreground/70 mb-6">
                Share this 4-digit code with others to download your files
              </p>
              
              <button
                onClick={handleCopyCode}
                className="w-full py-3 bg-akash-500 hover:bg-akash-400 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
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
              
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-green-400 font-medium">Upload Successful!</span>
                </div>
                <p className="text-sm text-foreground/70 mt-2">
                  Files are available for download for 24 hours
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Share2 className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
              <p className="text-foreground/50">
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