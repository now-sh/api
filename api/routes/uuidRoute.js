const express = require('express'); const { Request, Response } = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const uuidController = require('../controllers/uuid');
const { formatValidationErrors } = require('../utils/validationHelper');
const { setStandardHeaders } = require('../utils/standardHeaders');

const uuidRoute = express.Router();

uuidRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = {
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
  };
  setStandardHeaders(res, data);
  res.json(data);
});

uuidRoute.get('/v4', cors(), (req, res) => {
  try {
    const result = uuidController.generateUUID();
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
    res.status(500).json(data);
  }
});

uuidRoute.post('/generate',
  cors(),
  body('uppercase').optional().isBoolean().withMessage('uppercase must be boolean'),
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