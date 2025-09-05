const { getCache } = require('../utils/cache');

// Default cache configuration
const CACHE_CONFIG = {
  '/api/v1/world/covid': 300,           // 5 minutes
  '/api/v1/world/disease': 300,         // 5 minutes
  '/api/v1/world/timezones': 3600,     // 1 hour
  '/api/v1/world/closings': 1800,      // 30 minutes
  '/api/v1/social/reddit': 300,        // 5 minutes
  '/api/v1/social/github': 600,        // 10 minutes
  '/api/v1/social/blogs': 1800,        // 30 minutes
  '/api/v1/fun': 3600,                 // 1 hour
  '/api/v1/tools/commit': 300,         // 5 minutes
  '/api/v1/me/domains': 3600,          // 1 hour
  '/api/v1/me/info': 3600,             // 1 hour
};

// Routes that should never be cached
const NEVER_CACHE = [
  '/api/health',
  '/api/v1/auth',
  '/api/v1/data/todos',
  '/api/v1/data/notes',
  '/api/v1/tools/uuid',
  '/api/v1/tools/passwd',
  '/api/v1/tools/hash',
  '/api/v1/tools/jwt',
  '/api/v1/tools/qr',
];

/**
 * Create cache middleware for a specific route pattern
 */
function createCacheMiddleware(routePattern = null, ttl = 300) {
  const cache = getCache('responses', ttl);
  
  return function cacheMiddleware(req, res, next) {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check if this route should be cached
    const fullPath = req.baseUrl + req.path;
    if (!shouldCache(fullPath, routePattern)) {
      return next();
    }

    // Check for cache bypass
    if (req.query.refresh === 'true' || req.query.nocache === 'true') {
      console.log(`[Cache] Bypass requested for ${fullPath}`);
      return next();
    }

    // Generate cache key
    const cacheKey = generateCacheKey(req);
    
    // Try to get from cache
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`[Cache] HIT for ${cacheKey}`);
      res.set({
        'X-Cache': 'HIT',
        'X-Cache-TTL': ttl.toString(),
        'X-Cache-From': 'responses'
      });
      return res.status(cached.status || 200).json(cached.data);
    }

    console.log(`[Cache] MISS for ${cacheKey}`);
    
    // Monkey patch the json method to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const shouldStore = data && (
          Array.isArray(data) ||
          data.success === true ||
          (!data.error && !data.message?.toLowerCase().includes('error'))
        );
        
        if (shouldStore) {
          console.log(`[Cache] Storing ${cacheKey}`);
          cache.set(cacheKey, {
            data: data,
            status: res.statusCode,
            timestamp: new Date().toISOString()
          });
          
          res.set({
            'X-Cache': 'MISS',
            'X-Cache-TTL': ttl.toString(),
            'X-Cache-From': 'responses'
          });
        }
      }
      
      // Call original method
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Check if route should be cached
 */
function shouldCache(path, pattern) {
  // Check never cache list
  for (const neverCache of NEVER_CACHE) {
    if (path.startsWith(neverCache)) {
      return false;
    }
  }
  
  // If pattern provided, check it
  if (pattern) {
    return path.startsWith(pattern);
  }
  
  // Otherwise check config
  for (const route in CACHE_CONFIG) {
    if (path.startsWith(route)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req) {
  const fullPath = req.baseUrl + req.path;
  const queryKeys = Object.keys(req.query).sort();
  const queryString = queryKeys
    .filter(key => key !== 'refresh' && key !== 'nocache')
    .map(key => `${key}=${req.query[key]}`)
    .join('&');
  
  return `resp:${fullPath}:${queryString}`;
}

/**
 * Get cache configuration
 */
function getCacheConfig() {
  return { ...CACHE_CONFIG };
}

module.exports = {
  createCacheMiddleware,
  getCacheConfig
};