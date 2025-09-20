import environment from '../config/environment.js';
import performanceMonitor from './performance.js';


// Make API_BASE_URL dynamic to handle Electron environment changes
const getDynamicApiBaseUrl = () => {
  console.log('🔧 Using environment base API URL in API:', environment.baseApiUrl);
  return environment.baseApiUrl;
};

// Format bytes to human readable format
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Format speed to human readable format
const formatSpeed = (bytesPerSecond) => {
  if (bytesPerSecond === 0) return '0 B/s';
  if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(2)} B/s`;
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(2)} KB/s`;
  if (bytesPerSecond < 1024 * 1024 * 1024) return `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`;
  return `${(bytesPerSecond / (1024 * 1024 * 1024)).toFixed(2)} GB/s`;
};

// API utility functions
export const api = {
  // Upload a file with performance monitoring
  uploadFile: async (file) => {
    performanceMonitor.start('file-upload');
    
    try {
      const API_BASE_URL = getDynamicApiBaseUrl();
      console.log('🔍 Upload API Debug Info:');
      console.log('  - API_BASE_URL:', API_BASE_URL);
      console.log('  - Window protocol:', typeof window !== 'undefined' ? window.location.protocol : 'undefined');
      console.log('  - Full upload URL:', `${API_BASE_URL}/upload`);
      console.log('  - File name:', file.name);
      console.log('  - File size:', file.size);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const startTime = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // Add performance headers
        headers: {
          'X-Request-Start': Date.now().toString()
        }
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      
      // Calculate and log transfer speed
      const duration = (endTime - startTime) / 1000; // in seconds
      const speed = duration > 0 ? file.size / duration : 0;
      console.log(`📤 Upload Performance: ${file.name}`);
      console.log(`   Size: ${formatBytes(file.size)}`);
      console.log(`   Duration: ${(duration).toFixed(2)}s`);
      console.log(`   Speed: ${formatSpeed(speed)}`);
      
      // Check if response is empty or not JSON
      const text = await response.text();
      if (!text) {
        throw new Error('Server returned empty response. Please check if the backend is running.');
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('Response text:', text);
        throw new Error(`Server returned invalid JSON. Response: ${text.substring(0, 200)}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || `Upload failed with status ${response.status}`);
      }
      
      performanceMonitor.end('file-upload');
      return {
        ...data,
        uploadStats: {
          fileSize: file.size,
          duration,
          speed,
          formattedSpeed: formatSpeed(speed)
        }
      };
    } catch (error) {
      performanceMonitor.end('file-upload');
      console.error('❌ Upload error:', error);
      const API_BASE_URL = getDynamicApiBaseUrl();
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        apiBaseUrl: API_BASE_URL,
        uploadUrl: `${API_BASE_URL}/upload`,
        windowProtocol: typeof window !== 'undefined' ? window.location.protocol : 'undefined'
      });
      
      if (error.name === 'AbortError') {
        throw new Error('Upload timed out. Please check your network connection and try again.');
      }
      
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        const API_BASE_URL = getDynamicApiBaseUrl();
        console.error('❌ Fetch error details:', {
          apiBaseUrl: API_BASE_URL,
          endpoint: `${API_BASE_URL}/upload`,
          error: error.message
        });
        throw new Error('Cannot connect to server. Please check if the backend is running on port 5005.');
      }
      
      throw error;
    }
  },

  // Download a file by code with performance monitoring and caching
  downloadFile: async (code) => {
    performanceMonitor.start('file-download');
    
    try {
      const API_BASE_URL = getDynamicApiBaseUrl();
      const startTime = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${API_BASE_URL}/download/${code}`, {
        method: 'GET',
        signal: controller.signal,
        // Add cache control headers
        headers: {
          'Cache-Control': 'max-age=3600',
          'X-Request-Start': Date.now().toString()
        }
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(errorText || 'Download failed');
        }
        throw new Error(errorData.error || 'Download failed');
      }
      
      // Calculate and log transfer speed if content-length header is available
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const duration = (endTime - startTime) / 1000; // in seconds
        const speed = duration > 0 ? parseInt(contentLength) / duration : 0;
        console.log(`📥 Download Performance: Code ${code}`);
        console.log(`   Size: ${formatBytes(parseInt(contentLength))}`);
        console.log(`   Duration: ${(duration).toFixed(2)}s`);
        console.log(`   Speed: ${formatSpeed(speed)}`);
      }
      
      performanceMonitor.end('file-download');
      return response;
    } catch (error) {
      performanceMonitor.end('file-download');
      console.error('Download error:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Download timed out. Please check your network connection and try again.');
      }
      
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        const API_BASE_URL = getDynamicApiBaseUrl();
        console.error('❌ Fetch error details:', {
          apiBaseUrl: API_BASE_URL,
          endpoint: `${API_BASE_URL}/download/${code}`,
          error: error.message
        });
        throw new Error('Cannot connect to server. Please check if the backend is running on port 5005.');
      }
      
      throw error;
    }
  },

  // Health check with caching
  healthCheck: async () => {
    try {
      const API_BASE_URL = getDynamicApiBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        // Add cache control for health checks
        headers: {
          'Cache-Control': 'max-age=30'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      
      return response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Health check timed out');
      }
      
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        const API_BASE_URL = getDynamicApiBaseUrl();
        console.error('❌ Fetch error details:', {
          apiBaseUrl: API_BASE_URL,
          endpoint: `${API_BASE_URL}/health`,
          error: error.message
        });
        throw new Error('Cannot connect to backend server');
      }
      
      throw error;
    }
  },
};

export default api;