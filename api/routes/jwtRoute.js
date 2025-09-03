const express = require('express');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const jwtController = require('../controllers/jwt');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const jwtRoute = express.Router();

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
 * Decode JWT - JSON response
 */
jwtRoute.post('/decode',
  cors(),
  body('token').notEmpty().withMessage('JWT token is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = jwtController.decodeJWT(req.body.token);
      sendJSON(res, formatSuccess({
        token: req.body.token,
        header: result.header,
        payload: result.payload,
        signature: result.signature,
        expired: result.expired,
        valid: result.valid
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Decode JWT - Text response
 */
jwtRoute.post('/decode/text',
  cors(),
  body('token').notEmpty().withMessage('JWT token is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = jwtController.decodeJWT(req.body.token);
      const output = `Header: ${JSON.stringify(result.header, null, 2)}\n\nPayload: ${JSON.stringify(result.payload, null, 2)}\n\nExpired: ${result.expired}\nValid: ${result.valid}`;
      sendText(res, output);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Validate JWT with secret - JSON response
 */
jwtRoute.post('/validate',
  cors(),
  body('token').notEmpty().withMessage('JWT token is required'),
  body('secret').notEmpty().withMessage('Secret is required for validation'),
  validateRequest,
  (req, res) => {
    try {
      const result = jwtController.decodeJWT(req.body.token, {
        secret: req.body.secret
      });
      sendJSON(res, formatSuccess({
        token: req.body.token,
        header: result.header,
        payload: result.payload,
        signature: result.signature,
        expired: result.expired,
        valid: result.valid,
        signatureValid: result.signatureValid
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Validate JWT with secret - Text response
 */
jwtRoute.post('/validate/text',
  cors(),
  body('token').notEmpty().withMessage('JWT token is required'),
  body('secret').notEmpty().withMessage('Secret is required for validation'),
  validateRequest,
  (req, res) => {
    try {
      const result = jwtController.decodeJWT(req.body.token, {
        secret: req.body.secret
      });
      const status = result.valid && result.signatureValid && !result.expired ? 'VALID' : 'INVALID';
      sendText(res, status);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Decode JWT via GET - JSON response
 */
jwtRoute.get('/decode/:token',
  cors(),
  param('token').notEmpty().withMessage('JWT token is required'),
  validateRequest,
  (req, res) => {
    try {
      const token = decodeURIComponent(req.params.token);
      const result = jwtController.decodeJWT(token);
      sendJSON(res, formatSuccess({
        token,
        header: result.header,
        payload: result.payload,
        signature: result.signature,
        expired: result.expired,
        valid: result.valid
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Decode JWT via GET - Text response
 */
jwtRoute.get('/decode/:token/text',
  cors(),
  param('token').notEmpty().withMessage('JWT token is required'),
  validateRequest,
  (req, res) => {
    try {
      const token = decodeURIComponent(req.params.token);
      const result = jwtController.decodeJWT(token);
      const output = `Header: ${JSON.stringify(result.header, null, 2)}\n\nPayload: ${JSON.stringify(result.payload, null, 2)}\n\nExpired: ${result.expired}\nValid: ${result.valid}`;
      sendText(res, output);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Help endpoint
 */
jwtRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'JWT Decoder & Validator',
    message: 'Decode and validate JSON Web Tokens',
    endpoints: {
      decode: {
        json: `POST ${host}/api/v1/tools/jwt/decode`,
        text: `POST ${host}/api/v1/tools/jwt/decode/text`,
        get: `GET ${host}/api/v1/tools/jwt/decode/:token`,
        getText: `GET ${host}/api/v1/tools/jwt/decode/:token/text`
      },
      validate: {
        json: `POST ${host}/api/v1/tools/jwt/validate`,
        text: `POST ${host}/api/v1/tools/jwt/validate/text`
      }
    },
    features: [
      'Decode JWT header and payload',
      'Check token expiration',
      'Validate signature with secret',
      'Display claims and metadata'
    ],
    parameters: {
      token: 'JWT token to decode/validate',
      secret: 'Secret key for signature validation (required for validate)'
    },
    examples: {
      decode: `POST ${host}/api/v1/tools/jwt/decode {"token": "eyJhbGciOiJIUzI1NiJ9..."}`,
      decodeGet: `GET ${host}/api/v1/tools/jwt/decode/eyJhbGciOiJIUzI1NiJ9...`,
      decodeText: `GET ${host}/api/v1/tools/jwt/decode/eyJhbGciOiJIUzI1NiJ9.../text`,
      validate: `POST ${host}/api/v1/tools/jwt/validate {"token": "eyJ...", "secret": "your-secret"}`
    }
  });
  
  sendJSON(res, data);
});

module.exports = jwtRoute;