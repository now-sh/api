require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const { fetchRedditData } = require('../utils/redditHelper');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const redditRoute = express.Router();
const default_route = ['/', '/help'];

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
      subreddit: `GET ${host}/api/v1/social/reddit/r/:subreddit`
    },
    parameters: {
      user: 'Reddit username',
      subreddit: 'Subreddit name (without r/ prefix)'
    },
    examples: {
      user: `GET ${host}/api/v1/social/reddit/u/spez`,
      subreddit: `GET ${host}/api/v1/social/reddit/r/programming`
    },
    note: "Reddit API access is limited due to Reddit's authentication requirements. Some endpoints may return cached or limited data."
  });
  
  sendJSON(res, data);
});


/**
 * Get Reddit user data - Legacy format for compatibility
 */
redditRoute.get('/u/:id',
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
        
        // Return simplified format
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
  cors(),
  param('id').notEmpty().withMessage('Subreddit ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      const data = await fetchRedditData(null, req.params.id);
      
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

module.exports = redditRoute;
