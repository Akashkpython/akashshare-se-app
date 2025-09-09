// Memory monitoring and optimization utilities
import EventEmitter from 'events';

class MemoryMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.thresholds = {
      warning: options.warningThreshold || 100 * 1024 * 1024, // 100MB
      critical: options.criticalThreshold || 200 * 1024 * 1024, // 200MB
      maxHeap: options.maxHeap || 500 * 1024 * 1024 // 500MB
    };
    
    this.history = [];
    this.maxHistory = options.maxHistory || 100;
    this.monitoringInterval = null;
    this.intervalMs = options.intervalMs || 10000; // 10 seconds
    
    this.stats = {
      warnings: 0,
      criticals: 0,
      garbageCollections: 0,
      lastCleanup: null
    };
  }

  start() {
    if (this.monitoringInterval) {
      console.log('📊 Memory monitor already running');
      return;
    }

    console.log('📊 Starting memory monitor...');
    this.monitoringInterval = setInterval(() => {
      this.checkMemory();
    }, this.intervalMs);

    // Initial check
    this.checkMemory();
  }

  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('📊 Memory monitor stopped');
    }
  }

  checkMemory() {
    const usage = process.memoryUsage();
    const timestamp = new Date();
    
    const entry = {
      timestamp,
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers || 0
    };

    // Add to history
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Check thresholds
    this.evaluateThresholds(entry);

    // Emit monitoring event
    this.emit('memoryUpdate', entry);

    return entry;
  }

  evaluateThresholds(entry) {
    const heapUsed = entry.heapUsed;
    
    if (heapUsed > this.thresholds.critical) {
      this.stats.criticals++;
      console.warn(`🚨 CRITICAL: Memory usage is ${(heapUsed / 1024 / 1024).toFixed(2)}MB`);
      this.emit('criticalMemory', entry);
      this.triggerGarbageCollection();
    } else if (heapUsed > this.thresholds.warning) {
      this.stats.warnings++;
      console.warn(`⚠️ WARNING: Memory usage is ${(heapUsed / 1024 / 1024).toFixed(2)}MB`);
      this.emit('warningMemory', entry);
    }

    // Check if heap is approaching max
    if (entry.heapTotal > this.thresholds.maxHeap * 0.8) {
      console.warn(`⚠️ Heap approaching maximum capacity: ${(entry.heapTotal / 1024 / 1024).toFixed(2)}MB`);
      this.triggerGarbageCollection();
    }
  }

  triggerGarbageCollection() {
    if (global.gc) {
      try {
        console.log('🧹 Triggering garbage collection...');
        global.gc();
        this.stats.garbageCollections++;
        this.stats.lastCleanup = new Date();
        console.log('✅ Garbage collection completed');
      } catch (err) {
        console.warn('⚠️ Garbage collection failed:', err.message);
      }
    } else {
      console.warn('⚠️ Garbage collection not available. Run with --expose-gc flag.');
    }
  }

  getMemoryStats() {
    const current = this.checkMemory();
    const average = this.getAverageMemory();
    
    return {
      current: {
        rss: `${(current.rss / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(current.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(current.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        external: `${(current.external / 1024 / 1024).toFixed(2)}MB`,
        heapUtilization: `${((current.heapUsed / current.heapTotal) * 100).toFixed(1)}%`
      },
      average: average ? {
        heapUsed: `${(average.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapUtilization: `${((average.heapUsed / average.heapTotal) * 100).toFixed(1)}%`
      } : null,
      thresholds: {
        warning: `${(this.thresholds.warning / 1024 / 1024).toFixed(2)}MB`,
        critical: `${(this.thresholds.critical / 1024 / 1024).toFixed(2)}MB`,
        maxHeap: `${(this.thresholds.maxHeap / 1024 / 1024).toFixed(2)}MB`
      },
      stats: this.stats,
      historySize: this.history.length
    };
  }

  getAverageMemory() {
    if (this.history.length === 0) return null;
    
    const total = this.history.reduce((acc, entry) => ({
      heapUsed: acc.heapUsed + entry.heapUsed,
      heapTotal: acc.heapTotal + entry.heapTotal,
      rss: acc.rss + entry.rss
    }), { heapUsed: 0, heapTotal: 0, rss: 0 });

    const count = this.history.length;
    return {
      heapUsed: total.heapUsed / count,
      heapTotal: total.heapTotal / count,
      rss: total.rss / count
    };
  }

  getMemoryTrend() {
    if (this.history.length < 2) return null;
    
    const recent = this.history.slice(-10);
    const older = this.history.slice(-20, -10);
    
    if (older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.heapUsed, 0) / older.length;
    
    const trend = recentAvg - olderAvg;
    return {
      direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      magnitude: Math.abs(trend),
      percentage: ((trend / olderAvg) * 100).toFixed(2)
    };
  }

  // Cleanup old references and optimize memory
  cleanup() {
    // Clear old history entries
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
    
    // Trigger garbage collection if available
    this.triggerGarbageCollection();
    
    console.log('🧹 Memory monitor cleanup completed');
  }
}

// Singleton instance
const memoryMonitor = new MemoryMonitor({
  warningThreshold: 150 * 1024 * 1024, // 150MB
  criticalThreshold: 300 * 1024 * 1024, // 300MB
  maxHeap: 512 * 1024 * 1024, // 512MB
  intervalMs: 30000 // 30 seconds
});

export default memoryMonitor;
