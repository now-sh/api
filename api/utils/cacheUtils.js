/**
 * Simple in-memory cache utility
 * Provides consistent caching patterns across controllers
 */

/**
 * Create a simple single-value cache
 * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
 * @returns {object} Cache object with get, set, clear methods
 */
function createCache(ttlMs = 5 * 60 * 1000) {
  let data = null;
  let timestamp = 0;

  return {
    get() {
      if (data && (Date.now() - timestamp) < ttlMs) {
        return data;
      }
      return null;
    },

    set(value) {
      data = value;
      timestamp = Date.now();
      return value;
    },

    clear() {
      data = null;
      timestamp = 0;
    },

    isValid() {
      return data !== null && (Date.now() - timestamp) < ttlMs;
    },

    getTimestamp() {
      return timestamp;
    },

    getTTL() {
      return ttlMs;
    }
  };
}

/**
 * Create a Map-based cache for multiple keys
 * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
 * @returns {object} Cache object with get, set, delete, clear methods
 */
function createMapCache(ttlMs = 5 * 60 * 1000) {
  const cache = new Map();

  return {
    get(key) {
      const cached = cache.get(key);
      if (cached && (Date.now() - cached.timestamp) < ttlMs) {
        return cached.data;
      }
      // Clean up expired entry
      if (cached) {
        cache.delete(key);
      }
      return null;
    },

    set(key, value) {
      cache.set(key, {
        data: value,
        timestamp: Date.now()
      });
      return value;
    },

    delete(key) {
      return cache.delete(key);
    },

    clear() {
      cache.clear();
    },

    has(key) {
      const cached = cache.get(key);
      return cached && (Date.now() - cached.timestamp) < ttlMs;
    },

    size() {
      return cache.size;
    },

    // Clean up all expired entries
    prune() {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp >= ttlMs) {
          cache.delete(key);
        }
      }
    }
  };
}

/**
 * Create a multi-key cache (like closings with albany, utica, combined)
 * @param {string[]} keys - Array of cache keys
 * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
 * @returns {object} Cache object with get, set, clear methods per key
 */
function createMultiCache(keys, ttlMs = 5 * 60 * 1000) {
  const caches = {};
  keys.forEach(key => {
    caches[key] = { data: null, timestamp: 0 };
  });

  return {
    get(key) {
      const cached = caches[key];
      if (cached && cached.data && (Date.now() - cached.timestamp) < ttlMs) {
        return cached.data;
      }
      return null;
    },

    set(key, value) {
      if (caches[key]) {
        caches[key] = { data: value, timestamp: Date.now() };
      }
      return value;
    },

    clear(key) {
      if (key) {
        if (caches[key]) {
          caches[key] = { data: null, timestamp: 0 };
        }
      } else {
        keys.forEach(k => {
          caches[k] = { data: null, timestamp: 0 };
        });
      }
    },

    isValid(key) {
      const cached = caches[key];
      return cached && cached.data !== null && (Date.now() - cached.timestamp) < ttlMs;
    },

    clearAll() {
      keys.forEach(k => {
        caches[k] = { data: null, timestamp: 0 };
      });
    }
  };
}

/**
 * Wrapper for async functions with caching
 * @param {Function} fn - Async function to cache
 * @param {number} ttlMs - Time to live in milliseconds
 * @returns {Function} Cached version of the function
 */
function withCache(fn, ttlMs = 5 * 60 * 1000) {
  const cache = createCache(ttlMs);

  return async function(...args) {
    const cached = cache.get();
    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(result);
    return result;
  };
}

/**
 * Wrapper for async functions with key-based caching
 * @param {Function} fn - Async function to cache (first arg is used as cache key)
 * @param {number} ttlMs - Time to live in milliseconds
 * @returns {Function} Cached version of the function
 */
function withKeyCache(fn, ttlMs = 5 * 60 * 1000) {
  const cache = createMapCache(ttlMs);

  return async function(key, ...args) {
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn(key, ...args);
    cache.set(key, result);
    return result;
  };
}

module.exports = {
  createCache,
  createMapCache,
  createMultiCache,
  withCache,
  withKeyCache
};
