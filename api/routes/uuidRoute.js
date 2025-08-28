const express = require('express'); const { Request, Response } = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const uuidController = require('../controllers/uuid');
const { formatValidationErrors } = require('../utils/validationHelper');

const uuidRoute = express.Router();

uuidRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.json({
    title: 'UUID Generator',
    message: 'Generate universally unique identifiers',
    endpoints: {
      generate: `${host}/api/v1/uuid/generate`,
      generate_simple: `${host}/api/v1/uuid/v4`
    },
    examples: {
      simple: `GET ${host}/api/v1/uuid/v4`,
      customized: `POST ${host}/api/v1/uuid/generate with {"uppercase": true}`
    }
  });
});

uuidRoute.get('/v4', cors(), (req, res) => {
  try {
    const result = uuidController.generateUUID();
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
});

uuidRoute.post('/generate',
  cors(),
  body('uppercase').optional().isBoolean().withMessage('uppercase must be boolean'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    try {
      const options = {
        uppercase: req.body.uppercase || false
      };
      const result = uuidController.generateUUID(options);
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

module.exports = uuidRoute;