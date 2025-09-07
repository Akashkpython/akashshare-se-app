// File signature validation utility for enhanced security
// This prevents malicious files from being uploaded by checking file headers

const fileSignatures = {
  // Image formats
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/bmp': [0x42, 0x4D],
  'image/tiff': [0x49, 0x49, 0x2A, 0x00],
  
  // Document formats
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'text/plain': null, // Text files don't have reliable signatures
  
  // Microsoft Office formats
  'application/msword': [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04],
  'application/vnd.ms-excel': [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [0x50, 0x4B, 0x03, 0x04],
  
  // Archive formats
  'application/zip': [0x50, 0x4B, 0x03, 0x04],
  'application/x-rar-compressed': [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00],
  
  // Audio/Video formats
  'audio/mpeg': [0xFF, 0xFB],
  'audio/wav': [0x52, 0x49, 0x46, 0x46],
  'video/mp4': [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
  'video/avi': [0x52, 0x49, 0x46, 0x46]
};

/**
 * Validates file signature against expected MIME type
 * @param {Buffer} buffer - File buffer to check
 * @param {string} mimetype - Expected MIME type
 * @returns {boolean} - True if signature matches or no signature required
 */
export function validateFileSignature(buffer, mimetype) {
  const signature = fileSignatures[mimetype];
  
  // If no signature defined (like text files), allow it
  if (!signature) {
    return true;
  }
  
  // Check if buffer is large enough
  if (buffer.length < signature.length) {
    return false;
  }
  
  // Compare signature bytes
  return signature.every((byte, index) => buffer[index] === byte);
}

/**
 * Enhanced file validation combining MIME type and signature checks
 * @param {Object} file - Multer file object
 * @returns {Object} - Validation result with success and error message
 */
export function validateFile(file) {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
    'application/pdf', 'text/plain',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-rar-compressed',
    'audio/mpeg', 'audio/wav', 'video/mp4', 'video/avi'
  ];
  
  // Check MIME type
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      success: false,
      error: `File type ${file.mimetype} is not allowed`
    };
  }
  
  // Check file signature if buffer is available
  if (file.buffer) {
    if (!validateFileSignature(file.buffer, file.mimetype)) {
      return {
        success: false,
        error: `File signature does not match declared type ${file.mimetype}`
      };
    }
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      success: false,
      error: `File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`
    };
  }
  
  return {
    success: true,
    error: null
  };
}

/**
 * Sanitize filename to prevent path traversal attacks
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename) {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\./, '_')
    .substring(0, 255); // Limit filename length
}
