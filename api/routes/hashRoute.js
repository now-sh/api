const express = require('express');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const hashController = require('../controllers/hash');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const hashRoute = express.Router();

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
 * Generate hash - JSON response
 */
hashRoute.post('/:algorithm',
  cors(),
  param('algorithm').isIn(hashController.getSupportedAlgorithms()).withMessage('Invalid algorithm'),
  body('text').notEmpty().withMessage('Text is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = hashController.hashText(req.body.text, req.params.algorithm);
      sendJSON(res, formatSuccess({
        original: req.body.text,
        algorithm: req.params.algorithm,
        hash: result.hash,
        length: result.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate hash - Text response
 */
hashRoute.post('/:algorithm/text',
  cors(),
  param('algorithm').isIn(hashController.getSupportedAlgorithms()).withMessage('Invalid algorithm'),
  body('text').notEmpty().withMessage('Text is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = hashController.hashText(req.body.text, req.params.algorithm);
      sendText(res, result.hash);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Generate hash via GET - JSON response
 */
hashRoute.get('/:algorithm/:text',
  cors(),
  param('algorithm').isIn(hashController.getSupportedAlgorithms()).withMessage('Invalid algorithm'),
  param('text').notEmpty().withMessage('Text is required'),
  validateRequest,
  (req, res) => {
    try {
      const text = decodeURIComponent(req.params.text);
      const result = hashController.hashText(text, req.params.algorithm);
      sendJSON(res, formatSuccess({
        original: text,
        algorithm: req.params.algorithm,
        hash: result.hash,
        length: result.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate hash via GET - Text response
 */
hashRoute.get('/:algorithm/:text/text',
  cors(),
  param('algorithm').isIn(hashController.getSupportedAlgorithms()).withMessage('Invalid algorithm'),
  param('text').notEmpty().withMessage('Text is required'),
  validateRequest,
  (req, res) => {
    try {
      const text = decodeURIComponent(req.params.text);
      const result = hashController.hashText(text, req.params.algorithm);
      sendText(res, result.hash);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Hash multiple texts at once
 */
hashRoute.post('/:algorithm/batch',
  cors(),
  param('algorithm').isIn(hashController.getSupportedAlgorithms()).withMessage('Invalid algorithm'),
  body('texts').isArray({ min: 1 }).withMessage('Texts array is required'),
  validateRequest,
  (req, res) => {
    try {
      const results = req.body.texts.map(text => {
        const result = hashController.hashText(text, req.params.algorithm);
        return {
          original: text,
          hash: result.hash
        };
      });

      sendJSON(res, formatSuccess({
        algorithm: req.params.algorithm,
        results,
        count: results.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Compare hash with text
 */
hashRoute.post('/:algorithm/verify',
  cors(),
  param('algorithm').isIn(hashController.getSupportedAlgorithms()).withMessage('Invalid algorithm'),
  body('text').notEmpty().withMessage('Text is required'),
  body('hash').notEmpty().withMessage('Hash is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = hashController.hashText(req.body.text, req.params.algorithm);
      const matches = result.hash.toLowerCase() === req.body.hash.toLowerCase();
      
      sendJSON(res, formatSuccess({
        original: req.body.text,
        algorithm: req.params.algorithm,
        expectedHash: req.body.hash,
        actualHash: result.hash,
        matches
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Get supported algorithms
 */
hashRoute.get('/algorithms', cors(), (req, res) => {
  const algorithms = hashController.getSupportedAlgorithms();
  sendJSON(res, formatSuccess({
    algorithms,
    count: algorithms.length
  }));
});

/**
 * Help endpoint
 */
hashRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const algorithms = hashController.getSupportedAlgorithms();
  
  const data = formatSuccess({
    title: 'Hash Generator',
    message: 'Generate hashes using various algorithms',
    endpoints: {
      hash: {
        json: `POST ${host}/api/v1/tools/hash/:algorithm`,
        text: `POST ${host}/api/v1/tools/hash/:algorithm/text`,
        get: `GET ${host}/api/v1/tools/hash/:algorithm/:text`,
        getText: `GET ${host}/api/v1/tools/hash/:algorithm/:text/text`
      },
      batch: `POST ${host}/api/v1/tools/hash/:algorithm/batch`,
      verify: `POST ${host}/api/v1/tools/hash/:algorithm/verify`,
      algorithms: `GET ${host}/api/v1/tools/hash/algorithms`
    },
    algorithms,
    parameters: {
      algorithm: `Hash algorithm (${algorithms.join(', ')})`,
      text: 'Text to hash (POST body or GET parameter)',
      texts: 'Array of texts for batch hashing',
      hash: 'Hash to verify against'
    },
    examples: {
      hashPost: `POST ${host}/api/v1/tools/hash/sha256 {"text": "Hello World"}`,
      hashGet: `GET ${host}/api/v1/tools/hash/md5/password123`,
      hashText: `GET ${host}/api/v1/tools/hash/sha1/Hello%20World/text`,
      batch: `POST ${host}/api/v1/tools/hash/sha256/batch {"texts": ["text1", "text2"]}`,
      verify: `POST ${host}/api/v1/tools/hash/md5/verify {"text": "hello", "hash": "5d41402abc4b2a76b9719d911017c592"}`
    }
  });
  
  sendJSON(res, data);
});

module.exports = hashRoute;