const express = require('express');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const qrController = require('../controllers/qr');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const qrRoute = express.Router();

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
 * Generate QR code via GET - JSON response
 */
qrRoute.get('/generate/:text',
  cors(),
  param('text').notEmpty().withMessage('Text is required'),
  validateRequest,
  async (req, res) => {
    try {
      const text = decodeURIComponent(req.params.text);
      const result = await qrController.generateQRCode(text);
      sendJSON(res, formatSuccess({
        text,
        format: result.format,
        qrCode: result.qrCode,
        size: result.size
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate QR code via GET - Text response (ASCII art)
 */
qrRoute.get('/generate/:text/text',
  cors(),
  param('text').notEmpty().withMessage('Text is required'),
  validateRequest,
  async (req, res) => {
    try {
      const text = decodeURIComponent(req.params.text);
      const result = await qrController.generateQRCode(text, { type: 'text' });
      sendText(res, result.qrCode);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Legacy route - redirect to new route
 */
qrRoute.get('/text/:text', cors(), (req, res) => {
  res.redirect(`/api/v1/tools/qr/generate/${req.params.text}`);
});

/**
 * Generate QR code with options - JSON response
 */
qrRoute.post('/generate',
  cors(),
  body('text').notEmpty().withMessage('Text is required'),
  body('type').optional().isIn(['png', 'svg', 'text']).withMessage('Invalid type'),
  body('size').optional().isInt({ min: 50, max: 500 }).withMessage('Size must be between 50 and 500'),
  body('margin').optional().isInt({ min: 0, max: 10 }).withMessage('Margin must be between 0 and 10'),
  body('color.dark').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Dark color must be hex format'),
  body('color.light').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Light color must be hex format'),
  validateRequest,
  async (req, res) => {
    try {
      const { text, ...options } = req.body;
      const result = await qrController.generateQRCode(text, options);
      sendJSON(res, formatSuccess({
        text,
        options,
        format: result.format,
        qrCode: result.qrCode,
        size: result.size
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate QR code with options - Text response (ASCII art only)
 */
qrRoute.post('/generate/text',
  cors(),
  body('text').notEmpty().withMessage('Text is required'),
  body('size').optional().isInt({ min: 50, max: 500 }).withMessage('Size must be between 50 and 500'),
  body('margin').optional().isInt({ min: 0, max: 10 }).withMessage('Margin must be between 0 and 10'),
  validateRequest,
  async (req, res) => {
    try {
      const { text, ...options } = req.body;
      options.type = 'text'; // Force text type for text endpoint
      const result = await qrController.generateQRCode(text, options);
      sendText(res, result.qrCode);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Generate QR code for URL - JSON response
 */
qrRoute.post('/url',
  cors(),
  body('url').isURL().withMessage('Valid URL is required'),
  body('type').optional().isIn(['png', 'svg', 'text']).withMessage('Invalid type'),
  body('size').optional().isInt({ min: 50, max: 500 }).withMessage('Size must be between 50 and 500'),
  validateRequest,
  async (req, res) => {
    try {
      const { url, ...options } = req.body;
      const result = await qrController.generateQRCode(url, options);
      sendJSON(res, formatSuccess({
        url,
        format: result.format,
        qrCode: result.qrCode,
        size: result.size
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate QR code for URL via GET
 */
qrRoute.get('/url/:url',
  cors(),
  param('url').isURL().withMessage('Valid URL is required'),
  validateRequest,
  async (req, res) => {
    try {
      const url = decodeURIComponent(req.params.url);
      const result = await qrController.generateQRCode(url);
      sendJSON(res, formatSuccess({
        url,
        format: result.format,
        qrCode: result.qrCode,
        size: result.size
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Help endpoint
 */
qrRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'QR Code Generator',
    message: 'Generate QR codes in various formats',
    endpoints: {
      generate: {
        simple: `GET ${host}/api/v1/tools/qr/generate/:text`,
        simpleText: `GET ${host}/api/v1/tools/qr/generate/:text/text`,
        custom: `POST ${host}/api/v1/tools/qr/generate`,
        customText: `POST ${host}/api/v1/tools/qr/generate/text`
      },
      url: {
        post: `POST ${host}/api/v1/tools/qr/url`,
        get: `GET ${host}/api/v1/tools/qr/url/:url`
      }
    },
    formats: {
      png: 'Base64 encoded PNG image (default)',
      svg: 'SVG vector format',
      text: 'ASCII art for terminal'
    },
    parameters: {
      text: 'Text to encode in QR code',
      url: 'URL to encode in QR code',
      type: 'Output format (png, svg, text)',
      size: 'Image size in pixels (50-500)',
      margin: 'Quiet zone margin (0-10)',
      'color.dark': 'Foreground color (hex format)',
      'color.light': 'Background color (hex format)'
    },
    examples: {
      simple: `GET ${host}/api/v1/tools/qr/generate/Hello%20World`,
      simpleText: `GET ${host}/api/v1/tools/qr/generate/Hello%20World/text`,
      custom: `POST ${host}/api/v1/tools/qr/generate {"text": "Hello", "type": "svg", "size": 200}`,
      url: `POST ${host}/api/v1/tools/qr/url {"url": "https://example.com"}`
    }
  });
  
  sendJSON(res, data);
});

module.exports = qrRoute;