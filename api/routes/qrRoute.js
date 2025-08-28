const express = require('express'); const { Request, Response } = require('express');
const { body, param, validationResult } = require('express-validator');
const cors = require('cors');
const qrController = require('../controllers/qr');
const { formatValidationErrors } = require('../utils/validationHelper');

const qrRoute = express.Router();

qrRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.json({
    title: 'QR Code Generator',
    message: 'Generate QR codes in various formats',
    endpoints: {
      generate: `${host}/api/v1/qr/generate`,
      simple: `${host}/api/v1/qr/text/:text`
    },
    formats: {
      png: 'Base64 encoded PNG image (default)',
      svg: 'SVG vector format',
      text: 'ASCII art for terminal'
    },
    options: {
      size: 'Image size (50-500)',
      margin: 'Quiet zone margin',
      color: {
        dark: 'Foreground color (hex)',
        light: 'Background color (hex)'
      }
    },
    examples: {
      simple: `GET ${host}/api/v1/qr/text/Hello%20World`,
      custom: `POST ${host}/api/v1/qr/generate with options`
    }
  });
});

qrRoute.get('/text/:text',
  cors(),
  param('text').notEmpty().withMessage('Text is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    try {
      const text = decodeURIComponent(req.params.text);
      const result = await qrController.generateQRCode(text);
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

qrRoute.post('/generate',
  cors(),
  body('text').notEmpty().withMessage('Text is required'),
  body('type').optional().isIn(['png', 'svg', 'text']).withMessage('Invalid type'),
  body('size').optional().isInt({ min: 50, max: 500 }).withMessage('Size must be between 50 and 500'),
  body('margin').optional().isInt({ min: 0, max: 10 }).withMessage('Margin must be between 0 and 10'),
  body('color.dark').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Dark color must be hex format'),
  body('color.light').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Light color must be hex format'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    try {
      const { text, ...options } = req.body;
      const result = await qrController.generateQRCode(text, options);
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

module.exports = qrRoute;