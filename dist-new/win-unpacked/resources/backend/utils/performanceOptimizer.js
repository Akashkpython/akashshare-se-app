/**
 * Performance optimization utilities for the backend
 * Includes caching, request optimization, and resource management
 */

import EventEmitter from 'events';

class PerformanceOptimizer extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Cache configuration
    this.cache = new Map();
    this.maxCacheSize = options.maxCacheSize || 1000;
    this.defaultCacheTTL = options.defaultCacheTTL || 5 * 60 * 1000; // 5 minutes
    
    // Request optimization
    this.requestBuffer = new Map();
    this.bufferTimeout = options.bufferTimeout || 100; // 100ms
    
    // Resource monitoring
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      requestsBuffered: 0,
      memoryCleanups: 0
    };
    
    // Cleanup interval
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  /**
   * Get cached value
   */
  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      this.metrics.cacheMisses++;
      return null;
    }
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }
    
    this.metrics.cacheHits++;
    return cached.value;
  }

  /**
   * Set cached value
   */
  setCache(key, value, ttl = this.defaultCacheTTL) {
    // Prevent cache overflow
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldestCache();
    }
    
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
      created: Date.now()
    });
  }

  /**
   * Evict oldest cache entries
   */
  evictOldestCache() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].created - b[1].created);
    
    // Remove oldest 10%
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Buffer similar requests to reduce load
   */
  bufferRequest(key, fn) {
    const existing = this.requestBuffer.get(key);
    if (existing) {
      this.metrics.requestsBuffered++;
      return existing.promise;
    }
    
    const promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(async () => {
        this.requestBuffer.delete(key);
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, this.bufferTimeout);
      
      this.requestBuffer.set(key, { promise, timeout });
    });
    
    return promise;
  }

  /**
   * Memoization decorator for expensive functions
   */
  memoize(fn, keyGenerator, ttl) {
    return (...args) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const cacheKey = `memoize_${fn.name}_${key}`;
      
      let cached = this.getCache(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      const result = fn(...args);
      this.setCache(cacheKey, result, ttl);
      return result;
    };
  }

  /**
   * Async memoization decorator
   */
  memoizeAsync(fn, keyGenerator, ttl) {
    return async (...args) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const cacheKey = `memoize_async_${fn.name}_${key}`;
      
      let cached = this.getCache(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      const result = await fn(...args);
      this.setCache(cacheKey, result, ttl);
      return result;
    };
  }

  /**
   * Debounce function execution
   */
  debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle function execution
   */
  throttle(fn, limit) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Batch process array with size limit
   */
  async batchProcess(items, processor, batchSize = 10, delay = 0) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
      
      // Optional delay between batches
      if (delay > 0 && i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }

  /**
   * Memory-efficient JSON parsing with size limit
   */
  safeJsonParse(str, maxSize = 1024 * 1024) { // 1MB default
    if (str.length > maxSize) {
      throw new Error(`JSON string too large: ${str.length} bytes`);
    }
    
    try {
      return JSON.parse(str);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }

  /**
   * Cleanup expired cache and buffers
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    // Clean expired cache
    for (const [key, cached] of this.cache) {
      if (now > cached.expires) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    // Clean expired request buffers
    for (const [key, buffer] of this.requestBuffer) {
      clearTimeout(buffer.timeout);
      this.requestBuffer.delete(key);
    }
    
    if (cleaned > 0) {
      this.metrics.memoryCleanups++;
      this.emit('cleanup', { cleaned, cacheSize: this.cache.size });
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const cacheTotal = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate = cacheTotal > 0 ? (this.metrics.cacheHits / cacheTotal) * 100 : 0;
    
    return {
      ...this.metrics,
      cacheHitRate: cacheHitRate.toFixed(2) + '%',
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      bufferSize: this.requestBuffer.size
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      requestsBuffered: 0,
      memoryCleanups: 0
    };
  }

  /**
   * Express middleware for response caching
   */
  cacheMiddleware(ttl = this.defaultCacheTTL) {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }
      
      const cacheKey = `http_${req.originalUrl}`;
      const cached = this.getCache(cacheKey);
      
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        this.setCache(cacheKey, data, ttl);
        res.set('X-Cache', 'MISS');
        return originalJson(data);
      };
      
      next();
    };
  }
}

export default PerformanceOptimizer;
