const express = require('express');
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
      sentences: `${host}/api/v1/utilities/lorem/sentences/:number`,
      paragraphs: `${host}/api/v1/utilities/lorem/paragraphs/:paragraphs/:sentences`,
      json: 'Add ?format=json to any endpoint for JSON format'
    },
    examples: {
      sentences: `GET ${host}/api/v1/utilities/lorem/sentences/4`,
      sentences_json: `GET ${host}/api/v1/utilities/lorem/sentences/4?format=json`,
      paragraphs: `GET ${host}/api/v1/utilities/lorem/paragraphs/3/5`,
      paragraphs_json: `GET ${host}/api/v1/utilities/lorem/paragraphs/3/5?format=json`
    }
  };
  setStandardHeaders(res, data);
  res.json(data);
});

loremRoute.get('/sentences/:number', 
  cors(),
  param('number').isInt({ min: 1, max: 999 }).withMessage('Number must be between 1 and 999'),
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
    const jsonFormat = req.query.format === 'json';
    const result = loremController.generateSentences(numberOfSentences);
    
    if (jsonFormat) {
      const data = {
        text: result.text
      };
      setStandardHeaders(res, data);
      res.json(data);
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.send(result.text);
    }
  }
);


const paragraphsHandler = [
  cors(),
  param('paragraphs').isInt({ min: 1, max: 20 }).withMessage('Paragraphs must be between 1 and 20'),
  param('sentences').optional().isInt({ min: 1, max: 50 }).withMessage('Sentences must be between 1 and 50'),
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
    const sentencesPerParagraph = req.params.sentences ? parseInt(req.params.sentences) : null;
    const jsonFormat = req.query.format === 'json';
    const pTags = !!req.query.p;
    const result = loremController.generateParagraphs(numberOfParagraphs, sentencesPerParagraph);

    if (jsonFormat) {
      const data = {
        text: result.text
      };
      setStandardHeaders(res, data);
      res.json(data);
    } else {
      res.setHeader('Content-Type', 'text/plain');
      let text = result.text;
      if (pTags) {
        text = result.paragraphs.map(p => `<p>${p}</p>`).join('\n\n');
      }
      res.send(text);
    }
  }
];
loremRoute.get('/paragraphs/:paragraphs', ...paragraphsHandler);
loremRoute.get('/paragraphs/:paragraphs/:sentences', ...paragraphsHandler);


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