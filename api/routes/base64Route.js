const express = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const { setStandardHeaders } = require('../utils/standardHeaders');
const base64Controller = require('../controllers/base64');
const { formatValidationErrors } = require('../utils/validationHelper');

const base64Route = express.Router();

base64Route.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const helpData = {
    title: 'Base64 Encode/Decode Utility',
    endpoints: {
      encode: `${host}/api/v1/base64/encode`,
      decode: `${host}/api/v1/base64/decode`
    },
    cli_examples: {
      encode: `curl -X POST ${host}/api/v1/base64/encode -d "text=Hello World"`,
      decode: `curl -X POST ${host}/api/v1/base64/decode -d "text=SGVsbG8gV29ybGQ="`,
      encode_file: `curl -X POST ${host}/api/v1/base64/encode -d "text=$(cat file.txt)"`,
      pipe: `echo "Hello" | curl -X POST ${host}/api/v1/base64/encode -d @-`
    }
  };
  setStandardHeaders(res, helpData);
  res.json(helpData);
});

base64Route.post('/encode',
  cors(),
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
      const result = base64Controller.encode(req.body.text);
      const data = {
        success: true,
        data: result
      };
      setStandardHeaders(res, data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
);

base64Route.post('/decode',
  cors(),
  body('text').notEmpty().withMessage('Base64 text is required'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    try {
      const result = base64Controller.decode(req.body.text);
      const data = {
        success: true,
        data: result
      };
      setStandardHeaders(res, data);
      res.json(data);
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
);

// GET method alternatives for simple encoding
base64Route.get('/encode/:text', cors(), (req, res) => {
  try {
    const text = decodeURIComponent(req.params.text);
    const result = base64Controller.encode(text);
    const data = { 
      success: true,
      data: result 
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    });
  }
});

base64Route.get('/decode/:text', cors(), (req, res) => {
  try {
    const result = base64Controller.decode(req.params.text);
    const data = { 
      success: true,
      data: result 
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    });
  }
});

module.exports = base64Route;