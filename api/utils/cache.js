const NodeCache = require('node-cache');

// Create cache instances with different TTLs
const caches = {
  reddit: new NodeCache({ stdTTL: 300, checkperiod: 60 }), // 5 minutes
  general: new NodeCache({ stdTTL: 600, checkperiod: 120 }) // 10 minutes default
};

// Get or create a cache instance
function getCache(name = 'general', ttl = 600) {
  if (!caches[name]) {
    caches[name] = new NodeCache({ stdTTL: ttl, checkperiod: ttl / 5 });
  }
  return caches[name];
}

// Cache wrapper function
async function cacheWrapper(key, fetchFunction, options = {}) {
  const { cacheName = 'general', ttl = null, force = false } = options;
  const cache = getCache(cacheName);
  
  // Check if we should skip cache
  if (force) {
    cache.del(key);
  }
  
  // Try to get from cache
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  
  // Fetch fresh data
  try {
    const freshData = await fetchFunction();
    
    // Store in cache
    if (ttl) {
      cache.set(key, freshData, ttl);
    } else {
      cache.set(key, freshData);
    }
    
    return freshData;
  } catch (error) {
    // If there's an error and we have stale data, return it
    const stale = cache.get(key);
    if (stale !== undefined) {
      console.log(`Returning stale cache for ${key} due to error:`, error.message);
      return stale;
    }
    throw error;
  }
}

// Clear specific cache
function clearCache(cacheName = 'general', pattern = null) {
  const cache = getCache(cacheName);
  
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

// Get cache stats
function getCacheStats(cacheName = 'general') {
  const cache = getCache(cacheName);
  return cache.getStats();
}

module.exports = {
  getCache,
  cacheWrapper,
  clearCache,
  getCacheStats
};