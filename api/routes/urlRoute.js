const express = require('express');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const urlController = require('../controllers/url');
const authController = require('../controllers/auth');
const optionalAuth = require('../middleware/optionalAuth');
const checkAuth = require('../middleware/checkAuth');
const { authLimiter } = require('../middleware/rateLimiter');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const urlRoute = express.Router();

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
 * Create short URL - JSON response
 */
urlRoute.post('/shorten',
  cors(),
  optionalAuth,
  authLimiter,
  body('url').isURL().withMessage('Valid URL is required'),
  body('customAlias').optional().matches(/^[a-zA-Z0-9-_]+$/).isLength({ min: 3, max: 50 })
    .withMessage('Custom alias must be 3-50 characters and contain only letters, numbers, hyphens, and underscores'),
  body('expiresIn').optional().isInt({ min: 60000, max: 31536000000 })
    .withMessage('Expiration must be between 1 minute and 1 year'),
  validateRequest,
  async (req, res) => {
    try {
      const host = `${req.protocol}://${req.headers.host}`;
      const userId = req.isAuthenticated && req.user ? 
        await authController.getUserId(req.user).catch(() => null) : null;
      
      const options = {
        baseUrl: host,
        userId: userId,
        customAlias: req.body.customAlias,
        expiresIn: req.body.expiresIn
      };
      
      const result = await urlController.createShortUrl(req.body.url, options);
      
      sendJSON(res, formatSuccess({
        originalUrl: req.body.url,
        shortUrl: result.shortUrl,
        shortCode: result.shortCode,
        customAlias: result.customAlias,
        expiresAt: result.expiresAt,
        userId: result.userId
      }));
      res.status(201).json(data);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('already taken') ? 409 : 
                        error instanceof Error && error.message.includes('Invalid') ? 400 : 500;
      const data = { 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
      setStandardHeaders(res, data);
      res.status(statusCode).json(data);
    }
  }
);

/**
 * Get URL statistics - JSON response
 */
urlRoute.get('/stats/:code',
  cors(),
  optionalAuth,
  param('code').notEmpty().withMessage('Code is required'),
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.isAuthenticated && req.user ? 
        await authController.getUserId(req.user).catch(() => null) : null;
      
      const stats = await urlController.getUrlStats(req.params.code, userId);
      
      sendJSON(res, formatSuccess({
        shortCode: stats.shortCode,
        originalUrl: stats.originalUrl,
        shortUrl: stats.shortUrl,
        clicks: stats.clicks,
        createdAt: stats.createdAt,
        expiresAt: stats.expiresAt,
        isActive: stats.isActive
      }));
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('access') ? 403 : 500;
      sendJSON(res, formatError(error.message), { status: statusCode });
    }
  }
);

urlRoute.get('/list',
  cors(),
  checkAuth,
  async (req, res) => {
    try {
      const userId = await authController.getUserId(req.user);
      const urls = await urlController.getUserUrls(userId);
      
      sendJSON(res, formatSuccess({
        urls,
        count: urls.length,
        userId
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Create short URL - Text response (returns just the short URL)
 */
urlRoute.post('/shorten/text',
  cors(),
  optionalAuth,
  authLimiter,
  body('url').isURL().withMessage('Valid URL is required'),
  body('customAlias').optional().matches(/^[a-zA-Z0-9-_]+$/).isLength({ min: 3, max: 50 })
    .withMessage('Custom alias must be 3-50 characters'),
  body('expiresIn').optional().isInt({ min: 60000, max: 31536000000 })
    .withMessage('Expiration must be between 1 minute and 1 year'),
  validateRequest,
  async (req, res) => {
    try {
      const host = `${req.protocol}://${req.headers.host}`;
      const userId = req.isAuthenticated && req.user ? 
        await authController.getUserId(req.user).catch(() => null) : null;
      
      const options = {
        baseUrl: host,
        userId: userId,
        customAlias: req.body.customAlias,
        expiresIn: req.body.expiresIn
      };
      
      const result = await urlController.createShortUrl(req.body.url, options);
      sendText(res, result.shortUrl);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Get URL info by code (for API, not redirect)
 */
urlRoute.get('/info/:code',
  cors(),
  param('code').notEmpty().withMessage('Code is required'),
  validateRequest,
  async (req, res) => {
    try {
      const url = await urlController.getUrlByCode(req.params.code);
      
      sendJSON(res, formatSuccess({
        shortCode: req.params.code,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        clicks: url.clicks,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        isActive: url.isActive
      }));
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('expired') ? 410 : 500;
      sendJSON(res, formatError(error.message), { status: statusCode });
    }
  }
);

/**
 * Delete short URL
 */
urlRoute.delete('/:code',
  cors(),
  checkAuth,
  param('code').notEmpty().withMessage('Code is required'),
  validateRequest,
  async (req, res) => {
    try {
      const userId = await authController.getUserId(req.user);
      const result = await urlController.deleteUrl(req.params.code, userId);
      
      sendJSON(res, formatSuccess({
        message: 'URL deleted successfully',
        shortCode: req.params.code,
        deleted: true
      }));
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('access') ? 403 : 500;
      sendJSON(res, formatError(error.message), { status: statusCode });
    }
  }
);

/**
 * Help endpoint
 */
urlRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'URL Shortener',
    message: 'Create and manage short URLs',
    endpoints: {
      shorten: {
        json: `POST ${host}/api/v1/data/urls/shorten`,
        text: `POST ${host}/api/v1/data/urls/shorten/text`
      },
      stats: `GET ${host}/api/v1/data/urls/stats/:code`,
      list: `GET ${host}/api/v1/data/urls/list`,
      delete: `DELETE ${host}/api/v1/data/urls/:code`,
      redirect: `GET ${host}/s/:code`
    },
    features: {
      anonymous: 'Create short URLs without authentication',
      authenticated: 'Track and manage your URLs with user account',
      custom_alias: 'Create custom short codes',
      expiration: 'Set expiration time for URLs',
      statistics: 'View click statistics and analytics'
    },
    parameters: {
      url: 'Valid URL to shorten (required)',
      customAlias: 'Custom short code (3-50 characters, alphanumeric, hyphens, underscores)',
      expiresIn: 'Expiration time in milliseconds (1 minute to 1 year)',
      code: 'Short code for operations'
    },
    examples: {
      simple: `POST ${host}/api/v1/data/urls/shorten {"url": "https://example.com"}`,
      simpleText: `POST ${host}/api/v1/data/urls/shorten/text {"url": "https://example.com"}`,
      custom: `POST ${host}/api/v1/data/urls/shorten {"url": "https://example.com", "customAlias": "mylink"}`,
      expiring: `POST ${host}/api/v1/data/urls/shorten {"url": "https://example.com", "expiresIn": 86400000}`,
      stats: `GET ${host}/api/v1/data/urls/stats/abc123`,
      list: `GET ${host}/api/v1/data/urls/list`,
      delete: `DELETE ${host}/api/v1/data/urls/abc123`
    },
    authentication: {
      required: ['list', 'delete'],
      optional: ['shorten', 'stats'],
      note: 'Authenticated users can track and manage their URLs'
    }
  });
  
  sendJSON(res, data);
});

module.exports = urlRoute;