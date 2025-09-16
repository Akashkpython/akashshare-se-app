/**
 * Ultra-Powerful Security System
 * Advanced security utilities, validation, and protection mechanisms
 */

class SecurityManager {
  constructor() {
    this.sanitizationRules = new Map();
    this.validationSchemas = new Map();
    this.securityPolicies = new Map();
    this.threatDetection = new Map();
    
    this.initializeSecurityRules();
    this.setupThreatDetection();
  }

  /**
   * Initialize security rules and policies
   */
  initializeSecurityRules() {
    // XSS Protection Rules
    this.sanitizationRules.set('xss', {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
      allowedAttributes: {},
      stripTags: true,
      escapeHtml: true
    });

    // SQL Injection Protection
    this.sanitizationRules.set('sql', {
      escapeQuotes: true,
      escapeSemicolons: true,
      removeComments: true
    });

    // File Upload Security
    this.sanitizationRules.set('file', {
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx'],
      maxSize: 10 * 1024 * 1024, // 10MB
      scanContent: true,
      quarantineSuspicious: true
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
      /<embed[^>]*>.*?<\/embed>/gi
    ]);

    // SQL Injection Patterns
    this.threatDetection.set('sql', [
      /('|(\\')|(;)|(--)|(\s+union\s+))/gi,
      /(\s+or\s+|\s+and\s+).*?=.*?/gi,
      /(\s+select\s+|\s+insert\s+|\s+update\s+|\s+delete\s+)/gi,
      /(\s+drop\s+|\s+create\s+|\s+alter\s+)/gi
    ]);

    // Path Traversal Patterns
    this.threatDetection.set('pathTraversal', [
      /\.\.\//g,
      /\.\.\\/g,
      /%2e%2e%2f/gi,
      /%2e%2e%5c/gi
    ]);
  }

  /**
   * Sanitize input data
   * @param {string} input - Input to sanitize
   * @param {string} type - Type of sanitization to apply
   * @param {Object} options - Additional options
   */
  sanitize(input, type = 'xss', options = {}) {
    if (typeof input !== 'string') {
      return input;
    }

    const rules = this.sanitizationRules.get(type) || {};
    let sanitized = input;

    switch (type) {
      case 'xss':
        sanitized = this.sanitizeXSS(sanitized, { ...rules, ...options });
        break;
      case 'sql':
        sanitized = this.sanitizeSQL(sanitized, { ...rules, ...options });
        break;
      case 'file':
        sanitized = this.sanitizeFilename(sanitized, { ...rules, ...options });
        break;
      default:
        sanitized = this.sanitizeGeneric(sanitized, options);
    }

    return sanitized;
  }

  /**
   * Sanitize against XSS attacks
   */
  sanitizeXSS(input, _options = {}) {
    let sanitized = input;

    // Remove script tags and event handlers
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    sanitized = sanitized.replace(/<object[^>]*>.*?<\/object>/gi, '');
    sanitized = sanitized.replace(/<embed[^>]*>.*?<\/embed>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove javascript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Escape HTML entities
    if (_options.escapeHtml) {
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
    if (_options.escapeQuotes) {
      sanitized = sanitized.replace(/'/g, "''");
      sanitized = sanitized.replace(/"/g, '""');
    }

    // Remove semicolons
    if (_options.escapeSemicolons) {
      sanitized = sanitized.replace(/;/g, '');
    }

    // Remove comments
    if (_options.removeComments) {
      sanitized = sanitized.replace(/--/g, '');
      sanitized = sanitized.replace(/\/\*.*?\*\//g, '');
    }

    return sanitized;
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(input, _options = {}) {
    let sanitized = input;

    // Remove path traversal attempts
    sanitized = sanitized.replace(/\.\.\//g, '');
    sanitized = sanitized.replace(/\.\.\\/g, '');
    sanitized = sanitized.replace(/[<>:"|?*]/g, '_');

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

    // Remove control characters (except newlines and tabs)
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

    patterns.forEach((pattern, _index) => {
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

    patterns.forEach((pattern, _index) => {
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

    patterns.forEach((pattern, _index) => {
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
    
    // Use crypto.getRandomValues if available
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      // Fallback to Math.random
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    return result;
  }

  /**
   * Hash data securely
   * @param {string} data - Data to hash
   * @param {string} algorithm - Hash algorithm
   */
  async hashData(data, algorithm = 'SHA-256') {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API not available');
    }

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest(algorithm, dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }

  /**
   * Validate file upload
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   */
  validateFileUpload(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt']
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file extension
    const extension = `.${file.name.split('.').pop().toLowerCase()}`;
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} is not allowed`);
    }

    // Check filename for security threats
    const filenameValidation = this.validateSecurity(file.name, 'pathTraversal');
    if (!filenameValidation.isValid) {
      errors.push('Filename contains potentially dangerous characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedFilename: this.sanitizeFilename(file.name)
    };
  }

  /**
   * Create Content Security Policy
   */
  createCSP(options = {}) {
    const {
      allowInline = false,
      allowEval = false,
      allowDataUrls = false,
      allowedDomains = []
    } = options;

    const directives = {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'"],
      'img-src': ["'self'"],
      'connect-src': ["'self'", ...allowedDomains, ...allowedDomains.map(domain => `ws://${domain}`), ...allowedDomains.map(domain => `wss://${domain}`)],
      'font-src': ["'self'"],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': ["'none'"],
      'worker-src': ["'self'"],
      'manifest-src': ["'self'"]
    };

    if (allowInline) {
      directives['script-src'].push("'unsafe-inline'");
      directives['style-src'].push("'unsafe-inline'");
    }

    if (allowEval) {
      directives['script-src'].push("'unsafe-eval'");
    }

    if (allowDataUrls) {
      directives['img-src'].push('data:');
      directives['style-src'].push('data:');
    }

    return Object.entries(directives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ');
  }

  /**
   * Get security report
   */
  getSecurityReport() {
    return {
      sanitizationRules: Array.from(this.sanitizationRules.keys()),
      threatDetection: Array.from(this.threatDetection.keys()),
      securityPolicies: Array.from(this.securityPolicies.keys()),
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const securityManager = new SecurityManager();

// Export both the instance and the class
export default securityManager;
export { SecurityManager };
