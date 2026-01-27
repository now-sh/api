// dotenv loaded in index.js
const express = require('express');
const cors = require('cors');
const { param, validationResult } = require('express-validator');
const { fetchRedditData } = require('../utils/redditHelper');
const { formatSuccess, formatError, sendJSON } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');
const { getCacheStats } = require('../utils/cache');
const { clearResponseCache } = require('../middleware/cacheMiddleware');

const redditRoute = express.Router();
const default_route = ['/', '/help'];

// Apply caching middleware to this router
const { createCacheMiddleware } = require('../middleware/responseCacheMiddleware');
const cacheMiddleware = createCacheMiddleware('/api/v1/social/reddit', 300); // 5 minute cache

/**
 * Validation middleware
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendJSON(res, formatError('Validation failed', {
      details: formatValidationErrors(errors.array())
    }), { status: 400 });
    return;
  }
  next();
}


/**
 * Help endpoint
 */
redditRoute.get(default_route, cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'Reddit API',
    message: 'Access Reddit user and subreddit data',
    endpoints: {
      user: `GET ${host}/api/v1/social/reddit/u/:user`,
      subreddit: `GET ${host}/api/v1/social/reddit/r/:subreddit`,
      cache_stats: `GET ${host}/api/v1/social/reddit/cache/stats`
    },
    parameters: {
      user: 'Reddit username',
      subreddit: 'Subreddit name (without r/ prefix)',
      refresh: 'Set to "true" to bypass cache (optional)'
    },
    examples: {
      user: `GET ${host}/api/v1/social/reddit/u/spez`,
      subreddit: `GET ${host}/api/v1/social/reddit/r/programming`,
      with_refresh: `GET ${host}/api/v1/social/reddit/r/programming?refresh=true`
    },
    note: "Reddit API access is limited due to Reddit's authentication requirements. Some endpoints may return cached or limited data.",
    cache: "Data is cached for 5 minutes. Use ?refresh=true to force fresh data.",
    api_keys: "Add REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to .env for OAuth API access."
  });
  
  sendJSON(res, data);
});


/**
 * Get Reddit user data - Legacy format for compatibility
 */
redditRoute.get('/u/:id',
  cacheMiddleware,
  cors(),
  param('id').notEmpty().withMessage('User ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      const data = await fetchRedditData(req.params.id);
      
      // Return legacy format for existing site compatibility
      if (data && data.data) {
        res.json({
          user: data.data,
          message: "User info retrieved"
        });
      } else {
        res.status(404).json({
          user: null,
          message: "User not found"
        });
      }
    } catch (error) {
      console.error('Reddit API error:', error);
      res.status(503).json({
        user: null,
        error: "Reddit API unavailable",
        message: "Reddit is blocking unauthenticated requests. Authentication required for real data."
      });
    }
  }
);

/**
 * Get subreddit posts - Legacy format for compatibility
 */
redditRoute.get('/r/:id',
  cacheMiddleware,
  cors(),
  param('id').notEmpty().withMessage('Subreddit ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 25;
      const data = await fetchRedditData(null, req.params.id, limit);
      
      if (data && data.data && data.data.children) {
        // Return the posts
        let posts = data.data.children;
        
        // Map to simpler format
        const simplePosts = posts.map(post => post.data);
        
        // Add source info to response
        res.set('X-Reddit-Source', data.source || 'rss');
        
        // Return simplified format (cache middleware will handle caching)
        res.json(simplePosts);
      } else {
        res.status(404).json({
          error: "No posts found",
          message: "Subreddit not found or no posts available"
        });
      }
    } catch (error) {
      console.error('Reddit API error:', error);
      res.status(503).json({
        error: "Reddit API unavailable",
        message: "Reddit is blocking unauthenticated requests. Authentication required for real data."
      });
    }
  }
);

/**
 * Get subreddit posts (fallback route) - Legacy format for compatibility
 */
redditRoute.get('/:id',
  cacheMiddleware,
  cors(),
  param('id').notEmpty().withMessage('Subreddit ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      const data = await fetchRedditData(null, req.params.id, 25);
      
      if (data && data.data && data.data.children) {
        // Remove first 3 posts if we have enough
        let posts = data.data.children;
        if (posts.length > 3) {
          posts = posts.slice(3);
        }
        
        // Return legacy format for existing site compatibility
        res.json({
          reddit: posts,
          totalPosts: posts.length
        });
      } else {
        res.status(404).json({
          reddit: [],
          totalPosts: 0,
          error: "No data available",
          message: "Subreddit not found or no posts available"
        });
      }
    } catch (error) {
      console.error('Reddit API error:', error);
      res.status(503).json({
        reddit: [],
        totalPosts: 0,
        error: "Reddit API unavailable",
        message: "Reddit is blocking unauthenticated requests. Authentication required for real data."
      });
    }
  }
);

/**
 * Get cache statistics
 */
redditRoute.get('/cache/stats', cors(), (req, res) => {
  const responseStats = getCacheStats('responses');
  
  const data = formatSuccess({
    title: 'API Response Cache Statistics',
    stats: {
      hits: responseStats.hits,
      misses: responseStats.misses,
      keys: responseStats.keys,
      ksize: responseStats.ksize,
      vsize: responseStats.vsize
    },
    cache_ttl: '5 minutes for Reddit endpoints',
    message: 'Use ?refresh=true on any endpoint to bypass cache'
  });
  
  sendJSON(res, data);
});

/**
 * Clear Reddit cache
 */
redditRoute.delete('/cache/clear', cors(), (req, res) => {
  const cleared = clearResponseCache('reddit');
  
  const data = formatSuccess({
    message: `Cleared ${cleared} Reddit cache entries`,
    success: true
  });
  
  sendJSON(res, data);
});

module.exports = redditRoute;
