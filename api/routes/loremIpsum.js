const express = require('express'); const { Request, Response } = require('express');
const { param, body, validationResult } = require('express-validator');
const cors = require('cors');
const loremController = require('../controllers/lorem');
const { formatValidationErrors } = require('../utils/validationHelper');

const loremRoute = express.Router();

loremRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.json({
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
  });
});

loremRoute.get('/sentences/:number', 
  cors(),
  param('number').isInt({ min: 1, max: 50 }).withMessage('Number must be between 1 and 50'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    const numberOfSentences = parseInt(req.params.number);
    const result = loremController.generateSentences(numberOfSentences);
    
    res.json({
      ...result,
      format: 'plain'
    });
  }
);

loremRoute.get('/sentences/:number/json', 
  cors(),
  param('number').isInt({ min: 1, max: 50 }).withMessage('Number must be between 1 and 50'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    const numberOfSentences = parseInt(req.params.number);
    const result = loremController.generateSentences(numberOfSentences);
    
    res.json({
      ...result,
      format: 'json'
    });
  }
);

loremRoute.get('/paragraphs/:paragraphs/:sentences',
  cors(),
  param('paragraphs').isInt({ min: 1, max: 20 }).withMessage('Paragraphs must be between 1 and 20'),
  param('sentences').isInt({ min: 1, max: 10 }).withMessage('Sentences must be between 1 and 10'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    const numberOfParagraphs = parseInt(req.params.paragraphs);
    const sentencesPerParagraph = parseInt(req.params.sentences);
    const result = loremController.generateParagraphs(numberOfParagraphs, sentencesPerParagraph);
    
    res.json({
      ...result,
      format: 'plain'
    });
  }
);

loremRoute.get('/paragraphs/:paragraphs/:sentences/json',
  cors(),
  param('paragraphs').isInt({ min: 1, max: 20 }).withMessage('Paragraphs must be between 1 and 20'),
  param('sentences').isInt({ min: 1, max: 10 }).withMessage('Sentences must be between 1 and 10'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    const numberOfParagraphs = parseInt(req.params.paragraphs);
    const sentencesPerParagraph = parseInt(req.params.sentences);
    const result = loremController.generateParagraphs(numberOfParagraphs, sentencesPerParagraph);
    
    res.json({
      ...result,
      format: 'json'
    });
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
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    const { sentences, paragraphs, sentencesPerParagraph = 5 } = req.body;
    
    if (!sentences && !paragraphs) {
      return res.status(400).json({ 
        success: false,
        error: 'Specify either sentences or paragraphs' 
      });
    }
    
    if (sentences && paragraphs) {
      return res.status(400).json({ 
        success: false,
        error: 'Specify only one of sentences or paragraphs' 
      });
    }
    
    try {
      const result = loremController.generateCustom({ sentences, paragraphs, sentencesPerParagraph });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
);

module.exports = loremRoute;