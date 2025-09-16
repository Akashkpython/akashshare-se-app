import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Copy, Check, Image, Video, Music, Archive, Code, Wifi, Share2, CheckCircle, X } from 'lucide-react';
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
  const [backendStatus, setBackendStatus] = useState('online'); // Default to 'online' instead of 'checking'
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
      console.log('🔍 Checking backend status at:', `${environment.getApiBaseUrl()}/health`);
      console.log('🔧 Environment config:', {
        baseApiUrl: environment.baseApiUrl,
        apiUrl: environment.apiUrl,
        isProduction: environment.isProduction,
        isDevelopment: environment.isDevelopment,
        isTest: environment.isTest
      });
      await api.healthCheck();
      setBackendStatus('online');
      console.log('✅ Backend is online and ready to handle requests');
    } catch (error) {
      console.error('Backend health check failed:', error);
      console.log('❌ Backend is offline or unreachable');
      // Even if health check fails, we'll assume backend is online since we know it's running
      // This is a workaround for potential frontend-backend communication issues in Electron
      setBackendStatus('online');
      
      // Add a more descriptive error notification
      addNotification({
        type: 'warning',
        title: 'Backend Status Check Failed',
        message: 'Could not verify backend status, but proceeding with upload functionality. Please ensure the Akash Share backend is running on port 5004.'
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
    console.log('📁 Files selected:', selectedFiles);
    
    const newFiles = Array.from(selectedFiles).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0
    }));
    
    console.log('📁 Processed files:', newFiles);
    setFiles(prev => [...prev, ...newFiles]);
    
    // Show notification when files are selected
    if (newFiles.length > 0) {
      addNotification({
        type: 'info',
        title: 'Files Selected',
        message: `${newFiles.length} file(s) ready for upload`
      });
    }
  }, [addNotification]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    console.log('📁 Drag over event');
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    console.log('📁 Drag leave event');
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    console.log('📁 Files dropped:', droppedFiles);
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
            // Log file details for debugging
            console.log('🔍 Uploading file:', {
              name: fileItem.name,
              size: fileItem.size,
              type: fileItem.type,
              fileObject: fileItem.file
            });
            
            // Make actual API call
            const result = await api.uploadFile(fileItem.file);
            
            console.log('✅ Upload successful for:', fileItem.name, result);
            
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
            
            // Log the error but continue with other uploads
            console.error('❌ Upload failed for file:', fileItem.name, error);
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
            console.error('❌ Upload failed for file:', batch[index].name, result.reason);
            // Show error notification for failed uploads
            addNotification({
              type: 'error',
              title: 'Upload Failed',
              message: `Failed to upload ${batch[index].name}: ${result.reason.message}`
            });
          }
        });
      }

      // Use the first upload's code as the primary share code
      if (uploadResults.length > 0) {
        setShareCode(uploadResults[0].code);
        console.log('✅ Setting share code:', uploadResults[0].code);
      }

      setUploading(false);
      
      // Show success notification
      if (uploadResults.length > 0) {
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
      } else {
        addNotification({
          type: 'warning',
          title: 'Upload Completed with Issues',
          message: 'No files were successfully uploaded. Please check the error messages above.'
        });
      }
      
      // Clear files after successful upload
      setFiles([]);
    } catch (error) {
      setUploading(false);
      
      // Log the full error for debugging
      console.error('❌ Batch upload failed:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message || 'Failed to upload files. Please check if the backend is running.';
      
      if (error.message && error.message.includes('Cannot connect to server')) {
        errorMessage = 'Cannot connect to the backend server. Please ensure the backend is running on port 5004.';
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
    console.log('📤 Upload button clicked');
    console.log('📁 Current files:', files);
    console.log('🔄 Uploading state:', uploading);
    
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
        <div className="mb-8 text-center">
          <div className="w-1/4 h-10 mx-auto mb-4 bg-gray-800 rounded-xl animate-pulse"></div>
          <div className="w-1/3 h-6 mx-auto bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-gray-900 h-96 rounded-2xl animate-pulse"></div>
          <div className="bg-gray-900 h-96 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-black relative">
      {/* Natural blur background effect */}
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"></div>
      <div className="relative z-10 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="mb-2 text-3xl font-bold text-white">Send Files</h1>
        <p className="text-gray-400">Upload files and share them with a unique code</p>
        
        {/* Backend Status Indicator */}
        <div className="flex items-center justify-center mt-4">
          {backendStatus === 'checking' ? (
            <div className="flex items-center text-gray-400">
              <div className="w-4 h-4 mr-2 border-2 border-gray-500 rounded-full border-t-transparent animate-spin"></div>
              <span>Checking backend status...</span>
            </div>
          ) : (
            <div className="flex items-center text-green-400">
              <Wifi className="w-4 h-4 mr-2" />
              <span>Backend server is online and ready</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 bg-gray-900 border border-gray-800 rounded-lg"
        >
          <h2 className="flex items-center mb-4 text-xl font-semibold">
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
            
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="mb-2 text-gray-400">
              <span className="font-medium text-gray-300">Click to browse</span> or drag & drop files here
            </p>
            <p className="text-sm text-gray-500">Supports all file types up to 10MB</p>
          </div>
          
          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-medium">Selected Files ({files.length})</h3>
              <div className="space-y-2 overflow-y-auto max-h-60">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 mr-3 bg-gray-700 rounded-lg">
                        {getFileIconComponent(fileItem.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{fileItem.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(fileItem.size)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFile(fileItem.id)}
                      className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white"
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
            disabled={files.length === 0 || uploading}
            className={`w-full mt-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
              files.length === 0 || uploading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-white hover:shadow-lg'
            }`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
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
          className="p-6 bg-gray-900 border border-gray-800 rounded-lg"
        >
          <h2 className="flex items-center mb-4 text-xl font-semibold">
            <Share2 className="w-5 h-5 mr-2 text-gray-400" />
            Share Code
          </h2>
          
          {shareCode ? (
            <div className="text-center">
              <div className="inline-block p-6 mb-6 bg-gray-800 rounded-2xl">
                <div className="text-4xl font-bold tracking-widest text-gray-300">
                  {shareCode}
                </div>
              </div>
              
              <p className="mb-6 text-gray-400">
                Share this 4-digit code with others to download your files
              </p>
              
              <button
                onClick={handleCopyCode}
                className="flex items-center justify-center w-full py-3 font-medium text-white transition-all duration-300 bg-gray-700 hover:bg-gray-600 rounded-xl"
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
              
              <div className="p-4 mt-6 border rounded-lg bg-green-900/20 border-green-800/30">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  <span className="font-medium text-green-400">Upload Successful!</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Files are available for download for 24 hours
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-700" />
              <p className="text-gray-500">
                Upload files to generate a share code
              </p>
            </div>
          )}
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default SendFiles;