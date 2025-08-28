const express = require('express'); const { Request, Response } = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');

// Middleware
const checkAuth = require('../middleware/checkAuth');
const { authLimiter } = require('../middleware/rateLimiter');

// Controller
const authController = require('../controllers/auth');
const { formatValidationErrors } = require('../utils/validationHelper');

const authRoute = express.Router();

authRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.setHeader('Content-Type', 'application/json');
  try {
    res.json({
      title: 'Authentication API',
      message: `The current api endpoint is ${host}/api/v1/auth`,
      endpoints: {
        info: `${host}/api/v1/auth/me`,
        login: `${host}/api/v1/auth/login`,
        signup: `${host}/api/v1/auth/signup`,
        update: `${host}/api/v1/auth/update`,
        rotate: `${host}/api/v1/auth/rotate`,
        tokens: `${host}/api/v1/auth/tokens`,
        revoke: `${host}/api/v1/auth/revoke`,
        revokeAll: `${host}/api/v1/auth/revoke-all`,
        demo: `${host}/api/v1/auth/demo`
      },
      examples: {
        login_body: '{ "email": "yourEmail", "password": "yourPassword" }',
        signup_body: '{ "name": "yourName", "email": "yourEmail", "password": "yourPassword" }',
        auth_header: 'Authorization: Bearer YOUR_TOKEN',
        curl_examples: {
          signup: `curl -X POST ${host}/api/v1/auth/signup -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","password":"test123"}'`,
          login: `curl -X POST ${host}/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'`,
          me: `curl ${host}/api/v1/auth/me -H "Authorization: Bearer YOUR_TOKEN"`
        }
      },
      token_info: {
        how_to_get: 'Login or signup to receive a JWT token',
        usage: 'Include token in Authorization header as "Bearer YOUR_TOKEN"',
        expiry: 'Never expires',
        format: 'JWT (JSON Web Token)'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'An error occurred' });
  }
});

authRoute.get('/me', cors(), checkAuth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    
    const user = await authController.getUser(req.user);
    
    res.json({
      success: true,
      errors: [],
      data: { user }
    });
  } catch (error) {
    res.status(404).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    });
  }
});

authRoute.post(
  '/signup',
  cors(),
  authLimiter,
  body('email').isEmail().withMessage('The email is invalid'),
  body('password').isLength({ min: 5 }).withMessage('The password must be at least 5 characters'),
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(validationErrors.array()),
        data: null 
      });
    }

    const { email, password, name } = req.body;
    
    try {
      const result = await authController.signup(email, password, name);
      
      res.json({
        success: true,
        errors: [],
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        errors: [{
          msg: error instanceof Error ? error.message : 'An error occurred'
        }],
        data: null
      });
    }
  }
);

authRoute.post(
  '/login', 
  cors(), 
  authLimiter,
  body('email').isEmail().withMessage('The email is invalid'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(validationErrors.array()),
        data: null 
      });
    }

    const { email, password } = req.body;
    
    try {
      const result = await authController.login(email, password);
      
      res.json({
        success: true,
        errors: [],
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        errors: [{
          msg: error instanceof Error ? error.message : 'An error occurred'
        }],
        data: null
      });
    }
  }
);

authRoute.put(
  '/update',
  cors(),
  checkAuth,
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('password').optional().isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),
  async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(validationErrors.array())
      });
    }

    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      
      const user = await authController.updateProfile(req.user, req.body);
      
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
);

// Token rotation endpoint
authRoute.post(
  '/rotate',
  cors(),
  checkAuth,
  body('revokeOld').optional().isBoolean().withMessage('revokeOld must be boolean'),
  async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(validationErrors.array())
      });
    }

    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided');
      }
      
      const oldToken = authHeader.substring(7);
      const revokeOld = req.body.revokeOld !== false; // Default to true
      
      const result = await authController.rotateToken(oldToken, revokeOld);
      
      res.json({
        success: true,
        data: {
          ...result,
          revokedOldToken: revokeOld
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
);

// Get user's active tokens
authRoute.get('/tokens', cors(), checkAuth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    
    const tokens = await authController.getUserTokens(req.user);
    
    res.json({
      success: true,
      data: {
        tokens,
        count: tokens.length
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    });
  }
});

// Revoke specific token
authRoute.post(
  '/revoke',
  cors(),
  checkAuth,
  body('token').optional().isString().withMessage('Token must be string'),
  async (req, res) => {
    try {
      // If no token provided, revoke the current token
      const tokenToRevoke = req.body.token || req.headers.authorization?.substring(7);
      
      if (!tokenToRevoke) {
        throw new Error('No token to revoke');
      }
      
      await authController.revokeToken(tokenToRevoke);
      
      res.json({
        success: true,
        message: 'Token revoked successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
);

// Revoke all user tokens
authRoute.post('/revoke-all', cors(), checkAuth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    
    const count = await authController.revokeAllUserTokens(req.user);
    
    res.json({
      success: true,
      message: `Revoked ${count} tokens`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    });
  }
});

// Demo endpoint to show how token generation works
authRoute.get('/demo', cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.json({
    title: 'Authentication Demo',
    message: 'This shows how to create, use, and rotate tokens',
    steps: [
      {
        step: 1,
        action: 'Create Account',
        endpoint: 'POST /api/v1/auth/signup',
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'securepassword123'
        },
        response: {
          success: true,
          data: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: {
              id: '507f1f77bcf86cd799439011',
              email: 'john@example.com',
              name: 'John Doe'
            }
          }
        }
      },
      {
        step: 2,
        action: 'Use Token',
        description: 'Include the token in Authorization header for authenticated requests',
        example: {
          header: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          endpoints: [
            'GET /api/v1/auth/me',
            'PUT /api/v1/auth/update',
            'GET /api/v1/auth/tokens',
            'POST /api/v1/todos (if authenticated)',
            'POST /api/v1/notes (if authenticated)'
          ]
        }
      },
      {
        step: 3,
        action: 'Rotate Token',
        description: 'Generate a new token and optionally revoke the old one',
        endpoint: 'POST /api/v1/auth/rotate',
        headers: {
          'Authorization': 'Bearer YOUR_CURRENT_TOKEN'
        },
        body: {
          revokeOld: true  // Optional, defaults to true
        },
        response: {
          success: true,
          data: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...NEW_TOKEN',
            user: {
              id: '507f1f77bcf86cd799439011',
              email: 'john@example.com',
              name: 'John Doe'
            },
            revokedOldToken: true
          }
        }
      },
      {
        step: 4,
        action: 'View Active Tokens',
        endpoint: 'GET /api/v1/auth/tokens',
        description: 'See all your active tokens (truncated for security)',
        response: {
          success: true,
          data: {
            tokens: [
              {
                token: 'eyJhbGciOiJIUzI1NiI...',
                createdAt: '2024-01-01T00:00:00.000Z',
                lastUsedAt: '2024-01-01T12:00:00.000Z',
                description: 'Login Token',
                isActive: true
              }
            ],
            count: 1
          }
        }
      },
      {
        step: 5,
        action: 'Revoke Token',
        endpoints: [
          {
            name: 'Revoke specific token',
            method: 'POST /api/v1/auth/revoke',
            body: { token: 'FULL_TOKEN_TO_REVOKE' }
          },
          {
            name: 'Revoke current token',
            method: 'POST /api/v1/auth/revoke',
            body: {}
          },
          {
            name: 'Revoke all tokens',
            method: 'POST /api/v1/auth/revoke-all',
            body: {}
          }
        ]
      }
    ],
    token_management: {
      rotation: {
        purpose: 'Security best practice to limit token exposure',
        endpoint: `${host}/api/v1/auth/rotate`,
        options: {
          revokeOld: 'Boolean - whether to revoke the old token (default: true)'
        }
      },
      revocation: {
        purpose: 'Invalidate compromised or unused tokens',
        endpoints: {
          single: `${host}/api/v1/auth/revoke`,
          all: `${host}/api/v1/auth/revoke-all`
        },
        note: 'Revoked tokens are immediately invalid'
      },
      tracking: {
        purpose: 'Monitor token usage',
        endpoint: `${host}/api/v1/auth/tokens`,
        info: 'Shows creation time, last use, and description'
      }
    },
    token_structure: {
      type: 'JWT (JSON Web Token)',
      payload: {
        email: 'user email address',
        iat: 'issued at timestamp'
      },
      note: 'Tokens do not expire - no exp field in payload',
      signing_algorithm: 'HS256',
      secret: 'Stored in JWT_SECRET environment variable',
      security: {
        storage: 'Tokens are tracked in database',
        validation: 'Each request checks token is still active',
        revocation: 'Tokens can be revoked individually or all at once'
      }
    }
  });
});

module.exports = authRoute;