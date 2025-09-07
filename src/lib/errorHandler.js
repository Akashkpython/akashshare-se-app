/**
 * Ultra-Powerful Error Handling System
 * Advanced error tracking, reporting, and recovery mechanisms
 */

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 1000;
    this.errorTypes = new Map();
    this.recoveryStrategies = new Map();
    this.isEnabled = true;
    
    this.initializeGlobalHandlers();
    this.setupRecoveryStrategies();
  }

  /**
   * Initialize global error handlers
   */
  initializeGlobalHandlers() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        type: 'unhandledRejection',
        promise: event.promise,
        reason: event.reason
      });
    });

    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        type: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError(new Error(`Resource loading failed: ${event.target.src || event.target.href}`), {
          type: 'resourceError',
          element: event.target.tagName,
          src: event.target.src || event.target.href
        });
      }
    }, true);
  }

  /**
   * Handle an error with advanced tracking and recovery
   * @param {Error} error - The error object
   * @param {Object} context - Additional context information
   */
  handleError(error, context = {}) {
    if (!this.isEnabled) return;

    const errorEntry = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      timestamp: new Date().toISOString(),
      context,
      severity: this.determineSeverity(error, context),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId()
    };

    // Store error
    this.addError(errorEntry);

    // Update error type statistics
    this.updateErrorTypeStats(errorEntry);

    // Attempt recovery
    this.attemptRecovery(errorEntry);

    // Log error
    this.logError(errorEntry);

    return errorEntry;
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add error to storage with size management
   */
  addError(errorEntry) {
    this.errors.push(errorEntry);
    
    // Maintain size limit
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  /**
   * Update error type statistics
   */
  updateErrorTypeStats(errorEntry) {
    const type = errorEntry.type;
    if (!this.errorTypes.has(type)) {
      this.errorTypes.set(type, {
        count: 0,
        firstSeen: errorEntry.timestamp,
        lastSeen: errorEntry.timestamp,
        severity: errorEntry.severity
      });
    }
    
    const stats = this.errorTypes.get(type);
    stats.count++;
    stats.lastSeen = errorEntry.timestamp;
  }

  /**
   * Determine error severity
   */
  determineSeverity(error, context) {
    // Critical errors
    if (context.type === 'unhandledRejection' || 
        error.message.includes('ChunkLoadError') ||
        error.message.includes('Loading chunk')) {
      return 'critical';
    }
    
    // High severity errors
    if (context.type === 'globalError' ||
        error.message.includes('Network') ||
        error.message.includes('fetch')) {
      return 'high';
    }
    
    // Medium severity errors
    if (context.type === 'resourceError' ||
        error.message.includes('WebSocket')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Setup recovery strategies
   */
  setupRecoveryStrategies() {
    // Chunk loading error recovery
    this.recoveryStrategies.set('ChunkLoadError', () => {
      console.log('🔄 Attempting to recover from chunk loading error...');
      window.location.reload();
    });

    // WebSocket connection recovery
    this.recoveryStrategies.set('WebSocket', () => {
      console.log('🔄 Attempting to recover WebSocket connection...');
      // Trigger reconnection in components that use WebSocket
      window.dispatchEvent(new CustomEvent('websocket-reconnect'));
    });

    // Network error recovery
    this.recoveryStrategies.set('Network', () => {
      console.log('🔄 Attempting to recover from network error...');
      // Show network status notification
      window.dispatchEvent(new CustomEvent('network-error', {
        detail: { message: 'Network connection lost. Attempting to reconnect...' }
      }));
    });
  }

  /**
   * Attempt error recovery
   */
  attemptRecovery(errorEntry) {
    const { context } = errorEntry;
    
    // Try specific recovery strategies
    for (const [errorType, strategy] of this.recoveryStrategies) {
      if (errorEntry.message.includes(errorType) || context.type === errorType) {
        try {
          strategy();
          errorEntry.recoveryAttempted = true;
          console.log(`✅ Recovery strategy executed for ${errorType}`);
        } catch (recoveryError) {
          console.error('❌ Recovery strategy failed:', recoveryError);
          errorEntry.recoveryFailed = true;
        }
        break;
      }
    }
  }

  /**
   * Log error with appropriate level
   */
  logError(errorEntry) {
    const logMessage = `🚨 Error [${errorEntry.severity.toUpperCase()}]: ${errorEntry.message}`;
    
    switch (errorEntry.severity) {
      case 'critical':
        console.error(logMessage, errorEntry);
        break;
      case 'high':
        console.error(logMessage, errorEntry);
        break;
      case 'medium':
        console.warn(logMessage, errorEntry);
        break;
      default:
        console.log(logMessage, errorEntry);
    }
  }

  /**
   * Get user ID for error tracking
   */
  getUserId() {
    // Try to get user ID from various sources
    return localStorage.getItem('userId') || 
           sessionStorage.getItem('userId') || 
           'anonymous';
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const totalErrors = this.errors.length;
    const errorTypes = Array.from(this.errorTypes.entries()).map(([type, stats]) => ({
      type,
      ...stats
    }));

    const severityCounts = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {});

    return {
      totalErrors,
      errorTypes,
      severityCounts,
      recentErrors: this.errors.slice(-10)
    };
  }

  /**
   * Get detailed error report
   */
  getDetailedReport() {
    return {
      stats: this.getErrorStats(),
      allErrors: this.errors,
      errorTypes: Object.fromEntries(this.errorTypes),
      recoveryStrategies: Array.from(this.recoveryStrategies.keys())
    };
  }

  /**
   * Clear all error data
   */
  clear() {
    this.errors = [];
    this.errorTypes.clear();
    console.log('🧹 Error data cleared');
  }

  /**
   * Export error data
   */
  export() {
    return {
      errors: this.errors,
      errorTypes: Object.fromEntries(this.errorTypes),
      stats: this.getErrorStats(),
      exportTime: new Date().toISOString()
    };
  }

  /**
   * Create error boundary wrapper for React components
   */
  createErrorBoundary(Component) {
    return class ErrorBoundaryWrapper extends window.React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      componentDidCatch(error, errorInfo) {
        errorHandler.handleError(error, {
          type: 'reactErrorBoundary',
          componentStack: errorInfo.componentStack,
          props: this.props
        });
      }

      render() {
        if (this.state.hasError) {
          return (
            <div className="error-boundary">
              <h2>Something went wrong</h2>
              <p>An error occurred while rendering this component.</p>
              <button onClick={() => this.setState({ hasError: false, error: null })}>
                Try Again
              </button>
            </div>
          );
        }

        return <Component {...this.props} />;
      }
    };
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export both the instance and the class
export default errorHandler;
export { ErrorHandler };
