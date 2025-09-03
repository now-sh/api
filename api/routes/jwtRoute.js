const express = require('express'); const { Request, Response } = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const jwtController = require('../controllers/jwt');
const { formatValidationErrors } = require('../utils/validationHelper');
const { setStandardHeaders } = require('../utils/standardHeaders');

const jwtRoute = express.Router();

jwtRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = {
    title: 'JWT Decoder & Validator',
    message: 'Decode and validate JSON Web Tokens',
    endpoints: {
      decode: `${host}/api/v1/jwt/decode`,
      validate: `${host}/api/v1/jwt/validate`
    },
    features: [
      'Decode JWT header and payload',
      'Check token expiration',
      'Validate signature with secret',
      'Display claims and metadata'
    ],
    examples: {
      decode: `POST ${host}/api/v1/jwt/decode with {"token": "eyJ..."}`,
      validate: `POST ${host}/api/v1/jwt/validate with {"token": "eyJ...", "secret": "your-secret"}`
    }
  };
  setStandardHeaders(res, data);
  res.json(data);
});

jwtRoute.post('/decode',
  cors(),
  body('token').notEmpty().withMessage('JWT token is required'),
  (req, res) => {
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
      const result = jwtController.decodeJWT(req.body.token);
      const data = {
        success: true,
        data: result
      };
      setStandardHeaders(res, data);
      res.json(data);
    } catch (error) {
      const data = { 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
      setStandardHeaders(res, data);
      res.status(400).json(data);
    }
  }
);

jwtRoute.post('/validate',
  cors(),
  body('token').notEmpty().withMessage('JWT token is required'),
  body('secret').notEmpty().withMessage('Secret is required for validation'),
  (req, res) => {
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
      const result = jwtController.decodeJWT(req.body.token, {
        secret: req.body.secret
      });
      const data = {
        success: true,
        data: result
      };
      setStandardHeaders(res, data);
      res.json(data);
    } catch (error) {
      const data = { 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
      setStandardHeaders(res, data);
      res.status(400).json(data);
    }
  }
);

module.exports = jwtRoute;