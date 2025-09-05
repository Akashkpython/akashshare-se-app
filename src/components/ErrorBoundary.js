import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
    
    // Bind methods to ensure proper context
    this.handleRetry = this.handleRetry.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  reportError(error, errorInfo) {
    // In a real app, you would send this to an error reporting service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };

    // For now, just log to console
    console.error('Error Report:', errorReport);
  }

  handleRetry() {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  }

  handleGoHome() {
    // Reset error state and navigate to home
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
    
    // Use window.location to ensure a clean reload
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 max-w-md w-full text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center"
            >
              <AlertTriangle className="w-10 h-10 text-foreground" />
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-foreground/70 mb-6">
                We encountered an unexpected error. Don&apos;t worry, we&apos;ve been notified and are working on a fix.
              </p>

              {/* Error ID for support */}
              {this.state.errorId && (
                <div className="mb-6 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-foreground/60 text-sm">Error ID:</p>
                  <p className="text-foreground font-mono text-sm">{this.state.errorId}</p>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <button
                onClick={this.handleRetry}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </button>
            </motion.div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-left"
              >
                <summary className="text-foreground/70 cursor-pointer hover:text-foreground transition-colors">
                  Show Error Details (Development)
                </summary>
                <div className="mt-3 p-3 bg-red-950/20 border border-red-500/20 rounded-lg">
                  <pre className="text-red-400 text-xs overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </motion.details>
            )}
          </motion.div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;