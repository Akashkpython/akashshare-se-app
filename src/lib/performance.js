// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isActive = process.env.NODE_ENV === 'development';
  }

  // Start timing a metric
  start(name) {
    if (!this.isActive) return;
    
    this.metrics.set(name, {
      start: performance.now(),
      end: null,
      duration: null
    });
  }

  // End timing a metric
  end(name) {
    if (!this.isActive) return;
    
    const metric = this.metrics.get(name);
    if (metric) {
      metric.end = performance.now();
      metric.duration = metric.end - metric.start;
      
      // Log to console for development
      console.log(`⏱️ Performance: ${name} took ${metric.duration.toFixed(2)}ms`);
      
      // For significant durations, show a notification
      if (metric.duration > 1000) {
        console.warn(`⚠️ Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
      }
    }
  }

  // Measure a function execution
  measure(name, fn) {
    if (!this.isActive) return fn();
    
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
}

// Create a singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;