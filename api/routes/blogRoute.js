require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { param, query, validationResult } = require('express-validator');
const blogController = require('../controllers/blog');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const blogRoute = express.Router();

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
 * List blog posts - JSON response
 */
blogRoute.get('/list', cors(), async (req, res) => {
  try {
    const posts = await blogController.getBlogPosts();
    
    sendJSON(res, formatSuccess({
      repository: blogController.getDefaultRepo(),
      posts,
      count: posts.length
    }));
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 503 });
  }
});

/**
 * List blog posts - Text response
 */
blogRoute.get('/list/text', cors(), async (req, res) => {
  try {
    const posts = await blogController.getBlogPosts();
    const output = posts.map((post, index) => 
      `${index + 1}. ${post.title}\n   Date: ${post.date}\n   Author: ${post.author || 'Unknown'}`
    ).join('\n\n');
    
    sendText(res, output);
  } catch (error) {
    sendText(res, `Error: ${error.message}`);
  }
});

/**
 * Get single blog post - JSON response
 */
blogRoute.get('/post/:slug',
  cors(),
  param('slug').notEmpty().withMessage('Post slug is required'),
  validateRequest,
  async (req, res) => {
    try {
      const post = await blogController.getBlogPost(req.params.slug);
      
      if (!post) {
        sendJSON(res, formatError('Post not found'), { status: 404 });
        return;
      }
      
      sendJSON(res, formatSuccess({
        post
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 503 });
    }
  }
);

/**
 * Get single blog post - Text response
 */
blogRoute.get('/post/:slug/text',
  cors(),
  param('slug').notEmpty().withMessage('Post slug is required'),
  validateRequest,
  async (req, res) => {
    try {
      const post = await blogController.getBlogPost(req.params.slug);
      
      if (!post) {
        sendText(res, 'Post not found');
        return;
      }
      
      const output = [
        post.title,
        '=' .repeat(post.title.length),
        `Date: ${post.date}`,
        `Author: ${post.author || 'Unknown'}`,
        post.categories ? `Categories: ${post.categories}` : '',
        post.tags ? `Tags: ${post.tags}` : '',
        '',
        post.content
      ].filter(line => line !== '').join('\n');
      
      sendText(res, output);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Search blog posts - JSON response
 */
blogRoute.get('/search',
  cors(),
  query('q').notEmpty().withMessage('Search query is required'),
  validateRequest,
  async (req, res) => {
    try {
      const results = await blogController.searchBlogPosts(req.query.q);
      
      sendJSON(res, formatSuccess({
        query: req.query.q,
        results,
        count: results.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 503 });
    }
  }
);

/**
 * Search blog posts - Text response
 */
blogRoute.get('/search/text',
  cors(),
  query('q').notEmpty().withMessage('Search query is required'),
  validateRequest,
  async (req, res) => {
    try {
      const results = await blogController.searchBlogPosts(req.query.q);
      
      if (results.length === 0) {
        sendText(res, 'No posts found matching your search');
        return;
      }
      
      const output = results.map((post, index) => 
        `${index + 1}. ${post.title}\n   Date: ${post.date}\n   Excerpt: ${post.excerpt}`
      ).join('\n\n');
      
      sendText(res, output);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Get blog posts from custom repository - JSON response
 */
blogRoute.get('/repo/:user/:repo',
  cors(),
  param('user').notEmpty().withMessage('GitHub username is required'),
  param('repo').notEmpty().withMessage('Repository name is required'),
  validateRequest,
  async (req, res) => {
    try {
      const posts = await blogController.getCustomRepoPosts(req.params.user, req.params.repo);
      
      sendJSON(res, formatSuccess({
        repository: `${req.params.user}/${req.params.repo}`,
        posts,
        count: posts.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message, {
        hint: 'Make sure the repository exists and has a _posts directory'
      }), { status: 503 });
    }
  }
);

/**
 * Get blog posts from custom repository - Text response
 */
blogRoute.get('/repo/:user/:repo/text',
  cors(),
  param('user').notEmpty().withMessage('GitHub username is required'),
  param('repo').notEmpty().withMessage('Repository name is required'),
  validateRequest,
  async (req, res) => {
    try {
      const posts = await blogController.getCustomRepoPosts(req.params.user, req.params.repo);
      
      const output = [
        `Repository: ${req.params.user}/${req.params.repo}`,
        `Total posts: ${posts.length}`,
        '',
        ...posts.map((post, index) => 
          `${index + 1}. ${post.title}\n   Date: ${post.date}`
        )
      ].join('\n');
      
      sendText(res, output);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Legacy routes for backward compatibility
 */
blogRoute.get('/jason', cors(), async (req, res) => {
  try {
    // Clear cache if requested
    if (req.query.refresh === 'true') {
      blogController.clearCache();
    }
    
    const posts = await blogController.getBlogPosts();
    console.log(`Blog posts fetched: ${posts.length} posts`);
    
    res.json({
      repository: "malaks-us/jason",
      total_posts: posts.length,
      posts: posts
    });
  } catch (error) {
    console.error('Blog API error:', error.message);
    res.status(500).json({ 
      error: error.message,
      repository: "malaks-us/jason"
    });
  }
});

// Add cache clear endpoint
blogRoute.delete('/cache/clear', cors(), (req, res) => {
  try {
    blogController.clearCache();
    res.json({
      success: true,
      message: 'Blog cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Data endpoint for personal blog (maps to malaks-us/jason)
blogRoute.get('/', cors(), async (req, res) => {
  try {
    const blogController = require('../controllers/blog');
    const posts = await blogController.getBlogPosts();
    
    res.json({
      success: true,
      data: {
        repository: "malaks-us/jason",
        total_posts: posts.length,
        posts: posts
      }
    });
  } catch (error) {
    console.error('Data blogs error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        repository: "malaks-us/jason",
        total_posts: 0,
        posts: []
      }
    });
  }
});

blogRoute.get('/:user/:repo', cors(), async (req, res) => {
  try {
    const posts = await blogController.getCustomRepoPosts(req.params.user, req.params.repo);
    res.json({
      repository: `${req.params.user}/${req.params.repo}`,
      total_posts: posts.length,
      posts: posts
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      repository: `${req.params.user}/${req.params.repo}`,
      hint: "Make sure the repository exists and has a _posts directory"
    });
  }
});

/**
 * Help endpoint
 */
blogRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'Blog Posts API',
    message: 'Fetch and parse Jekyll-style blog posts from GitHub repositories',
    endpoints: {
      list: {
        json: `GET ${host}/api/v1/me/blog/list`,
        text: `GET ${host}/api/v1/me/blog/list/text`
      },
      post: {
        json: `GET ${host}/api/v1/me/blog/post/:slug`,
        text: `GET ${host}/api/v1/me/blog/post/:slug/text`
      },
      search: {
        json: `GET ${host}/api/v1/me/blog/search?q=query`,
        text: `GET ${host}/api/v1/me/blog/search/text?q=query`
      },
      customRepo: {
        json: `GET ${host}/api/v1/me/blog/repo/:user/:repo`,
        text: `GET ${host}/api/v1/me/blog/repo/:user/:repo/text`
      },
      legacy: {
        jason: `GET ${host}/api/v1/me/blog/jason`,
        custom: `GET ${host}/api/v1/me/blog/:user/:repo`
      }
    },
    parameters: {
      slug: 'Blog post slug (from filename)',
      q: 'Search query for posts',
      user: 'GitHub username',
      repo: 'Repository name'
    },
    defaultRepository: 'malaks-us/jason',
    examples: {
      list: `curl ${host}/api/v1/me/blog/list`,
      post: `curl ${host}/api/v1/me/blog/post/welcome-to-jekyll`,
      search: `curl "${host}/api/v1/me/blog/search?q=javascript"`,
      customRepo: `curl ${host}/api/v1/me/blog/repo/jekyll/jekyll`
    },
    response_format: {
      filename: 'Original filename',
      title: 'Post title from frontmatter or filename',
      date: 'Post date from frontmatter or filename',
      slug: 'URL-friendly post identifier',
      author: 'Author from frontmatter',
      categories: 'Categories from frontmatter',
      tags: 'Tags from frontmatter',
      excerpt: 'Short excerpt of content',
      content: 'Full post content (without frontmatter)',
      frontmatter: 'Original frontmatter data'
    }
  });
  
  sendJSON(res, data);
});

module.exports = blogRoute;