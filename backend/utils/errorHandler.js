// Comprehensive error handling utility for the backend
// Provides consistent error logging, monitoring, and response formatting

import fs from 'fs';
import path from 'path';

/**
 * Enhanced error logger with structured logging
 * @param {Error} error - The error object
 * @param {Object} context - Additional context information
 */
export function logError(error, context = {}) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    context
  };

  // Console logging with colors
  console.error(`🚨 [ERROR ${timestamp}] ${error.message}`);
  if (context.userId) console.error(`   👤 User: ${context.userId}`);
  if (context.ip) console.error(`   🌐 IP: ${context.ip}`);
  if (context.endpoint) console.error(`   📍 Endpoint: ${context.endpoint}`);
  if (context.fileOperation) console.error(`   📁 File Op: ${context.fileOperation}`);
  
  // Log stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`   📚 Stack: ${error.stack}`);
  }

  // TODO: In production, you might want to send to external logging service
  // Example: sendToLoggingService(errorInfo);
}

/**
 * Handle async errors with proper cleanup
 * @param {Function} asyncFn - Async function to wrap
 * @param {Object} context - Error context
 */
export function asyncErrorHandler(asyncFn, context = {}) {
  return async (req, res, next) => {
    try {
      await asyncFn(req, res, next);
    } catch (error) {
      logError(error, {
        ...context,
        ip: req.ip,
        endpoint: `${req.method} ${req.path}`,
        userAgent: req.get('User-Agent')
      });
      
      // Clean up any resources if needed
      if (req.file && req.file.path) {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log(`🧹 Cleaned up file: ${req.file.path}`);
          }
        } catch (cleanupError) {
          console.error(`❌ Failed to cleanup file: ${cleanupError.message}`);
        }
      }
      
      next(error);
    }
  };
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function globalErrorHandler(err, req, res, next) {
  logError(err, {
    ip: req.ip,
    endpoint: `${req.method} ${req.path}`,
    userAgent: req.get('User-Agent'),
    body: req.body
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let statusCode = 500;
  let message = 'Internal server error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (err.message && err.message.includes('File type')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message && err.message.includes('Rate limit')) {
    statusCode = 429;
    message = 'Rate limit exceeded';
  } else if (isDevelopment) {
    message = err.message;
  }

  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && { stack: err.stack, details: err })
  });
}

/**
 * Handle unhandled promise rejections
 */
export function setupGlobalErrorHandlers() {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise);
    console.error('🚨 Reason:', reason);
    logError(new Error(`Unhandled Rejection: ${reason}`), {
      type: 'unhandledRejection',
      promise: promise.toString()
    });
  });

  process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    logError(error, {
      type: 'uncaughtException'
    });
    
    // Graceful shutdown
    process.exit(1);
  });
}

/**
 * Validate environment variables with detailed error reporting
 * @param {Array} requiredVars - Array of required environment variable names
 */
export function validateEnvironment(requiredVars) {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    logError(error, {
      type: 'environmentValidation',
      missing,
      available: Object.keys(process.env).filter(key => requiredVars.includes(key))
    });
    throw error;
  }
  
  console.log('✅ Environment validation passed');
}
