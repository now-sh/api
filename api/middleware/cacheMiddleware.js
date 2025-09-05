const { getCache } = require('../utils/cache');

// Default cache configuration
const DEFAULT_CACHE_CONFIG = {
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
 * Response caching middleware
 * Only caches successful GET requests
 * Never caches POST, PUT, DELETE or responses with errors
 */
function responseCacheMiddleware(req, res, next) {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Check if route should be cached
  const shouldCache = shouldCacheRoute(req.path);
  if (!shouldCache) {
    console.log(`[Cache] Route not cacheable: ${req.path}`);
    return next();
  }
  console.log(`[Cache] Route cacheable: ${req.path}`);

  // Check for cache bypass
  if (req.query.refresh === 'true' || req.query.nocache === 'true') {
    return next();
  }

  // Generate cache key
  const cacheKey = generateCacheKey(req);
  const cacheTTL = getCacheTTL(req.path);
  const cache = getCache('responses', cacheTTL);

  // Try to get from cache
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[Cache] HIT for key: ${cacheKey}`);
    // Add cache headers
    res.set({
      'X-Cache': 'HIT',
      'X-Cache-TTL': cacheTTL.toString(),
      'X-Cache-Key': cacheKey.substring(0, 20) + '...'
    });
    
    // Send cached response
    return res.status(cached.status || 200).json(cached.data);
  }
  console.log(`[Cache] MISS for key: ${cacheKey}`);

  // Store original json method - bind to preserve context
  const originalJson = res.json.bind(res);
  
  // Override json method to cache successful responses
  res.json = function(data) {
    console.log(`[Cache] res.json intercepted for ${req.path}`);
    console.log(`[Cache] Data type: ${Array.isArray(data) ? 'array' : typeof data}, status: ${res.statusCode}`);
    // Only cache successful responses (2xx status codes)
    const status = res.statusCode || 200;
    if (status >= 200 && status < 300) {
      // Only cache if data indicates success
      // Cache arrays (like Reddit), objects with success=true, or objects without error
      const shouldCache = data && (
        Array.isArray(data) ||
        data.success === true ||
        (!data.error && !data.message?.toLowerCase().includes('error'))
      );
      console.log(`[Cache] shouldCache decision: ${shouldCache}`);
      
      if (shouldCache) {
        console.log(`[Cache] Storing response for key: ${cacheKey}`);
        const stored = cache.set(cacheKey, {
          data: data,
          status: status,
          timestamp: new Date().toISOString()
        }, cacheTTL);
        console.log(`[Cache] Store result: ${stored}`);
        
        // Add cache headers
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-TTL': cacheTTL.toString(),
          'X-Cache-Key': cacheKey.substring(0, 20) + '...'
        });
      } else {
        console.log(`[Cache] Not caching response - shouldCache = false`);
      }
    }
    
    // Call original json method
    return originalJson(data);
  };
  
  console.log(`[Cache] Middleware setup complete, calling next()`);
  next();
}

/**
 * Check if route should be cached
 */
function shouldCacheRoute(path) {
  // Never cache certain routes
  for (const neverCache of NEVER_CACHE) {
    if (path.startsWith(neverCache)) {
      return false;
    }
  }
  
  // Check if route is in cache config
  for (const route in DEFAULT_CACHE_CONFIG) {
    if (path.startsWith(route)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get cache TTL for route
 */
function getCacheTTL(path) {
  for (const route in DEFAULT_CACHE_CONFIG) {
    if (path.startsWith(route)) {
      return DEFAULT_CACHE_CONFIG[route];
    }
  }
  return 300; // Default 5 minutes
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req) {
  // Include query parameters in cache key
  const queryKeys = Object.keys(req.query).sort();
  const queryString = queryKeys
    .filter(key => key !== 'refresh' && key !== 'nocache')
    .map(key => `${key}=${req.query[key]}`)
    .join('&');
  
  return `response:${req.path}:${queryString}`;
}

/**
 * Clear response cache for specific routes
 */
function clearResponseCache(pattern = null) {
  const cache = getCache('responses');
  
  if (pattern) {
    const keys = cache.keys();
    const toDelete = keys.filter(key => key.includes(pattern));
    toDelete.forEach(key => cache.del(key));
    return toDelete.length;
  } else {
    cache.flushAll();
    return true;
  }
}

module.exports = {
  responseCacheMiddleware,
  clearResponseCache
};