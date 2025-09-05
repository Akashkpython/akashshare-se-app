// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    // Enable in development and production for monitoring
    this.isActive = true; // Always active now for performance monitoring
    this.sampleRate = process.env.NODE_ENV === 'production' ? 0.1 : 1.0; // Sample 10% in production
  }

  // Start timing a metric
  start(name) {
    if (!this.isActive) return;
    
    // Sampling in production to reduce overhead
    if (process.env.NODE_ENV === 'production' && Math.random() > this.sampleRate) {
      return;
    }
    
    this.metrics.set(name, {
      start: performance.now(),
      end: null,
      duration: null
    });
  }

  // End timing a metric
  end(name) {
    if (!this.isActive) return;
    
    // Sampling in production to reduce overhead
    if (process.env.NODE_ENV === 'production' && Math.random() > this.sampleRate) {
      return;
    }
    
    const metric = this.metrics.get(name);
    if (metric) {
      metric.end = performance.now();
      metric.duration = metric.end - metric.start;
      
      // Log to console for development and significant durations in production
      if (process.env.NODE_ENV === 'development' || metric.duration > 1000) {
        console.log(`⏱️ Performance: ${name} took ${metric.duration.toFixed(2)}ms`);
      }
      
      // For significant durations, show a notification only in development
      if (process.env.NODE_ENV === 'development' && metric.duration > 1000) {
        console.warn(`⚠️ Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
      }
    }
  }

  // Measure a function execution
  measure(name, fn) {
    if (!this.isActive) return fn();
    
    // Sampling in production to reduce overhead
    if (process.env.NODE_ENV === 'production' && Math.random() > this.sampleRate) {
      return fn();
    }
    
    this.start(name);
    const result = fn();
    this.end(name);
    return result;
  }

  // Get all metrics
  getMetrics() {
    return Array.from(this.metrics.entries()).map(([name, data]) => ({
      name,
      ...data
    }));
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
  }
  
  // Get average duration for a metric
  getAverageDuration(name) {
    const metrics = Array.from(this.metrics.values()).filter(m => m.name === name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / metrics.length;
  }
}

// Create a singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;