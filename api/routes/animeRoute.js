require('dotenv').config();
const express = require('express');
const animeRoute = express.Router();
const cors = require('cors');

// Import controller
const { getRandomQuote } = require('../controllers/anime');
const { setStandardHeaders } = require('../utils/standardHeaders');

animeRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  try {
    const helpData = {
      title: 'Anime Quotes API',
      quote: `${host}/api/v1/anime/quote`,
      random: `${host}/api/v1/anime/random`,
      cli_example: `curl ${host}/api/v1/anime/quote`,
      description: 'Get random anime quotes from various sources'
    };
    setStandardHeaders(res, helpData);
    res.json(helpData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

animeRoute.get('/quote', cors(), async (req, res) => {
  try {
    const quote = await getRandomQuote();
    setStandardHeaders(res, quote, { noCache: true });
    res.json(quote);
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

animeRoute.get('/random', cors(), async (req, res) => {
  // Redirect to /quote endpoint
  res.redirect('/api/v1/anime/quote');
});

module.exports = animeRoute;