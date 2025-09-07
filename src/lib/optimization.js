/**
 * Ultra-Powerful Optimization System
 * Advanced performance optimization, caching, and resource management
 */

class OptimizationManager {
  constructor() {
    this.cache = new Map();
    this.memoryCache = new Map();
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
    this.observers = new Map();
    this.lazyLoaders = new Set();
    
    this.cacheConfig = {
      maxSize: 1000,
      ttl: 5 * 60 * 1000, // 5 minutes
      maxMemorySize: 50 * 1024 * 1024 // 50MB
    };
    
    this.initializeOptimizations();
  }

  /**
   * Initialize optimization systems
   */
  initializeOptimizations() {
    this.setupIntersectionObserver();
    this.setupMemoryManagement();
    this.setupCacheCleanup();
    this.setupPerformanceOptimizations();
  }

  /**
   * Advanced caching system with TTL and memory management
   * @param {string} key - Cache key
   * @param {Function} fetcher - Function to fetch data if not cached
   * @param {Object} options - Cache options
   */
  async cache(key, fetcher, options = {}) {
    const {
      ttl = this.cacheConfig.ttl,
      maxAge = ttl,
      forceRefresh = false,
      memoryOnly = false
    } = options;

    // Check if we should force refresh
    if (forceRefresh) {
      this.cache.delete(key);
      this.memoryCache.delete(key);
    }

    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key);
      if (Date.now() - cached.timestamp < maxAge) {
        return cached.data;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // Check disk cache
    if (!memoryOnly && this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < maxAge) {
        // Promote to memory cache
        this.memoryCache.set(key, cached);
        return cached.data;
      } else {
        this.cache.delete(key);
      }
    }

    // Fetch new data
    try {
      const data = await fetcher();
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        ttl: maxAge
      };

      // Store in appropriate cache
      if (memoryOnly) {
        this.memoryCache.set(key, cacheEntry);
      } else {
        this.cache.set(key, cacheEntry);
      }

      return data;
    } catch (error) {
      console.error('Cache fetch error:', error);
      throw error;
    }
  }

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @param {string} key - Unique key for the debounced function
   */
  debounce(func, delay, key = null) {
    const debounceKey = key || func.name || 'anonymous';
    
    return (...args) => {
      if (this.debounceTimers.has(debounceKey)) {
        clearTimeout(this.debounceTimers.get(debounceKey));
      }
      
      const timer = setTimeout(() => {
        func.apply(this, args);
        this.debounceTimers.delete(debounceKey);
      }, delay);
      
      this.debounceTimers.set(debounceKey, timer);
    };
  }

  /**
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @param {string} key - Unique key for the throttled function
   */
  throttle(func, limit, key = null) {
    const throttleKey = key || func.name || 'anonymous';
    
    return (...args) => {
      if (!this.throttleTimers.has(throttleKey)) {
        func.apply(this, args);
        this.throttleTimers.set(throttleKey, Date.now());
      } else {
        const lastCall = this.throttleTimers.get(throttleKey);
        if (Date.now() - lastCall >= limit) {
          func.apply(this, args);
          this.throttleTimers.set(throttleKey, Date.now());
        }
      }
    };
  }

  /**
   * Lazy load images with intersection observer
   * @param {string} selector - CSS selector for images
   * @param {Object} options - Lazy loading options
   */
  lazyLoadImages(selector = 'img[data-src]', options = {}) {
    const {
      rootMargin = '50px',
      threshold = 0.1,
      placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4='
    } = options;

    const images = document.querySelectorAll(selector);
    
    if (!images.length) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          
          if (src) {
            // Add loading state
            img.classList.add('loading');
            
            // Create new image to preload
            const newImg = new Image();
            newImg.onload = () => {
              img.src = src;
              img.classList.remove('loading');
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            };
            newImg.onerror = () => {
              img.classList.remove('loading');
              img.classList.add('error');
              imageObserver.unobserve(img);
            };
            newImg.src = src;
          }
        }
      });
    }, {
      rootMargin,
      threshold
    });

    images.forEach(img => {
      // Set placeholder
      if (placeholder && !img.src) {
        img.src = placeholder;
      }
      imageObserver.observe(img);
    });

    this.observers.set('lazyImages', imageObserver);
  }

  /**
   * Virtual scrolling for large lists
   * @param {HTMLElement} container - Container element
   * @param {Array} items - Array of items to render
   * @param {Function} renderItem - Function to render each item
   * @param {Object} options - Virtual scrolling options
   */
  virtualScroll(container, items, renderItem, options = {}) {
    const {
      itemHeight = 50,
      buffer = 5,
      className = 'virtual-scroll-item'
    } = options;

    let scrollTop = 0;
    let containerHeight = container.clientHeight;
    let visibleCount = Math.ceil(containerHeight / itemHeight);
    let startIndex = 0;
    let endIndex = Math.min(startIndex + visibleCount + buffer, items.length);

    const updateScroll = () => {
      scrollTop = container.scrollTop;
      startIndex = Math.floor(scrollTop / itemHeight);
      endIndex = Math.min(startIndex + visibleCount + buffer, items.length);
      
      // Clear container
      container.innerHTML = '';
      
      // Add spacer for items before visible area
      if (startIndex > 0) {
        const topSpacer = document.createElement('div');
        topSpacer.style.height = `${startIndex * itemHeight}px`;
        container.appendChild(topSpacer);
      }
      
      // Render visible items
      for (let i = startIndex; i < endIndex; i++) {
        const item = renderItem(items[i], i);
        item.style.height = `${itemHeight}px`;
        item.classList.add(className);
        container.appendChild(item);
      }
      
      // Add spacer for items after visible area
      if (endIndex < items.length) {
        const bottomSpacer = document.createElement('div');
        bottomSpacer.style.height = `${(items.length - endIndex) * itemHeight}px`;
        container.appendChild(bottomSpacer);
      }
    };

    // Set container height
    container.style.height = `${items.length * itemHeight}px`;
    container.style.overflow = 'auto';
    
    // Initial render
    updateScroll();
    
    // Add scroll listener
    const throttledUpdate = this.throttle(updateScroll, 16, 'virtualScroll');
    container.addEventListener('scroll', throttledUpdate);
    
    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      containerHeight = container.clientHeight;
      visibleCount = Math.ceil(containerHeight / itemHeight);
      updateScroll();
    });
    resizeObserver.observe(container);
    
    this.observers.set('virtualScroll', { updateScroll, resizeObserver });
  }

  /**
   * Memoize function results
   * @param {Function} func - Function to memoize
   * @param {Function} keyGenerator - Function to generate cache keys
   */
  memoize(func, keyGenerator = null) {
    const cache = new Map();
    
    return (...args) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func.apply(this, args);
      cache.set(key, result);
      
      // Limit cache size
      if (cache.size > this.cacheConfig.maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      return result;
    };
  }

  /**
   * Batch DOM updates
   * @param {Function} updateFunction - Function containing DOM updates
   */
  batchDOMUpdates(updateFunction) {
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      // Temporarily disable layout thrashing
      const style = document.createElement('style');
      style.textContent = '* { will-change: auto !important; }';
      document.head.appendChild(style);
      
      try {
        updateFunction();
      } finally {
        // Clean up
        document.head.removeChild(style);
      }
    });
  }

  /**
   * Setup intersection observer for performance monitoring
   */
  setupIntersectionObserver() {
    if (!window.IntersectionObserver) return;
    
    // Monitor component visibility for performance optimization
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        const isVisible = entry.isIntersecting;
        
        // Add/remove performance optimizations based on visibility
        if (isVisible) {
          element.classList.add('visible');
          // Resume animations, start lazy loading, etc.
        } else {
          element.classList.remove('visible');
          // Pause animations, stop unnecessary updates, etc.
        }
      });
    }, {
      threshold: 0.1
    });
    
    this.observers.set('visibility', visibilityObserver);
  }

  /**
   * Setup memory management
   */
  setupMemoryManagement() {
    // Monitor memory usage
    setInterval(() => {
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize;
        const memoryLimit = performance.memory.jsHeapSizeLimit;
        const usagePercent = (memoryUsage / memoryLimit) * 100;
        
        // Clear caches if memory usage is high
        if (usagePercent > 80) {
          this.clearOldCache();
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Setup cache cleanup
   */
  setupCacheCleanup() {
    setInterval(() => {
      this.clearExpiredCache();
    }, 60000); // Clean every minute
  }

  /**
   * Setup performance optimizations
   */
  setupPerformanceOptimizations() {
    // Optimize scroll performance
    let ticking = false;
    const optimizedScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Handle scroll events here
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', optimizedScroll, { passive: true });
    
    // Optimize resize performance
    const optimizedResize = this.debounce(() => {
      // Handle resize events here
    }, 250, 'resize');
    
    window.addEventListener('resize', optimizedResize);
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const now = Date.now();
    
    // Clear expired cache entries
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
    
    // Clear expired memory cache entries
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Clear old cache entries when memory is high
   */
  clearOldCache() {
    // Clear half of the cache entries (oldest first)
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toDelete = Math.floor(entries.length / 2);
    for (let i = 0; i < toDelete; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    // Clear memory cache
    this.memoryCache.clear();
    
    console.log('🧹 Cleared old cache entries due to high memory usage');
  }

  /**
   * Get optimization statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      memoryCacheSize: this.memoryCache.size,
      debounceTimers: this.debounceTimers.size,
      throttleTimers: this.throttleTimers.size,
      observers: this.observers.size,
      lazyLoaders: this.lazyLoaders.size,
      memoryUsage: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null
    };
  }

  /**
   * Cleanup all optimizations
   */
  cleanup() {
    // Clear all caches
    this.cache.clear();
    this.memoryCache.clear();
    
    // Clear all timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    
    // Disconnect all observers
    this.observers.forEach(observer => {
      if (observer.disconnect) {
        observer.disconnect();
      } else if (observer.resizeObserver) {
        observer.resizeObserver.disconnect();
      }
    });
    this.observers.clear();
    
    // Clear lazy loaders
    this.lazyLoaders.clear();
    
    console.log('🧹 Optimization manager cleaned up');
  }
}

// Create singleton instance
const optimizationManager = new OptimizationManager();

// Export both the instance and the class
export default optimizationManager;
export { OptimizationManager };
