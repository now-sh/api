const express = require('express'); const { Request, Response } = require('express');
const { body, param, validationResult } = require('express-validator');
const cors = require('cors');
const hashController = require('../controllers/hash');
const { formatValidationErrors } = require('../utils/validationHelper');

const hashRoute = express.Router();

hashRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.json({
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
  });
});

hashRoute.post('/:algorithm',
  cors(),
  param('algorithm').isIn(hashController.getSupportedAlgorithms()).withMessage('Invalid algorithm'),
  body('text').notEmpty().withMessage('Text is required'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    try {
      const result = hashController.hashText(req.body.text, req.params.algorithm);
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

module.exports = hashRoute;