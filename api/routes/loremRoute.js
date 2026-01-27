const express = require('express');
const cors = require('cors');
const { param, body, validationResult } = require('express-validator');
const loremController = require('../controllers/lorem');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const loremRoute = express.Router();

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
 * Get sentences - JSON response
 */
const sentencesHandler = [
  cors(),
  param('count').optional().isInt({ min: 1, max: 999 }).withMessage('Count must be between 1 and 999'),
  validateRequest,
  (req, res) => {
    const count = parseInt(req.params.count || req.query.count || 4);
    const result = loremController.generateSentences(count);

    sendJSON(res, formatSuccess({
      text: result.text,
      sentences: result.sentences,
      count: result.count
    }), { noCache: true });
  }
];
loremRoute.get('/sentences', ...sentencesHandler);
loremRoute.get('/sentences/:count', ...sentencesHandler);

/**
 * Get sentences - Text response
 */
const sentencesTextHandler = [
  cors(),
  param('count').optional().isInt({ min: 1, max: 999 }),
  validateRequest,
  (req, res) => {
    const count = parseInt(req.params.count || 4);
    const result = loremController.generateSentences(count);
    sendText(res, result.text, { noCache: true });
  }
];
loremRoute.get('/sentences/text', ...sentencesTextHandler);
loremRoute.get('/sentences/:count/text', ...sentencesTextHandler);

/**
 * Get paragraphs - JSON response
 */
const paragraphsHandler = [
  cors(),
  param('count').optional().isInt({ min: 1, max: 20 }).withMessage('Paragraphs must be between 1 and 20'),
  param('sentences').optional().isInt({ min: 1, max: 50 }).withMessage('Sentences must be between 1 and 50'),
  validateRequest,
  (req, res) => {
    const paragraphCount = parseInt(req.params.count || req.query.paragraphs || 3);
    const sentencesPerParagraph = req.params.sentences ? parseInt(req.params.sentences) : null;
    const result = loremController.generateParagraphs(paragraphCount, sentencesPerParagraph);

    sendJSON(res, formatSuccess({
      text: result.text,
      paragraphs: result.paragraphs,
      count: result.count
    }), { noCache: true });
  }
];
loremRoute.get('/paragraphs', ...paragraphsHandler);
loremRoute.get('/paragraphs/:count', ...paragraphsHandler);
loremRoute.get('/paragraphs/:count/:sentences', ...paragraphsHandler);

/**
 * Get paragraphs - Text response
 */
const paragraphsTextHandler = [
  cors(),
  param('count').optional().isInt({ min: 1, max: 20 }),
  param('sentences').optional().isInt({ min: 1, max: 50 }),
  validateRequest,
  (req, res) => {
    const paragraphCount = parseInt(req.params.count || 3);
    const sentencesPerParagraph = req.params.sentences ? parseInt(req.params.sentences) : null;
    const result = loremController.generateParagraphs(paragraphCount, sentencesPerParagraph);

    // Check for ?p=true to add paragraph tags
    const pTags = req.query.p === 'true' || req.query.p === '1';
    const text = pTags ? result.paragraphs.map(p => `<p>${p}</p>`).join('\n\n') : result.text;

    sendText(res, text, { noCache: true });
  }
];
loremRoute.get('/paragraphs/text', ...paragraphsTextHandler);
loremRoute.get('/paragraphs/:count/text', ...paragraphsTextHandler);
loremRoute.get('/paragraphs/:count/:sentences/text', ...paragraphsTextHandler);

/**
 * Generate custom lorem ipsum - JSON response
 */
loremRoute.post('/generate',
  cors(),
  body('sentences').optional().isInt({ min: 1, max: 999 }),
  body('paragraphs').optional().isInt({ min: 1, max: 20 }),
  body('sentencesPerParagraph').optional().isInt({ min: 1, max: 50 }),
  body('format').optional().isIn(['json', 'text', 'html']),
  validateRequest,
  (req, res) => {
    const { sentences, paragraphs, sentencesPerParagraph = 5, format = 'json' } = req.body;

    if (!sentences && !paragraphs) {
      sendJSON(res, formatError('Specify either sentences or paragraphs'), { status: 400 });
      return;
    }

    if (sentences && paragraphs) {
      sendJSON(res, formatError('Specify only one of sentences or paragraphs'), { status: 400 });
      return;
    }

    try {
      const result = loremController.generateCustom({ sentences, paragraphs, sentencesPerParagraph });

      if (format === 'text') {
        sendText(res, result.text, { noCache: true });
      } else if (format === 'html') {
        const html = result.type === 'paragraphs'
          ? result.paragraphs.map(p => `<p>${p}</p>`).join('\n')
          : `<p>${result.text}</p>`;
        sendText(res, html, { noCache: true });
      } else {
        sendJSON(res, formatSuccess(result), { noCache: true });
      }
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Get words - JSON response
 */
const wordsHandler = [
  cors(),
  param('count').optional().isInt({ min: 1, max: 1000 }).withMessage('Count must be between 1 and 1000'),
  validateRequest,
  (req, res) => {
    const count = parseInt(req.params.count || req.query.count || 10);

    // Generate words by taking a sentence and extracting words
    const sentence = loremController.generateSentences(Math.ceil(count / 5));
    const words = sentence.text
      .replace(/[.,!?;]/g, '')
      .split(' ')
      .slice(0, count);

    sendJSON(res, formatSuccess({
      text: words.join(' '),
      words: words,
      count: words.length
    }), { noCache: true });
  }
];
loremRoute.get('/words', ...wordsHandler);
loremRoute.get('/words/:count', ...wordsHandler);

/**
 * Get words - Text response
 */
const wordsTextHandler = [
  cors(),
  param('count').optional().isInt({ min: 1, max: 1000 }),
  validateRequest,
  (req, res) => {
    const count = parseInt(req.params.count || 10);

    const sentence = loremController.generateSentences(Math.ceil(count / 5));
    const words = sentence.text
      .replace(/[.,!?;]/g, '')
      .split(' ')
      .slice(0, count);

    sendText(res, words.join(' '), { noCache: true });
  }
];
loremRoute.get('/words/text', ...wordsTextHandler);
loremRoute.get('/words/:count/text', ...wordsTextHandler);

/**
 * Help endpoint
 */
loremRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = formatSuccess({
    title: 'Lorem Ipsum Generator',
    message: 'Generate placeholder text in various formats',
    endpoints: {
      sentences: {
        json: `${host}/api/v1/tools/lorem/sentences/:count`,
        text: `${host}/api/v1/tools/lorem/sentences/:count/text`
      },
      paragraphs: {
        json: `${host}/api/v1/tools/lorem/paragraphs/:count/:sentences`,
        text: `${host}/api/v1/tools/lorem/paragraphs/:count/:sentences/text`
      },
      words: {
        json: `${host}/api/v1/tools/lorem/words/:count`,
        text: `${host}/api/v1/tools/lorem/words/:count/text`
      },
      generate: `POST ${host}/api/v1/tools/lorem/generate`
    },
    parameters: {
      count: 'Number of items to generate',
      sentences: 'Sentences per paragraph (optional, random if not specified)',
      p: 'Add paragraph tags in text mode (?p=true)',
      format: 'Response format for POST: json, text, or html'
    },
    examples: {
      sentences: `GET ${host}/api/v1/tools/lorem/sentences/5`,
      sentencesText: `GET ${host}/api/v1/tools/lorem/sentences/5/text`,
      paragraphs: `GET ${host}/api/v1/tools/lorem/paragraphs/3/4`,
      paragraphsWithTags: `GET ${host}/api/v1/tools/lorem/paragraphs/3/text?p=true`,
      words: `GET ${host}/api/v1/tools/lorem/words/20`
    }
  });

  sendJSON(res, data);
});

module.exports = loremRoute;
