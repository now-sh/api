const express = require('express');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const base64Controller = require('../controllers/base64');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const base64Route = express.Router();

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
 * Encode text to base64 - JSON response
 */
base64Route.post('/encode',
  cors(),
  body('text').notEmpty().withMessage('Text is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = base64Controller.encode(req.body.text);
      sendJSON(res, formatSuccess({
        original: result.input,
        encoded: result.result,
        length: result.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Encode text to base64 - Text response
 */
base64Route.post('/encode/text',
  cors(),
  body('text').notEmpty().withMessage('Text is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = base64Controller.encode(req.body.text);
      sendText(res, result.result);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Decode base64 to text - JSON response
 */
base64Route.post('/decode',
  cors(),
  body('text').notEmpty().withMessage('Base64 text is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = base64Controller.decode(req.body.text);
      sendJSON(res, formatSuccess({
        original: req.body.text,
        decoded: result.result,
        length: result.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Decode base64 to text - Text response
 */
base64Route.post('/decode/text',
  cors(),
  body('text').notEmpty().withMessage('Base64 text is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = base64Controller.decode(req.body.text);
      sendText(res, result.result);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Encode via GET - JSON response
 */
base64Route.get('/encode/:text',
  cors(),
  param('text').notEmpty().withMessage('Text is required'),
  validateRequest,
  (req, res) => {
    try {
      const text = decodeURIComponent(req.params.text);
      const result = base64Controller.encode(text);
      sendJSON(res, formatSuccess({
        original: result.input,
        encoded: result.result,
        length: result.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Encode via GET - Text response
 */
base64Route.get('/encode/:text/text',
  cors(),
  param('text').notEmpty().withMessage('Text is required'),
  validateRequest,
  (req, res) => {
    try {
      const text = decodeURIComponent(req.params.text);
      const result = base64Controller.encode(text);
      sendText(res, result.result);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Decode via GET - JSON response
 */
base64Route.get('/decode/:text',
  cors(),
  param('text').notEmpty().withMessage('Base64 text is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = base64Controller.decode(req.params.text);
      sendJSON(res, formatSuccess({
        original: req.params.text,
        decoded: result.result,
        length: result.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Decode via GET - Text response
 */
base64Route.get('/decode/:text/text',
  cors(),
  param('text').notEmpty().withMessage('Base64 text is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = base64Controller.decode(req.params.text);
      sendText(res, result.result);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Help endpoint
 */
base64Route.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = formatSuccess({
    title: 'Base64 Encoder/Decoder',
    message: 'Encode and decode Base64 strings',
    endpoints: {
      encode: {
        json: `POST ${host}/api/v1/tools/base64/encode`,
        text: `POST ${host}/api/v1/tools/base64/encode/text`,
        get: `GET ${host}/api/v1/tools/base64/encode/:text`,
        getText: `GET ${host}/api/v1/tools/base64/encode/:text/text`
      },
      decode: {
        json: `POST ${host}/api/v1/tools/base64/decode`,
        text: `POST ${host}/api/v1/tools/base64/decode/text`,
        get: `GET ${host}/api/v1/tools/base64/decode/:text`,
        getText: `GET ${host}/api/v1/tools/base64/decode/:text/text`
      }
    },
    parameters: {
      text: 'Text to encode/decode (POST body or GET parameter)'
    },
    examples: {
      encodePost: `POST ${host}/api/v1/tools/base64/encode {"text": "Hello World"}`,
      encodeGet: `GET ${host}/api/v1/tools/base64/encode/Hello%20World`,
      encodeText: `GET ${host}/api/v1/tools/base64/encode/Hello%20World/text`,
      decode: `GET ${host}/api/v1/tools/base64/decode/SGVsbG8gV29ybGQ%3D`
    }
  });
  
  sendJSON(res, data);
});

module.exports = base64Route;