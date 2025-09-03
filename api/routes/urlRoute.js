const express = require('express'); const { Request, Response } = require('express');
const { body, param, validationResult } = require('express-validator');
const cors = require('cors');
const urlController = require('../controllers/url');
const authController = require('../controllers/auth');
const optionalAuth = require('../middleware/optionalAuth');
const checkAuth = require('../middleware/checkAuth');
const { authLimiter } = require('../middleware/rateLimiter');
const { formatValidationErrors } = require('../utils/validationHelper');
const { setStandardHeaders } = require('../utils/standardHeaders');

const urlRoute = express.Router();

urlRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = {
    title: 'URL Shortener',
    message: 'Create and manage short URLs',
    endpoints: {
      shorten: `${host}/api/v1/url/shorten`,
      redirect: `${host}/s/:code`,
      stats: `${host}/api/v1/url/stats/:code`,
      list: `${host}/api/v1/url/list`
    },
    features: {
      anonymous: 'Create short URLs without authentication',
      authenticated: 'Track and manage your URLs',
      custom_alias: 'Create custom short codes',
      expiration: 'Set expiration time',
      statistics: 'View click statistics'
    },
    examples: {
      simple: `POST ${host}/api/v1/url/shorten with {"url": "https://example.com"}`,
      custom: `POST ${host}/api/v1/url/shorten with {"url": "https://example.com", "customAlias": "mylink"}`,
      expiring: `POST ${host}/api/v1/url/shorten with {"url": "https://example.com", "expiresIn": 86400000}`
    }
  };
  setStandardHeaders(res, data);
  res.json(data);
});

urlRoute.post('/shorten',
  cors(),
  optionalAuth,
  authLimiter,
  body('url').isURL().withMessage('Valid URL is required'),
  body('customAlias').optional().matches(/^[a-zA-Z0-9-_]+$/).isLength({ min: 3, max: 50 })
    .withMessage('Custom alias must be 3-50 characters and contain only letters, numbers, hyphens, and underscores'),
  body('expiresIn').optional().isInt({ min: 60000, max: 31536000000 })
    .withMessage('Expiration must be between 1 minute and 1 year'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const data = { 
        success: false,
        errors: formatValidationErrors(errors.array())
      };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }

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
      
      const data = {
        success: true,
        data: result
      };
      setStandardHeaders(res, data);
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

urlRoute.get('/stats/:code',
  cors(),
  optionalAuth,
  param('code').notEmpty().withMessage('Code is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const data = { 
        success: false,
        errors: formatValidationErrors(errors.array())
      };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }

    try {
      const userId = req.isAuthenticated && req.user ? 
        await authController.getUserId(req.user).catch(() => null) : null;
      
      const stats = await urlController.getUrlStats(req.params.code, userId);
      
      const data = {
        success: true,
        data: stats
      };
      setStandardHeaders(res, data);
      res.json(data);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('access') ? 403 : 500;
      const data = { 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
      setStandardHeaders(res, data);
      res.status(statusCode).json(data);
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
      
      const data = {
        success: true,
        data: urls
      };
      setStandardHeaders(res, data);
      res.json(data);
    } catch (error) {
      const data = { 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
      setStandardHeaders(res, data);
      res.status(500).json(data);
    }
  }
);

// Redirect endpoint (separate from API routes)
urlRoute.get('/redirect/:code',
  cors(),
  param('code').notEmpty().withMessage('Code is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const data = { 
        success: false,
        errors: formatValidationErrors(errors.array())
      };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }

    try {
      const url = await urlController.getUrlByCode(req.params.code);
      
      // For API endpoint, return the URL instead of redirecting
      const data = {
        success: true,
        data: {
          originalUrl: url.originalUrl,
          clicks: url.clicks
        }
      };
      setStandardHeaders(res, data);
      res.json(data);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('expired') ? 410 : 500;
      const data = { 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
      setStandardHeaders(res, data);
      res.status(statusCode).json(data);
    }
  }
);

module.exports = urlRoute;