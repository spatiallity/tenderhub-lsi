/**
 * Performance Utilities
 * Tools for monitoring and optimizing application performance
 */

/**
 * Measure component render time
 * 
 * @param {string} componentName - Name of the component
 * @param {Function} callback - Function to measure
 * 
 * @example
 * measureRenderTime('TenderTable', () => {
 *   // Component render logic
 * });
 */
export const measureRenderTime = (componentName, callback) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    const result = callback();
    const end = performance.now();
    console.log(`[Performance] ${componentName} rendered in ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return callback();
};

/**
 * Debounce function - Delays execution until after wait time
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * 
 * @returns {Function} Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300);
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function - Limits execution to once per wait time
 * 
 * @param {Function} func - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * 
 * @returns {Function} Throttled function
 * 
 * @example
 * const throttledScroll = throttle((e) => handleScroll(e), 100);
 */
export const throttle = (func, wait = 100) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
};

/**
 * Lazy load component with retry logic
 * 
 * @param {Function} importFn - Dynamic import function
 * @param {number} retries - Number of retries (default: 3)
 * 
 * @returns {Promise} Component promise
 * 
 * @example
 * const LazyComponent = lazy(() => lazyWithRetry(() => import('./Component')));
 */
export const lazyWithRetry = (importFn, retries = 3) => {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        if (retries === 0) {
          reject(error);
          return;
        }
        
        console.warn(`Failed to load component, retrying... (${retries} attempts left)`);
        
        setTimeout(() => {
          lazyWithRetry(importFn, retries - 1).then(resolve, reject);
        }, 1000);
      });
  });
};

/**
 * Preload component for faster navigation
 * 
 * @param {Function} importFn - Dynamic import function
 * 
 * @example
 * // Preload on hover
 * <Link 
 *   to="/tender" 
 *   onMouseEnter={() => preloadComponent(() => import('./TenderPage'))}
 * >
 */
export const preloadComponent = (importFn) => {
  importFn().catch((err) => {
    console.warn('Failed to preload component:', err);
  });
};

/**
 * Check if browser supports WebP images
 * 
 * @returns {Promise<boolean>}
 * 
 * @example
 * const supportsWebP = await checkWebPSupport();
 * const imageSrc = supportsWebP ? 'image.webp' : 'image.jpg';
 */
export const checkWebPSupport = () => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Get performance metrics
 * 
 * @returns {Object} Performance metrics
 * 
 * @example
 * const metrics = getPerformanceMetrics();
 * console.log('FCP:', metrics.fcp);
 * console.log('LCP:', metrics.lcp);
 */
export const getPerformanceMetrics = () => {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }
  
  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  
  return {
    // First Contentful Paint
    fcp: paint.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0,
    
    // Largest Contentful Paint (requires PerformanceObserver)
    lcp: 0, // Will be set by PerformanceObserver
    
    // Time to Interactive
    tti: navigation?.domInteractive || 0,
    
    // Total Blocking Time
    tbt: 0, // Requires calculation
    
    // Cumulative Layout Shift
    cls: 0, // Requires PerformanceObserver
    
    // DOM Content Loaded
    dcl: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
    
    // Load Complete
    load: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
  };
};

/**
 * Report Web Vitals to analytics
 * Note: Requires 'web-vitals' package to be installed
 * 
 * @param {Function} onPerfEntry - Callback for performance entries
 * 
 * @example
 * reportWebVitals((metric) => {
 *   console.log(metric.name, metric.value);
 *   // Send to analytics
 * });
 */
export const reportWebVitals = (onPerfEntry) => {
  // web-vitals package is optional and not installed by default
  // To use this feature, install: npm install web-vitals
  console.log('[Performance] reportWebVitals requires web-vitals package. Install with: npm install web-vitals');
};

/**
 * Optimize images by converting to WebP and resizing
 * 
 * @param {string} src - Image source
 * @param {Object} options - Optimization options
 * 
 * @returns {string} Optimized image URL
 * 
 * @example
 * const optimizedSrc = optimizeImage('/images/photo.jpg', { width: 800, quality: 80 });
 */
export const optimizeImage = (src, options = {}) => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // If using a CDN or image optimization service, construct URL
  // Example: Cloudinary, Imgix, etc.
  // For now, return original src
  
  // TODO: Implement image optimization service integration
  return src;
};

/**
 * Prefetch data for faster navigation
 * 
 * @param {string} url - URL to prefetch
 * 
 * @example
 * // Prefetch on hover
 * <Link 
 *   to="/tender" 
 *   onMouseEnter={() => prefetchData('/api/tenders')}
 * >
 */
export const prefetchData = (url) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Detect slow network connection
 * 
 * @returns {boolean} True if connection is slow
 * 
 * @example
 * if (isSlowConnection()) {
 *   // Load lower quality images
 *   // Disable animations
 * }
 */
export const isSlowConnection = () => {
  if (typeof navigator === 'undefined' || !navigator.connection) {
    return false;
  }
  
  const connection = navigator.connection;
  const slowTypes = ['slow-2g', '2g', '3g'];
  
  return (
    slowTypes.includes(connection.effectiveType) ||
    connection.saveData === true ||
    connection.downlink < 1
  );
};

/**
 * Memory usage monitoring
 * 
 * @returns {Object} Memory usage info
 * 
 * @example
 * const memory = getMemoryUsage();
 * console.log('Used:', memory.usedJSHeapSize);
 * console.log('Limit:', memory.jsHeapSizeLimit);
 */
export const getMemoryUsage = () => {
  if (typeof performance === 'undefined' || !performance.memory) {
    return null;
  }
  
  return {
    usedJSHeapSize: performance.memory.usedJSHeapSize,
    totalJSHeapSize: performance.memory.totalJSHeapSize,
    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    usagePercent: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
  };
};

/**
 * Log performance warning if threshold exceeded
 * 
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in milliseconds
 * @param {number} threshold - Warning threshold (default: 100ms)
 * 
 * @example
 * const start = performance.now();
 * // ... expensive operation
 * logPerformanceWarning('Data processing', performance.now() - start);
 */
export const logPerformanceWarning = (operation, duration, threshold = 100) => {
  if (duration > threshold) {
    console.warn(
      `[Performance Warning] ${operation} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
    );
  }
};

export default {
  measureRenderTime,
  debounce,
  throttle,
  lazyWithRetry,
  preloadComponent,
  checkWebPSupport,
  getPerformanceMetrics,
  reportWebVitals,
  optimizeImage,
  prefetchData,
  isSlowConnection,
  getMemoryUsage,
  logPerformanceWarning,
};
