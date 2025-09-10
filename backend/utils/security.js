/**
 * Ultra-Powerful Backend Security System
 * Advanced security utilities, validation, and protection mechanisms
 */

import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

class BackendSecurityManager {
  constructor() {
    this.securityPolicies = new Map();
    this.threatDetection = new Map();
    this.rateLimiters = new Map();
    this.encryptionKeys = new Map();
    
    this.initializeSecurityPolicies();
    this.setupThreatDetection();
    this.generateEncryptionKeys();
  }

  /**
   * Initialize security policies
   */
  initializeSecurityPolicies() {
    // XSS Protection
    this.securityPolicies.set('xss', {
      enabled: true,
      strictMode: process.env.NODE_ENV === 'production',
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
      stripScripts: true,
      escapeHtml: true
    });

    // SQL Injection Protection
    this.securityPolicies.set('sql', {
      enabled: true,
      parameterizedQueries: true,
      inputValidation: true,
      escapeSpecialChars: true
    });

    // File Upload Security
    this.securityPolicies.set('fileUpload', {
      enabled: true,
      maxFileSize: parseInt(process.env.FILE_SIZE_LIMIT) || 10 * 1024 * 1024,
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'text/csv',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
        'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
        'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac',
        'application/json', 'application/xml', 'application/javascript',
        'text/html', 'text/css', 'text/markdown', 'application/rtf'
      ],
      scanContent: true,
      quarantineSuspicious: true
    });

    // Rate Limiting
    this.securityPolicies.set('rateLimit', {
      enabled: true,
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    });
  }

  /**
   * Setup threat detection patterns
   */
  setupThreatDetection() {
    // XSS Patterns
    this.threatDetection.set('xss', [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<meta[^>]*>.*?<\/meta>/gi
    ]);

    // SQL Injection Patterns
    this.threatDetection.set('sql', [
      /('|(\\')|(;)|(--)|(\s+union\s+))/gi,
      /(\s+or\s+|\s+and\s+).*?=.*?/gi,
      /(\s+select\s+|\s+insert\s+|\s+update\s+|\s+delete\s+)/gi,
      /(\s+drop\s+|\s+create\s+|\s+alter\s+)/gi,
      /(\s+exec\s+|\s+execute\s+)/gi,
      /(\s+sp_|\s+xp_)/gi
    ]);

    // Path Traversal Patterns
    this.threatDetection.set('pathTraversal', [
      /\.\.\//g,
      /\.\.\\/g,
      /%2e%2e%2f/gi,
      /%2e%2e%5c/gi,
      /\.\.%2f/gi,
      /\.\.%5c/gi
    ]);

    // Command Injection Patterns
    this.threatDetection.set('commandInjection', [
      /[;&|`$()]/g,
      /(\s+cat\s+|\s+ls\s+|\s+dir\s+|\s+type\s+)/gi,
      /(\s+rm\s+|\s+del\s+|\s+remove\s+)/gi,
      /(\s+chmod\s+|\s+chown\s+)/gi
    ]);
  }

  /**
   * Generate encryption keys
   */
  generateEncryptionKeys() {
    // Generate session encryption key
    this.encryptionKeys.set('session', crypto.randomBytes(32));
    
    // Generate file encryption key
    this.encryptionKeys.set('file', crypto.randomBytes(32));
    
    // Generate API key encryption
    this.encryptionKeys.set('api', crypto.randomBytes(32));
  }

  /**
   * Sanitize input data
   * @param {string} input - Input to sanitize
   * @param {string} type - Type of sanitization
   * @param {Object} options - Additional options
   */
  sanitize(input, type = 'xss', options = {}) {
    if (typeof input !== 'string') {
      return input;
    }

    const policy = this.securityPolicies.get(type);
    if (!policy || !policy.enabled) {
      return input;
    }

    let sanitized = input;

    switch (type) {
      case 'xss':
        sanitized = this.sanitizeXSS(sanitized, { ...policy, ...options });
        break;
      case 'sql':
        sanitized = this.sanitizeSQL(sanitized, { ...policy, ...options });
        break;
      case 'pathTraversal':
        sanitized = this.sanitizePathTraversal(sanitized, options);
        break;
      default:
        sanitized = this.sanitizeGeneric(sanitized, options);
    }

    return sanitized;
  }

  /**
   * Sanitize against XSS attacks
   */
  sanitizeXSS(input, options = {}) {
    let sanitized = input;

    // Remove script tags and event handlers
    if (options.stripScripts) {
      sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
      sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
      sanitized = sanitized.replace(/<object[^>]*>.*?<\/object>/gi, '');
      sanitized = sanitized.replace(/<embed[^>]*>.*?<\/embed>/gi, '');
      sanitized = sanitized.replace(/<link[^>]*>.*?<\/link>/gi, '');
      sanitized = sanitized.replace(/<meta[^>]*>.*?<\/meta>/gi, '');
      sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    }

    // Remove javascript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/vbscript:/gi, '');
    sanitized = sanitized.replace(/data:/gi, '');

    // Escape HTML entities
    if (options.escapeHtml) {
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    return sanitized;
  }

  /**
   * Sanitize against SQL injection
   */
  sanitizeSQL(input, _options = {}) {
    let sanitized = input;

    // Escape quotes
    sanitized = sanitized.replace(/'/g, "''");
    sanitized = sanitized.replace(/"/g, '""');

    // Remove semicolons
    sanitized = sanitized.replace(/;/g, '');

    // Remove comments
    sanitized = sanitized.replace(/--/g, '');
    sanitized = sanitized.replace(/\/\*.*?\*\//g, '');

    // Remove SQL keywords
    const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'EXEC', 'EXECUTE'];
    sqlKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
  }

  /**
   * Sanitize path traversal attempts
   */
  sanitizePathTraversal(input, _options = {}) {
    let sanitized = input;

    // Remove path traversal attempts
    sanitized = sanitized.replace(/\.\.\//g, '');
    sanitized = sanitized.replace(/\.\.\\/g, '');
    sanitized = sanitized.replace(/\.\.%2f/gi, '');
    sanitized = sanitized.replace(/\.\.%5c/gi, '');
    sanitized = sanitized.replace(/[<>:"|?*]/g, '_');

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Limit length
    if (sanitized.length > 255) {
      const ext = sanitized.split('.').pop();
      const name = sanitized.substring(0, 255 - ext.length - 1);
      sanitized = `${name}.${ext}`;
    }

    return sanitized;
  }

  /**
   * Generic sanitization
   */
  sanitizeGeneric(input, _options = {}) {
    let sanitized = input;

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Remove control characters (excluding newlines and tabs)
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
  }

  /**
   * Validate input against security threats
   * @param {string} input - Input to validate
   * @param {string} type - Type of validation
   */
  validateSecurity(input, type = 'all') {
    const threats = [];
    
    if (type === 'all' || type === 'xss') {
      const xssThreats = this.detectXSS(input);
      threats.push(...xssThreats);
    }
    
    if (type === 'all' || type === 'sql') {
      const sqlThreats = this.detectSQLInjection(input);
      threats.push(...sqlThreats);
    }
    
    if (type === 'all' || type === 'pathTraversal') {
      const pathThreats = this.detectPathTraversal(input);
      threats.push(...pathThreats);
    }

    if (type === 'all' || type === 'commandInjection') {
      const commandThreats = this.detectCommandInjection(input);
      threats.push(...commandThreats);
    }

    return {
      isValid: threats.length === 0,
      threats,
      severity: this.calculateThreatSeverity(threats)
    };
  }

  /**
   * Detect XSS threats
   */
  detectXSS(input) {
    const threats = [];
    const patterns = this.threatDetection.get('xss') || [];

    patterns.forEach((pattern) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'xss',
          pattern: pattern.toString(),
          match: input.match(pattern),
          severity: 'high'
        });
      }
    });

    return threats;
  }

  /**
   * Detect SQL injection threats
   */
  detectSQLInjection(input) {
    const threats = [];
    const patterns = this.threatDetection.get('sql') || [];

    patterns.forEach((pattern) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'sql',
          pattern: pattern.toString(),
          match: input.match(pattern),
          severity: 'critical'
        });
      }
    });

    return threats;
  }

  /**
   * Detect path traversal threats
   */
  detectPathTraversal(input) {
    const threats = [];
    const patterns = this.threatDetection.get('pathTraversal') || [];

    patterns.forEach((pattern) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'pathTraversal',
          pattern: pattern.toString(),
          match: input.match(pattern),
          severity: 'high'
        });
      }
    });

    return threats;
  }

  /**
   * Detect command injection threats
   */
  detectCommandInjection(input) {
    const threats = [];
    const patterns = this.threatDetection.get('commandInjection') || [];

    patterns.forEach((pattern) => {
      if (pattern.test(input)) {
        threats.push({
          type: 'commandInjection',
          pattern: pattern.toString(),
          match: input.match(pattern),
          severity: 'critical'
        });
      }
    });

    return threats;
  }

  /**
   * Calculate threat severity
   */
  calculateThreatSeverity(threats) {
    if (threats.length === 0) return 'none';
    
    const severities = threats.map(t => t.severity);
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Generate secure random string
   * @param {number} length - Length of the string
   * @param {string} charset - Character set to use
   */
  generateSecureRandom(length = 32, charset = 'alphanumeric') {
    const charsets = {
      alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      numeric: '0123456789',
      alphabetic: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      hex: '0123456789ABCDEF',
      base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    };

    const chars = charsets[charset] || charsets.alphanumeric;
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
  }

  /**
   * Hash data securely
   * @param {string} data - Data to hash
   * @param {string} algorithm - Hash algorithm
   */
  hashData(data, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Encrypt data
   * @param {string} data - Data to encrypt
   * @param {string} keyType - Type of encryption key to use
   */
  encryptData(data, keyType = 'session') {
    const key = this.encryptionKeys.get(keyType);
    if (!key) {
      throw new Error(`Encryption key not found: ${keyType}`);
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  /**
   * Decrypt data
   * @param {string} encryptedData - Encrypted data
   * @param {string} iv - Initialization vector
   * @param {string} keyType - Type of encryption key to use
   */
  decryptData(encryptedData, iv, keyType = 'session') {
    const key = this.encryptionKeys.get(keyType);
    if (!key) {
      throw new Error(`Encryption key not found: ${keyType}`);
    }

    const decipher = crypto.createDecipher('aes-256-cbc', key);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Create rate limiter
   * @param {Object} options - Rate limiter options
   */
  createRateLimiter(options = {}) {
    const policy = this.securityPolicies.get('rateLimit');
    const {
      windowMs = policy.windowMs,
      max = policy.maxRequests,
      message = 'Too many requests from this IP, please try again later.',
      standardHeaders = true,
      legacyHeaders = false
    } = options;

    return rateLimit({
      windowMs,
      max,
      message: {
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      },
      standardHeaders,
      legacyHeaders,
      handler: (req, res) => {
        console.log(`🚫 Rate limit exceeded for IP: ${req.ip}, URL: ${req.url}`);
        res.status(429).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
    });
  }

  /**
   * Create security headers middleware
   */
  createSecurityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    });
  }

  /**
   * Validate file upload
   * @param {Object} file - File object from multer
   * @param {Object} options - Validation options
   */
  validateFileUpload(file, options = {}) {
    const policy = this.securityPolicies.get('fileUpload');
    const {
      maxSize = policy.maxFileSize,
      allowedMimeTypes = policy.allowedMimeTypes
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    // Check filename for security threats
    const filenameValidation = this.validateSecurity(file.originalname, 'pathTraversal');
    if (!filenameValidation.isValid) {
      errors.push('Filename contains potentially dangerous characters');
    }

    // Sanitize filename
    const sanitizedFilename = this.sanitizePathTraversal(file.originalname);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedFilename
    };
  }

  /**
   * Get security report
   */
  getSecurityReport() {
    return {
      policies: Object.fromEntries(this.securityPolicies),
      threatDetection: Array.from(this.threatDetection.keys()),
      encryptionKeys: Array.from(this.encryptionKeys.keys()),
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const backendSecurityManager = new BackendSecurityManager();

// Export both the instance and the class
export default backendSecurityManager;
export { BackendSecurityManager };