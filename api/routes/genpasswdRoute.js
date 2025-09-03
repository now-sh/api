const express = require('express');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const passwordController = require('../controllers/password');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const genpasswdRoute = express.Router();

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
 * Generate password by length - JSON response
 */
genpasswdRoute.get('/:length',
  cors(),
  param('length').isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'),
  validateRequest,
  (req, res) => {
    try {
      const length = parseInt(req.params.length);
      const result = passwordController.generatePassword({ length });
      sendJSON(res, formatSuccess({
        password: result.password,
        length: result.length,
        strength: result.strength,
        entropy: result.entropy,
        options: result.options
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate password by length - Text response
 */
genpasswdRoute.get('/:length/text',
  cors(),
  param('length').isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'),
  validateRequest,
  (req, res) => {
    try {
      const length = parseInt(req.params.length);
      const result = passwordController.generatePassword({ length });
      sendText(res, result.password);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Generate password with options - JSON response
 */
genpasswdRoute.post('/generate',
  cors(),
  body('length').optional().isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'),
  body('numbers').optional().isBoolean().withMessage('numbers must be boolean'),
  body('symbols').optional().isBoolean().withMessage('symbols must be boolean'),
  body('uppercase').optional().isBoolean().withMessage('uppercase must be boolean'),
  body('lowercase').optional().isBoolean().withMessage('lowercase must be boolean'),
  body('excludeSimilar').optional().isBoolean().withMessage('excludeSimilar must be boolean'),
  body('exclude').optional().isString().withMessage('exclude must be string'),
  body('count').optional().isInt({ min: 1, max: 50 }).withMessage('count must be between 1 and 50'),
  validateRequest,
  (req, res) => {
    try {
      const count = parseInt(req.body.count) || 1;
      
      if (count === 1) {
        const result = passwordController.generatePassword(req.body);
        sendJSON(res, formatSuccess({
          password: result.password,
          length: result.length,
          strength: result.strength,
          entropy: result.entropy,
          options: result.options
        }));
      } else {
        const passwords = [];
        for (let i = 0; i < count; i++) {
          const result = passwordController.generatePassword(req.body);
          passwords.push(result.password);
        }
        sendJSON(res, formatSuccess({
          passwords,
          count: passwords.length,
          options: req.body
        }));
      }
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate password with options - Text response
 */
genpasswdRoute.post('/generate/text',
  cors(),
  body('length').optional().isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'),
  body('numbers').optional().isBoolean().withMessage('numbers must be boolean'),
  body('symbols').optional().isBoolean().withMessage('symbols must be boolean'),
  body('uppercase').optional().isBoolean().withMessage('uppercase must be boolean'),
  body('lowercase').optional().isBoolean().withMessage('lowercase must be boolean'),
  body('excludeSimilar').optional().isBoolean().withMessage('excludeSimilar must be boolean'),
  body('exclude').optional().isString().withMessage('exclude must be string'),
  body('count').optional().isInt({ min: 1, max: 50 }).withMessage('count must be between 1 and 50'),
  validateRequest,
  (req, res) => {
    try {
      const count = parseInt(req.body.count) || 1;
      
      if (count === 1) {
        const result = passwordController.generatePassword(req.body);
        sendText(res, result.password);
      } else {
        const passwords = [];
        for (let i = 0; i < count; i++) {
          const result = passwordController.generatePassword(req.body);
          passwords.push(result.password);
        }
        sendText(res, passwords.join('\n'));
      }
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Check password strength
 */
genpasswdRoute.post('/check',
  cors(),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = passwordController.checkPasswordStrength(req.body.password);
      sendJSON(res, formatSuccess({
        password: req.body.password,
        strength: result.strength,
        score: result.score,
        entropy: result.entropy,
        length: result.length,
        complexity: result.complexity,
        suggestions: result.suggestions
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate multiple passwords
 */
genpasswdRoute.get('/batch/:count/:length',
  cors(),
  param('count').isInt({ min: 1, max: 50 }).withMessage('Count must be between 1 and 50'),
  param('length').isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'),
  validateRequest,
  (req, res) => {
    try {
      const count = parseInt(req.params.count);
      const length = parseInt(req.params.length);
      const passwords = [];
      
      for (let i = 0; i < count; i++) {
        const result = passwordController.generatePassword({ length });
        passwords.push(result.password);
      }
      
      sendJSON(res, formatSuccess({
        passwords,
        count: passwords.length,
        length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate multiple passwords - Text response
 */
genpasswdRoute.get('/batch/:count/:length/text',
  cors(),
  param('count').isInt({ min: 1, max: 50 }).withMessage('Count must be between 1 and 50'),
  param('length').isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'),
  validateRequest,
  (req, res) => {
    try {
      const count = parseInt(req.params.count);
      const length = parseInt(req.params.length);
      const passwords = [];
      
      for (let i = 0; i < count; i++) {
        const result = passwordController.generatePassword({ length });
        passwords.push(result.password);
      }
      
      sendText(res, passwords.join('\n'));
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Help endpoint
 */
genpasswdRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'Password Generator',
    message: 'Generate secure passwords with customizable options',
    endpoints: {
      simple: {
        json: `GET ${host}/api/v1/tools/passwd/:length`,
        text: `GET ${host}/api/v1/tools/passwd/:length/text`
      },
      custom: {
        json: `POST ${host}/api/v1/tools/passwd/generate`,
        text: `POST ${host}/api/v1/tools/passwd/generate/text`
      },
      batch: {
        json: `GET ${host}/api/v1/tools/passwd/batch/:count/:length`,
        text: `GET ${host}/api/v1/tools/passwd/batch/:count/:length/text`
      },
      check: `POST ${host}/api/v1/tools/passwd/check`
    },
    options: {
      length: '4-128 characters (default: 16)',
      numbers: 'Include numbers (default: true)',
      symbols: 'Include symbols (default: true)',
      uppercase: 'Include uppercase letters (default: true)',
      lowercase: 'Include lowercase letters (default: true)',
      excludeSimilar: 'Exclude similar characters ilLI1oO0 (default: false)',
      exclude: 'Custom characters to exclude',
      count: 'Number of passwords to generate (1-50)'
    },
    parameters: {
      length: 'Password length',
      count: 'Number of passwords',
      password: 'Password to check strength'
    },
    examples: {
      simple: `GET ${host}/api/v1/tools/passwd/20`,
      simpleText: `GET ${host}/api/v1/tools/passwd/20/text`,
      custom: `POST ${host}/api/v1/tools/passwd/generate {"length": 24, "symbols": false, "count": 5}`,
      batch: `GET ${host}/api/v1/tools/passwd/batch/10/16`,
      check: `POST ${host}/api/v1/tools/passwd/check {"password": "MyP@ssw0rd123"}`
    }
  });
  
  sendJSON(res, data);
});

// Backward compatibility
genpasswdRoute.post('/',
  cors(),
  body('length').optional().isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'),
  validateRequest,
  (req, res) => {
    try {
      const length = parseInt(req.body.length) || 16;
      const result = passwordController.generatePassword({ length });
      // Legacy format for backward compatibility
      const data = formatSuccess({
        title: 'Generate Passwords',
        password: result.password,
        passwordLength: length,
        ...result
      });
      sendJSON(res, data);
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

module.exports = genpasswdRoute;