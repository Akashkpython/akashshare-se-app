// Enhanced file validation utilities with cross-platform support
import path from 'path';
import { PathUtils, OSUtils } from './crossPlatform.js';

/**
 * Validate uploaded file
 * @param {object} file - Multer file object
 * @returns {object} - Validation result
 */
export function validateFile(file) {
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  // Check file size (10MB default limit)
  const maxSize = parseInt(process.env.FILE_SIZE_LIMIT) || 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { 
      success: false, 
      error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB` 
    };
  }

  // Check file type
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 
    'image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain').split(',');
  
  if (!allowedTypes.includes(file.mimetype)) {
    return { 
      success: false, 
      error: `File type '${file.mimetype}' not allowed` 
    };
  }

  // Validate filename
  const validation = validateFilename(file.originalname);
  if (!validation.success) {
    return validation;
  }

  return { success: true };
}

/**
 * Validate filename with cross-platform compatibility
 * @param {string} filename - Original filename
 * @returns {object} - Validation result
 */
export function validateFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return { success: false, error: 'Invalid filename' };
  }

  // Check filename length
  if (filename.length > 255) {
    return { 
      success: false, 
      error: 'Filename too long (max 255 characters)' 
    };
  }

  // Check for dangerous characters (cross-platform)
  const dangerousChars = OSUtils.isWindows() 
    ? /[<>:"/\\|?*\u0000-\u001f]/
    : /[<>:"/\\|?*\u0000-\u001f\u0000]/;
    
  if (dangerousChars.test(filename)) {
    return { 
      success: false, 
      error: 'Filename contains invalid characters' 
    };
  }

  // Check for reserved names (Windows)
  if (OSUtils.isWindows()) {
    const reservedNames = [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];
    
    const nameWithoutExt = PathUtils.getBasename(filename);
    if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
      return { 
        success: false, 
        error: 'Filename uses reserved system name' 
      };
    }
  }

  // Check for files starting with dot (hidden files)
  if (filename.startsWith('.')) {
    return { 
      success: false, 
      error: 'Hidden files (starting with .) are not allowed' 
    };
  }

  // Check for double extensions (potential security risk)
  const ext = PathUtils.getExtension(filename);
  const executableExts = ['exe', 'bat', 'cmd', 'com', 'scr', 'pif', 'msi', 'sh', 'ps1'];
  if (executableExts.includes(ext)) {
    return { 
      success: false, 
      error: 'Executable files are not allowed' 
    };
  }

  return { success: true };
}

/**
 * Sanitize filename for cross-platform compatibility
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed_file';
  }

  let sanitized = filename;

  // Replace dangerous characters with underscores
  sanitized = sanitized.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_');

  // Handle reserved names on Windows
  if (OSUtils.isWindows()) {
    const reservedNames = [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];
    
    const nameWithoutExt = PathUtils.getBasename(sanitized);
    const ext = PathUtils.getExtension(sanitized);
    
    if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
      sanitized = `file_${nameWithoutExt}${ext ? '.' + ext : ''}`;
    }
  }

  // Remove leading dots
  sanitized = sanitized.replace(/^\.+/, '');

  // Ensure filename is not empty
  if (!sanitized || sanitized.trim() === '') {
    sanitized = 'unnamed_file';
  }

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > 255) {
    const ext = PathUtils.getExtension(sanitized);
    const nameWithoutExt = PathUtils.getBasename(sanitized);
    const maxNameLength = 255 - (ext ? ext.length + 1 : 0);
    sanitized = nameWithoutExt.substring(0, maxNameLength) + (ext ? '.' + ext : '');
  }

  return sanitized;
}

/**
 * Generate safe upload path
 * @param {string} originalName - Original filename
 * @param {string} uploadDir - Upload directory
 * @returns {string} - Safe upload path
 */
export function generateSafeUploadPath(originalName, uploadDir = 'uploads') {
  const sanitizedName = sanitizeFilename(originalName);
  const timestamp = Date.now();
  const uniqueName = `${timestamp}_${sanitizedName}`;
  
  return PathUtils.createSafeFilePath(uniqueName, uploadDir);
}

/**
 * Check if file extension is allowed
 * @param {string} filename - Filename to check
 * @param {array} allowedExtensions - Array of allowed extensions
 * @returns {boolean} - True if allowed
 */
export function isExtensionAllowed(filename, allowedExtensions = []) {
  const ext = PathUtils.getExtension(filename);
  return allowedExtensions.length === 0 || allowedExtensions.includes(ext);
}

/**
 * Get MIME type from filename
 * @param {string} filename - Filename
 * @returns {string} - MIME type
 */
export function getMimeTypeFromFilename(filename) {
  const ext = PathUtils.getExtension(filename);
  
  const mimeTypes = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Text
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'md': 'text/markdown',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'aac': 'audio/aac',
    'm4a': 'audio/mp4',
    
    // Video
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'mov': 'video/quicktime'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Validate file path for security
 * @param {string} filePath - File path to validate
 * @returns {object} - Validation result
 */
export function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return { success: false, error: 'Invalid file path' };
  }

  // Normalize path
  const normalized = PathUtils.normalize(filePath);

  // Check for path traversal attempts
  if (normalized.includes('..') || normalized.includes('~')) {
    return { 
      success: false, 
      error: 'Path traversal not allowed' 
    };
  }

  // Check for absolute paths outside allowed directories
  if (PathUtils.isAbsolute(normalized)) {
    const allowedDirs = ['uploads', 'temp', 'build'];
    const isAllowed = allowedDirs.some(dir => 
      normalized.includes(PathUtils.normalize(dir))
    );
    
    if (!isAllowed) {
      return { 
        success: false, 
        error: 'Absolute paths outside allowed directories not permitted' 
      };
    }
  }

  return { success: true };
}