import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// File size formatter
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
}

// Generate random share code (4-digit numeric)
export function generateShareCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Validate share code (4-digit numeric)
export function validateShareCode(code) {
  return /^\d{4}$/.test(code);
}

// Get file icon based on type
export function getFileIcon(fileType) {
  const icons = {
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    document: '📄',
    archive: '📦',
    code: '💻',
    pdf: '📕',
    default: '📁'
  };
  
  if (fileType.startsWith('image/')) return icons.image;
  if (fileType.startsWith('video/')) return icons.video;
  if (fileType.startsWith('audio/')) return icons.audio;
  if (fileType.includes('pdf')) return icons.pdf;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return icons.archive;
  if (fileType.includes('text') || fileType.includes('document')) return icons.document;
  if (fileType.includes('javascript') || fileType.includes('python') || fileType.includes('java')) return icons.code;
  
  return icons.default;
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to copy text: ', err);
    return false;
  }
}

// Format date
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

// Calculate transfer speed
export function calculateSpeed(bytes, seconds) {
  if (seconds === 0) return '0 B/s';
  const speed = bytes / seconds;
  return `${formatFileSize(speed)  }/s`;
}

// Input sanitization functions for security
export function sanitizeString(input, maxLength = 255) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"'&]/g, (match) => {
      const htmlEntities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return htmlEntities[match];
    });
}

export function sanitizeFileName(fileName) {
  if (typeof fileName !== 'string') return 'unnamed';
  
  // Remove dangerous characters and limit length
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 100)
    .replace(/^\.|\.$/, '_');
}

export function validateFileSize(size, maxSize = 100 * 1024 * 1024) {
  return typeof size === 'number' && size > 0 && size <= maxSize;
}

export function sanitizeShareCode(code) {
  if (typeof code !== 'string') return '';
  // Only allow 4-digit numeric codes
  return code.replace(/\D/g, '').slice(0, 4);
}

// Get local IP address for network connections
export function getLocalIP() {
  return new Promise((resolve, reject) => {
    // For browsers that support it, try to get the local IP
    if (typeof window !== 'undefined' && window.RTCPeerConnection) {
      const pc = new RTCPeerConnection({
        iceServers: []
      });
      
      pc.createDataChannel('');
      
      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) return;
        
        const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
        pc.onicecandidate = () => {};
        resolve(myIP);
      };
      
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(reject);
    } else {
      // Fallback to localhost
      resolve('localhost');
    }
  });
}