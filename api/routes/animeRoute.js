// dotenv loaded in index.js
const express = require('express');
const cors = require('cors');
const { param, validationResult } = require('express-validator');
const { getRandomQuote } = require('../controllers/anime');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const animeRoute = express.Router();

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
 * Get random anime quote - JSON response
 */
animeRoute.get('/quote', cors(), async (req, res) => {
  try {
    const quote = await getRandomQuote();
    sendJSON(res, formatSuccess({
      quote: quote.quote,
      character: quote.character,
      anime: quote.anime,
      source: quote.source
    }), { noCache: true });
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 503 });
  }
});

/**
 * Get random anime quote - Text response
 */
animeRoute.get('/quote/text', cors(), async (req, res) => {
  try {
    const quote = await getRandomQuote();
    const output = `"${quote.quote}" - ${quote.character} (${quote.anime})`;
    sendText(res, output);
  } catch (error) {
    sendText(res, `Error: ${error.message}`);
  }
});

/**
 * Get multiple random quotes
 */
animeRoute.get('/quotes/:count',
  cors(),
  param('count').isInt({ min: 1, max: 20 }).withMessage('Count must be between 1 and 20'),
  validateRequest,
  async (req, res) => {
    try {
      const count = parseInt(req.params.count);
      const quotes = [];
      
      for (let i = 0; i < count; i++) {
        const quote = await getRandomQuote();
        quotes.push({
          quote: quote.quote,
          character: quote.character,
          anime: quote.anime,
          source: quote.source
        });
      }
      
      sendJSON(res, formatSuccess({
        quotes,
        count: quotes.length
      }), { noCache: true });
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 503 });
    }
  }
);

/**
 * Get multiple random quotes - Text response
 */
animeRoute.get('/quotes/:count/text',
  cors(),
  param('count').isInt({ min: 1, max: 20 }).withMessage('Count must be between 1 and 20'),
  validateRequest,
  async (req, res) => {
    try {
      const count = parseInt(req.params.count);
      const quotes = [];
      
      for (let i = 0; i < count; i++) {
        const quote = await getRandomQuote();
        quotes.push(`"${quote.quote}" - ${quote.character} (${quote.anime})`);
      }
      
      sendText(res, quotes.join('\n\n'));
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

// Legacy routes for backward compatibility
animeRoute.get('/random', cors(), async (req, res) => {
  res.redirect('/api/v1/fun/anime/quote');
});

/**
 * Help endpoint
 */
animeRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'Anime Quotes API',
    message: 'Get random anime quotes from various sources',
    endpoints: {
      quote: {
        json: `GET ${host}/api/v1/fun/anime/quote`,
        text: `GET ${host}/api/v1/fun/anime/quote/text`
      },
      quotes: {
        json: `GET ${host}/api/v1/fun/anime/quotes/:count`,
        text: `GET ${host}/api/v1/fun/anime/quotes/:count/text`
      }
    },
    parameters: {
      count: 'Number of quotes to retrieve (1-20)'
    },
    examples: {
      quote: `GET ${host}/api/v1/fun/anime/quote`,
      quoteText: `GET ${host}/api/v1/fun/anime/quote/text`,
      multiple: `GET ${host}/api/v1/fun/anime/quotes/5`,
      multipleText: `GET ${host}/api/v1/fun/anime/quotes/5/text`
    },
    cli_examples: {
      basic: `curl ${host}/api/v1/fun/anime/quote/text`,
      json: `curl ${host}/api/v1/fun/anime/quote`,
      multiple: `curl ${host}/api/v1/fun/anime/quotes/3/text`
    }
  });
  
  sendJSON(res, data);
});

module.exports = animeRoute;