import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Code, 
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Shield
} from 'lucide-react';
import useStore from '../store/useStore';
import { copyToClipboard, validateShareCode, sanitizeShareCode } from '../lib/utils';
import api from '../lib/api';
import FilePreview from '../components/FilePreview';

const ReceiveFiles = () => {
  const { addTransfer, updateTransferProgress, completeTransfer, addNotification } = useStore();
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [foundFiles, setFoundFiles] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading with a more realistic delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);

  const handleCodeChange = (e) => {
    const sanitizedCode = sanitizeShareCode(e.target.value);
    setCode(sanitizedCode);
    
    // Auto-validate when code is complete (4 digits)
    if (sanitizedCode.length === 4) {
      validateCode(sanitizedCode);
    } else {
      setFoundFiles(null);
    }
  };

  const validateCode = async (shareCode) => {
    if (!validateShareCode(shareCode)) {
      addNotification({
        type: 'error',
        title: 'Invalid Code',
        message: 'Please enter a valid 4-digit code'
      });
      return;
    }

    setIsValidating(true);
    
    try {
      // Try to download the file to validate the code
      const response = await api.downloadFile(shareCode);
      
      // If successful, create file info from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const fileName = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'unknown'
        : 'unknown';
      
      const fileSize = response.headers.get('content-length') || 0;
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      
      const fileInfo = {
        id: 1,
        name: fileName,
        size: parseInt(fileSize),
        type: contentType,
        uploadedAt: new Date(),
        code: shareCode
      };
      
      setFoundFiles([fileInfo]);
      setIsValidating(false);
      
      addNotification({
        type: 'success',
        title: 'Code Valid!',
        message: 'File found and ready for download'
      });
    } catch (error) {
      setIsValidating(false);
      setFoundFiles(null);
      
      addNotification({
        type: 'error',
        title: 'Invalid Code',
        message: error.message || 'Code not found or expired'
      });
    }
  };

  const handlePreview = async (file) => {
    try {
      // For various file types, we can try to get a preview
      if (file.type.startsWith('image/') || file.type.startsWith('text/') || file.type.startsWith('video/') || file.type.startsWith('audio/') || file.type.includes('pdf')) {
        const response = await api.downloadFile(file.code);
        const blob = await response.blob();
        URL.createObjectURL(blob);
        // The FilePreview component handles its own preview state
        // We don't need to store it in the parent component
      }
    } catch (error) {
      console.error('Preview error:', error);
      addNotification({
        type: 'error',
        title: 'Preview Failed',
        message: 'Could not generate preview for this file'
      });
    }
  };

  const handleDownload = async (file) => {
    setDownloading(true);
    
    const transferId = Date.now().toString();
    
    addTransfer({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      direction: 'download'
    });

    try {
      // Simulate download progress
      for (let progress = 0; progress <= 90; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateTransferProgress(transferId, progress, 'downloading');
      }

      // Make actual download request
      const response = await api.downloadFile(file.code);
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      updateTransferProgress(transferId, 100, 'downloading');
      completeTransfer(transferId, 'completed');
      setDownloading(false);
      
      addNotification({
        type: 'success',
        title: 'Download Complete!',
        message: `${file.name} has been downloaded successfully`
      });
    } catch (error) {
      updateTransferProgress(transferId, 0, 'failed');
      completeTransfer(transferId, 'failed');
      setDownloading(false);
      
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: error.message || 'Failed to download file'
      });
    }
  };

  const handleDownloadAll = async () => {
    if (!foundFiles) return;
    
    setDownloading(true);
    
    for (const file of foundFiles) {
      await handleDownload(file);
    }
    
    setDownloading(false);
  };

  const handleCopyCode = async () => {
    if (code) {
      const success = await copyToClipboard(code);
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8 text-center">
          <div className="w-1/4 h-10 mx-auto mb-4 bg-foreground/10 rounded-xl animate-pulse"></div>
          <div className="w-1/3 h-6 mx-auto rounded-lg bg-foreground/10 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
        className="text-center"
      >
        <h1 className="mb-2 text-3xl font-bold gradient-text">Receive Files</h1>
        <p className="text-foreground/70">Enter a share code to download files</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Code Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Code Input */}
          <div className="p-6 glass-card" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Enter Share Code</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <Code className="w-6 h-6 text-white" />
                  <input
                    type="text"
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="Enter 4-digit code"
                    maxLength={4}
                    className="flex-1 font-mono text-2xl tracking-wider text-center input-field"
                  />
                  {code && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyCode}
                      className="p-2 transition-colors rounded-xl hover:bg-white/10"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Copy className="w-5 h-5 text-white" />
                      )}
                    </motion.button>
                  )}
                </div>
                
                {isValidating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 mx-auto border-2 border-white rounded-full border-t-transparent"
                    />
                    <p className="mt-2 text-sm text-foreground/60">Validating code...</p>
                  </motion.div>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-foreground/60">
                  Enter the 4-digit code shared with you
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 glass-card" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">How to receive files</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-white/20">
                  <span className="text-sm font-bold text-white">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Get Share Code</h4>
                  <p className="text-sm text-foreground/60">Ask the sender for the 4-digit share code</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-white/20">
                  <span className="text-sm font-bold text-white">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Enter Code</h4>
                  <p className="text-sm text-foreground/60">Type the code in the input field above</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-white/20">
                  <span className="text-sm font-bold text-white">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Download Files</h4>
                  <p className="text-sm text-foreground/60">Preview and download the shared files</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* File Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* File Preview */}
          <div className="p-6 glass-card" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Files Available</h3>
            
            {foundFiles ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="mb-4 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-700 to-black">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="mb-2 font-medium text-foreground">Files Found!</h4>
                  <p className="text-sm text-foreground/60">
                    {foundFiles.length} file(s) ready for download
                  </p>
                </div>

                <div className="space-y-3">
                  {foundFiles.map((file, _index) => (
                    <FilePreview
                      key={file.id}
                      file={file}
                      onDownload={handleDownload}
                      onPreview={handlePreview}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadAll}
                  disabled={downloading}
                  className="flex items-center justify-center w-full space-x-2 btn-primary"
                >
                  {downloading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Download className="w-5 h-5 text-white" />
                      </motion.div>
                      <span className="text-white">Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-white" />
                      <span className="text-white">Download All Files</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              <div className="py-8 text-center">
                <Code className="w-12 h-12 mx-auto mb-3 text-foreground/40" />
                <p className="text-foreground/60">No files found</p>
                <p className="text-sm text-foreground/40">Enter a valid share code to see files</p>
              </div>
            )}
          </div>

          {/* Security Info */}
          <div className="p-6 glass-card" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Security Features</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-white" />
                <div>
                  <h4 className="font-medium text-foreground">Secure Transfer</h4>
                  <p className="text-sm text-foreground/60">End-to-end encrypted file sharing</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-white" />
                <div>
                  <h4 className="font-medium text-foreground">Time Limited</h4>
                  <p className="text-sm text-foreground/60">Codes expire after 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-white" />
                <div>
                  <h4 className="font-medium text-foreground">Safe & Private</h4>
                  <p className="text-sm text-foreground/60">No personal data required</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReceiveFiles;