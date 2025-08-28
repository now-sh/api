const express = require('express'); const { Request, Response } = require('express');
const { body, param, validationResult } = require('express-validator');
const cors = require('cors');
const passwordController = require('../controllers/password');
const { formatValidationErrors } = require('../utils/validationHelper');

const genpasswdRoute = express.Router();

genpasswdRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.json({
    title: 'Password Generator',
    message: 'Generate secure passwords with customizable options',
    endpoints: {
      simple: `${host}/api/v1/passwd/:length`,
      custom: `${host}/api/v1/passwd/generate`
    },
    options: {
      length: '4-128 characters',
      numbers: 'Include numbers',
      symbols: 'Include symbols',
      uppercase: 'Include uppercase letters',
      lowercase: 'Include lowercase letters',
      excludeSimilar: 'Exclude similar characters (ilLI1oO0)',
      exclude: 'Custom characters to exclude'
    },
    examples: {
      simple: `GET ${host}/api/v1/passwd/20`,
      custom: `POST ${host}/api/v1/passwd/generate with options`
    }
  });
});

genpasswdRoute.get('/:length',
  cors(),
  param('length').isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    try {
      const result = passwordController.generatePassword({
        length: parseInt(req.params.length)
      });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
);

genpasswdRoute.post('/generate',
  cors(),
  body('length').optional().isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'),
  body('numbers').optional().isBoolean().withMessage('numbers must be boolean'),
  body('symbols').optional().isBoolean().withMessage('symbols must be boolean'),
  body('uppercase').optional().isBoolean().withMessage('uppercase must be boolean'),
  body('lowercase').optional().isBoolean().withMessage('lowercase must be boolean'),
  body('excludeSimilar').optional().isBoolean().withMessage('excludeSimilar must be boolean'),
  body('exclude').optional().isString().withMessage('exclude must be string'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    try {
      const result = passwordController.generatePassword(req.body);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
);

// Backward compatibility
genpasswdRoute.post('/',
  cors(),
  body('length').optional().isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    try {
      const length = parseInt(req.body.length) || 16;
      const result = passwordController.generatePassword({ length });
      res.json({
        title: 'Generate Passwords',
        password: result.password,
        passwordLength: length,
        ...result
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
);

module.exports = genpasswdRoute;