/**
 * Universal header utility for consistent API responses
 */

function setStandardHeaders(res, data, options = {}) {
  // Always set content type
  res.setHeader('Content-Type', 'application/json');
  
  // Add API rate limit headers if provided
  if (options.headers) {
    // GitHub style rate limit headers
    if (options.headers['x-ratelimit-remaining']) {
      res.setHeader('X-RateLimit-Remaining', options.headers['x-ratelimit-remaining']);
    }
    if (options.headers['x-ratelimit-limit']) {
      res.setHeader('X-RateLimit-Limit', options.headers['x-ratelimit-limit']);
    }
    if (options.headers['x-ratelimit-reset']) {
      res.setHeader('X-RateLimit-Reset', options.headers['x-ratelimit-reset']);
    }
    
    // Reddit style rate limit headers
    if (options.headers['x-ratelimit-used']) {
      res.setHeader('X-RateLimit-Used', options.headers['x-ratelimit-used']);
    }
    if (options.headers['x-ratelimit-remaining']) {
      res.setHeader('X-RateLimit-Remaining', options.headers['x-ratelimit-remaining']);
    }
    if (options.headers['x-ratelimit-reset']) {
      res.setHeader('X-RateLimit-Reset', options.headers['x-ratelimit-reset']);
    }
  }
  
  // Handle no-cache option for random/dynamic content
  if (options.noCache) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else {
    // Add total count for arrays
    if (Array.isArray(data)) {
      res.setHeader('X-Total-Count', data.length);
      
      // Handle empty results
      if (data.length === 0) {
        res.setHeader('X-Empty-Result', 'true');
        res.setHeader('X-Message', options.emptyMessage || 'No data found');
        res.setHeader('Cache-Control', 'public, max-age=60'); // 1 minute cache for empty results
      } else {
        res.setHeader('Cache-Control', options.cacheTime || 'public, max-age=300'); // Default 5 minute cache
      }
    } else if (typeof data === 'object' && data !== null) {
      // For objects, check if it has array properties (like repos, posts, etc)
      const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
      if (arrayKeys.length > 0) {
        // If main data property is empty, set empty result headers
        const mainKey = arrayKeys[0];
        if (data[mainKey].length === 0) {
          res.setHeader('X-Empty-Result', 'true');
          res.setHeader('X-Message', options.emptyMessage || 'No data found');
          res.setHeader('Cache-Control', 'public, max-age=60');
        } else {
          res.setHeader('X-Total-Count', data[mainKey].length);
          res.setHeader('Cache-Control', options.cacheTime || 'public, max-age=300');
        }
      } else {
        res.setHeader('Cache-Control', options.cacheTime || 'public, max-age=300');
      }
    } else {
      // For other types, just set cache control
      res.setHeader('Cache-Control', options.cacheTime || 'public, max-age=300');
    }
  }
  
  // Add custom headers if provided
  if (options.customHeaders) {
    Object.entries(options.customHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  }
}

module.exports = { setStandardHeaders };