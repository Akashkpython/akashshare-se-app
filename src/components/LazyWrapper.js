import React, { Suspense, useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';

// Higher-order component for lazy loading with error handling
const LazyWrapper = ({ children, fallback = null, timeout = 10000 }) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Set up timeout for lazy loading
    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, retryCount]);

  const handleRetry = () => {
    setHasTimedOut(false);
    setRetryCount(prev => prev + 1);
    // Force re-render to retry lazy loading
    window.location.reload();
  };

  const LoadingFallback = ({ error, retry, timedOut }) => {
    if (fallback) {
      return fallback({ error, retry, timedOut });
    }

    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-akash-400/30 border-t-akash-400 rounded-full animate-spin" />
          <p className="text-foreground/70 text-sm">Loading...</p>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <Suspense 
        fallback={
          <LoadingFallback 
            timedOut={hasTimedOut}
            retry={handleRetry}
          />
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyWrapper;