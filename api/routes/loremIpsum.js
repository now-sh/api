const express = require('express'); const { Request, Response } = require('express');
const { param, body, validationResult } = require('express-validator');
const cors = require('cors');
const loremController = require('../controllers/lorem');
const { formatValidationErrors } = require('../utils/validationHelper');
const { setStandardHeaders } = require('../utils/standardHeaders');

const loremRoute = express.Router();

loremRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = {
    title: 'Lorem Ipsum Generator',
    message: 'Generate placeholder text',
    endpoints: {
      sentences: `${host}/api/v1/lorem/sentences/:number`,
      paragraphs: `${host}/api/v1/lorem/paragraphs/:paragraphs/:sentences`,
      json: 'Add /json to any endpoint for JSON format'
    },
    examples: {
      sentences: `GET ${host}/api/v1/lorem/sentences/4`,
      sentences_json: `GET ${host}/api/v1/lorem/sentences/4/json`,
      paragraphs: `GET ${host}/api/v1/lorem/paragraphs/3/5`,
      paragraphs_json: `GET ${host}/api/v1/lorem/paragraphs/3/5/json`
    }
  };
  setStandardHeaders(res, data);
  res.json(data);
});

loremRoute.get('/sentences/:number', 
  cors(),
  param('number').isInt({ min: 1, max: 50 }).withMessage('Number must be between 1 and 50'),
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

    const numberOfSentences = parseInt(req.params.number);
    const result = loremController.generateSentences(numberOfSentences);
    
    const data = {
      ...result,
      format: 'plain'
    };
    setStandardHeaders(res, data);
    res.json(data);
  }
);

loremRoute.get('/sentences/:number/json', 
  cors(),
  param('number').isInt({ min: 1, max: 50 }).withMessage('Number must be between 1 and 50'),
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

    const numberOfSentences = parseInt(req.params.number);
    const result = loremController.generateSentences(numberOfSentences);
    
    const data = {
      ...result,
      format: 'json'
    };
    setStandardHeaders(res, data);
    res.json(data);
  }
);

loremRoute.get('/paragraphs/:paragraphs/:sentences',
  cors(),
  param('paragraphs').isInt({ min: 1, max: 20 }).withMessage('Paragraphs must be between 1 and 20'),
  param('sentences').isInt({ min: 1, max: 10 }).withMessage('Sentences must be between 1 and 10'),
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

    const numberOfParagraphs = parseInt(req.params.paragraphs);
    const sentencesPerParagraph = parseInt(req.params.sentences);
    const result = loremController.generateParagraphs(numberOfParagraphs, sentencesPerParagraph);
    
    const data = {
      ...result,
      format: 'plain'
    };
    setStandardHeaders(res, data);
    res.json(data);
  }
);

loremRoute.get('/paragraphs/:paragraphs/:sentences/json',
  cors(),
  param('paragraphs').isInt({ min: 1, max: 20 }).withMessage('Paragraphs must be between 1 and 20'),
  param('sentences').isInt({ min: 1, max: 10 }).withMessage('Sentences must be between 1 and 10'),
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

    const numberOfParagraphs = parseInt(req.params.paragraphs);
    const sentencesPerParagraph = parseInt(req.params.sentences);
    const result = loremController.generateParagraphs(numberOfParagraphs, sentencesPerParagraph);
    
    const data = {
      ...result,
      format: 'json'
    };
    setStandardHeaders(res, data);
    res.json(data);
  }
);

loremRoute.post('/generate',
  cors(),
  body('sentences').optional().isInt({ min: 1, max: 50 }),
  body('paragraphs').optional().isInt({ min: 1, max: 20 }),
  body('sentencesPerParagraph').optional().isInt({ min: 1, max: 10 }),
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

    const { sentences, paragraphs, sentencesPerParagraph = 5 } = req.body;
    
    if (!sentences && !paragraphs) {
      const data = { 
        success: false,
        error: 'Specify either sentences or paragraphs' 
      };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }
    
    if (sentences && paragraphs) {
      const data = { 
        success: false,
        error: 'Specify only one of sentences or paragraphs' 
      };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }
    
    try {
      const result = loremController.generateCustom({ sentences, paragraphs, sentencesPerParagraph });
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
      res.status(400).json(data);
    }
  }
);

module.exports = loremRoute;