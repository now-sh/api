const express = require('express'); const { Request, Response } = require('express');
const { body, param, validationResult } = require('express-validator');
const cors = require('cors');
const hashController = require('../controllers/hash');
const { formatValidationErrors } = require('../utils/validationHelper');
const { setStandardHeaders } = require('../utils/standardHeaders');

const hashRoute = express.Router();

hashRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = {
    title: 'Hash Utility',
    message: 'Generate hashes using various algorithms',
    endpoints: {
      hash_text: `${host}/api/v1/hash/:algorithm`,
      algorithms: hashController.getSupportedAlgorithms()
    },
    examples: {
      sha256: `POST ${host}/api/v1/hash/sha256 with {"text": "Hello World"}`,
      md5: `POST ${host}/api/v1/hash/md5 with {"text": "password123"}`
    }
  };
  setStandardHeaders(res, data);
  res.json(data);
});

hashRoute.post('/:algorithm',
  cors(),
  param('algorithm').isIn(hashController.getSupportedAlgorithms()).withMessage('Invalid algorithm'),
  body('text').notEmpty().withMessage('Text is required'),
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
      const result = hashController.hashText(req.body.text, req.params.algorithm);
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
  }
);

module.exports = hashRoute;