/**
 * Ultra-Powerful Backend Performance System
 * Advanced performance monitoring, optimization, and analytics
 */

import { performance } from 'perf_hooks';
import os from 'os';
import fs from 'fs/promises';

class BackendPerformanceManager {
  constructor() {
    this.metrics = new Map();
    this.memorySnapshots = [];
    this.performanceEntries = [];
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
    this.maxMemorySnapshots = 100;
    this.maxPerformanceEntries = 1000;
    
    this.initializePerformanceMonitoring();
    this.startSystemMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  initializePerformanceMonitoring() {
    // Monitor process events
    process.on('exit', () => {
      this.generateFinalReport();
    });

    // Monitor uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.recordError('uncaughtException', error);
    });

    // Monitor unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.recordError('unhandledRejection', reason);
    });
  }

  /**
   * Start timing a performance metric
   * @param {string} name - Unique identifier for the metric
   * @param {Object} metadata - Additional context data
   */
  start(name, metadata = {}) {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
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
    const endMemory = process.memoryUsage();
    const duration = endTime - metric.startTime;
    const memoryDelta = endMemory.heapUsed - metric.startMemory.heapUsed;
    
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
    return {
      ...process.memoryUsage(),
      system: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      }
    };
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
      cpuCount: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || 'Unknown',
      nodeVersion: process.version,
      pid: process.pid,
      memory: this.getMemoryUsage()
    };
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
   * Start automatic system monitoring
   */
  startSystemMonitoring() {
    if (!this.isEnabled) return;
    
    // Take memory snapshot every 30 seconds
    setInterval(() => {
      this.takeMemorySnapshot('auto');
    }, 30000);

    // Monitor system resources every minute
    setInterval(() => {
      this.monitorSystemResources();
    }, 60000);
  }

  /**
   * Monitor system resources
   */
  monitorSystemResources() {
    const systemInfo = this.getSystemInfo();
    const memoryUsage = systemInfo.memory;
    
    // Check for high memory usage
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      console.warn(`⚠️ High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
      this.triggerGarbageCollection();
    }
    
    // Check for high CPU load
    const loadAverage = systemInfo.loadAverage[0];
    if (loadAverage > systemInfo.cpuCount * 0.8) {
      console.warn(`⚠️ High CPU load: ${loadAverage.toFixed(2)}`);
    }
    
    // Log system status
    console.log(`📊 System Status: Memory ${memoryUsagePercent.toFixed(1)}%, CPU Load ${loadAverage.toFixed(2)}`);
  }

  /**
   * Trigger garbage collection if available
   */
  triggerGarbageCollection() {
    if (global.gc) {
      console.log('🧹 Triggering garbage collection...');
      global.gc();
    } else {
      console.log('⚠️ Garbage collection not available. Start with --expose-gc flag.');
    }
  }

  /**
   * Record error with performance context
   */
  recordError(type, error) {
    const errorEntry = {
      type,
      message: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      memory: this.getMemoryUsage(),
      activeMetrics: Array.from(this.metrics.keys())
    };
    
    console.error(`🚨 Error [${type}]:`, errorEntry);
    
    // Store error for analysis
    this.addPerformanceEntry({
      name: `error-${type}`,
      duration: 0,
      memoryDelta: 0,
      metadata: errorEntry,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Create performance middleware for Express
   */
  createPerformanceMiddleware() {
    return (req, res, next) => {
      const startTime = performance.now();
      const startMemory = process.memoryUsage();
      
      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = function(...args) {
        const endTime = performance.now();
        const endMemory = process.memoryUsage();
        const duration = endTime - startTime;
        const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
        
        // Log performance
        console.log(`📊 ${req.method} ${req.path} - ${duration.toFixed(2)}ms (${Math.round(memoryDelta/1024)}KB)`);
        
        // Store performance data
        if (this.isEnabled) {
          this.addPerformanceEntry({
            name: `http-${req.method}-${req.path}`,
            duration: Math.round(duration * 100) / 100,
            memoryDelta: Math.round(memoryDelta / 1024),
            metadata: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              userAgent: req.get('User-Agent'),
              ip: req.ip
            },
            timestamp: new Date().toISOString()
          });
        }
        
        originalEnd.apply(this, args);
      };
      
      next();
    };
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
      currentMemory: this.getMemoryUsage(),
      systemInfo: this.getSystemInfo()
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
      })),
      systemInfo: this.getSystemInfo()
    };
  }

  /**
   * Generate final performance report
   */
  async generateFinalReport() {
    if (!this.isEnabled) return;
    
    const report = this.getDetailedReport();
    const reportPath = `./logs/performance-report-${Date.now()}.json`;
    
    try {
      await fs.mkdir('./logs', { recursive: true });
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`📊 Performance report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Failed to save performance report:', error);
    }
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
      systemInfo: this.getSystemInfo(),
      exportTime: new Date().toISOString()
    };
  }
}

// Create singleton instance
const backendPerformanceManager = new BackendPerformanceManager();

// Export both the instance and the class
export default backendPerformanceManager;
export { BackendPerformanceManager };
