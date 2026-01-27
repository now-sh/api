const express = require('express');
const cors = require('cors');
const { formatSuccess, sendJSON } = require('../controllers/responseFormatter');
const { getCacheStats } = require('../utils/cache');
const { clearResponseCache } = require('../middleware/cacheMiddleware');

const cacheRoute = express.Router();

/**
 * Get global cache statistics
 */
cacheRoute.get('/stats', cors(), (req, res) => {
  const responseStats = getCacheStats('responses');
  
  const data = formatSuccess({
    title: 'Global API Cache Statistics',
    caches: {
      responses: {
        description: 'Cached API responses',
        stats: {
          hits: responseStats.hits,
          misses: responseStats.misses,
          keys: responseStats.keys,
          ksize: responseStats.ksize,
          vsize: responseStats.vsize
        }
      }
    },
    message: 'Use ?refresh=true on any endpoint to bypass cache',
    endpoints: {
      clear_all: 'DELETE /api/v1/cache/clear',
      clear_pattern: 'DELETE /api/v1/cache/clear?pattern=reddit'
    },
    cache_config: {
      '/api/v1/world/covid': '5 minutes',
      '/api/v1/world/disease': '5 minutes',
      '/api/v1/world/timezones': '1 hour',
      '/api/v1/world/closings': '30 minutes',
      '/api/v1/social/reddit': '5 minutes',
      '/api/v1/social/github': '10 minutes',
      '/api/v1/social/blogs': '30 minutes',
      '/api/v1/fun': '1 hour',
      '/api/v1/tools/commit': '5 minutes',
      '/api/v1/me/domains': '1 hour',
      '/api/v1/me/info': '1 hour'
    }
  });
  
  sendJSON(res, data);
});

/**
 * Clear cache
 */
cacheRoute.delete('/clear', cors(), (req, res) => {
  const pattern = req.query.pattern;
  const cleared = clearResponseCache(pattern);
  
  const data = formatSuccess({
    message: pattern 
      ? `Cleared ${cleared} cache entries matching '${pattern}'`
      : 'Cleared all cache entries',
    success: true,
    pattern: pattern || 'all',
    cleared: cleared
  });
  
  sendJSON(res, data);
});

module.exports = cacheRoute;