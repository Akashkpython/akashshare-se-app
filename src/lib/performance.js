/**
 * Ultra-Powerful Performance Monitoring System
 * Advanced performance tracking with memory optimization and analytics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.memorySnapshots = [];
    this.performanceEntries = [];
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true';
    this.maxMemorySnapshots = 100;
    this.maxPerformanceEntries = 1000;
    
    // Initialize performance monitoring
    this.initializePerformanceObserver();
    this.startMemoryMonitoring();
  }

  /**
   * Start timing a performance metric
   * @param {string} name - Unique identifier for the metric
   * @param {Object} metadata - Additional context data
   */
  start(name, metadata = {}) {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    this.metrics.set(name, {
      startTime,
      startMemory,
      metadata,
      status: 'running'
    });
    
    console.log(`🚀 Performance: Started ${name}`, metadata);
  }

  /**
   * End timing a performance metric
   * @param {string} name - Unique identifier for the metric
   * @param {Object} additionalData - Additional data to record
   */
  end(name, additionalData = {}) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ Performance: No metric found for ${name}`);
      return;
    }
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    const duration = endTime - metric.startTime;
    const memoryDelta = endMemory.usedJSHeapSize - metric.startMemory.usedJSHeapSize;
    
    const result = {
      name,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      memoryDelta: Math.round(memoryDelta / 1024), // Convert to KB
      startMemory: metric.startMemory,
      endMemory,
      metadata: { ...metric.metadata, ...additionalData },
      timestamp: new Date().toISOString()
    };
    
    // Store performance entry
    this.addPerformanceEntry(result);
    
    // Log performance result
    const memoryInfo = memoryDelta > 0 ? ` (+${result.memoryDelta}KB)` : ` (${result.memoryDelta}KB)`;
    console.log(`✅ Performance: ${name} completed in ${result.duration}ms${memoryInfo}`);
    
    // Clean up
    this.metrics.delete(name);
    
    return result;
  }

  /**
   * Measure function execution time
   * @param {Function} fn - Function to measure
   * @param {string} name - Name for the measurement
   * @param {Object} context - Context data
   */
  async measure(fn, name, context = {}) {
    this.start(name, context);
    try {
      const result = await fn();
      this.end(name, { success: true });
      return result;
    } catch (error) {
      this.end(name, { success: false, error: error.message });
      throw error;
    }
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 };
  }

  /**
   * Add performance entry with automatic cleanup
   */
  addPerformanceEntry(entry) {
    this.performanceEntries.push(entry);
    
    // Maintain size limit
    if (this.performanceEntries.length > this.maxPerformanceEntries) {
      this.performanceEntries = this.performanceEntries.slice(-this.maxPerformanceEntries);
    }
  }

  /**
   * Take memory snapshot
   */
  takeMemorySnapshot(label = 'manual') {
    const snapshot = {
      label,
      memory: this.getMemoryUsage(),
      timestamp: new Date().toISOString(),
      activeMetrics: Array.from(this.metrics.keys())
    };
    
    this.memorySnapshots.push(snapshot);
    
    // Maintain size limit
    if (this.memorySnapshots.length > this.maxMemorySnapshots) {
      this.memorySnapshots = this.memorySnapshots.slice(-this.maxMemorySnapshots);
    }
    
    return snapshot;
  }

  /**
   * Start automatic memory monitoring
   */
  startMemoryMonitoring() {
    if (!this.isEnabled) return;
    
    // Take snapshot every 30 seconds
    setInterval(() => {
      this.takeMemorySnapshot('auto');
    }, 30000);
  }

  /**
   * Initialize Performance Observer for automatic metrics
   */
  initializePerformanceObserver() {
    if (!this.isEnabled || !window.PerformanceObserver) return;
    
    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.addPerformanceEntry({
            name: `navigation-${entry.name}`,
            duration: entry.duration,
            memoryDelta: 0,
            metadata: { type: 'navigation', entryType: entry.entryType },
            timestamp: new Date().toISOString()
          });
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 100) { // Only log slow resources
            this.addPerformanceEntry({
              name: `resource-${entry.name.split('/').pop()}`,
              duration: entry.duration,
              memoryDelta: 0,
              metadata: { 
                type: 'resource', 
                entryType: entry.entryType,
                size: entry.transferSize,
                url: entry.name
              },
              timestamp: new Date().toISOString()
            });
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

    } catch (error) {
      console.warn('Performance Observer initialization failed:', error);
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const recentEntries = this.performanceEntries.slice(-50);
    const avgDuration = recentEntries.reduce((sum, entry) => sum + entry.duration, 0) / recentEntries.length;
    const slowEntries = recentEntries.filter(entry => entry.duration > 100);
    
    return {
      totalEntries: this.performanceEntries.length,
      recentEntries: recentEntries.length,
      averageDuration: Math.round(avgDuration * 100) / 100,
      slowOperations: slowEntries.length,
      memorySnapshots: this.memorySnapshots.length,
      activeMetrics: Array.from(this.metrics.keys()),
      currentMemory: this.getMemoryUsage()
    };
  }

  /**
   * Get detailed performance report
   */
  getDetailedReport() {
    return {
      summary: this.getSummary(),
      recentPerformance: this.performanceEntries.slice(-20),
      memoryHistory: this.memorySnapshots.slice(-10),
      activeMetrics: Array.from(this.metrics.entries()).map(([name, data]) => ({
        name,
        runningTime: performance.now() - data.startTime,
        metadata: data.metadata
      }))
    };
  }

  /**
   * Clear all performance data
   */
  clear() {
    this.metrics.clear();
    this.memorySnapshots = [];
    this.performanceEntries = [];
    console.log('🧹 Performance data cleared');
  }

  /**
   * Export performance data
   */
  export() {
    return {
      performanceEntries: this.performanceEntries,
      memorySnapshots: this.memorySnapshots,
      summary: this.getSummary(),
      exportTime: new Date().toISOString()
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export both the instance and the class
export default performanceMonitor;
export { PerformanceMonitor };