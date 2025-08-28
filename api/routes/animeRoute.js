require('dotenv').config();
const express = require('express');
const animeRoute = express.Router();
const cors = require('cors');

// Import controller
const { getRandomQuote } = require('../controllers/anime');

animeRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.setHeader('Content-Type', 'application/json');
  try {
    res.json({
      title: 'Anime Quotes API',
      quote: `${host}/api/v1/anime/quote`,
      random: `${host}/api/v1/anime/random`,
      cli_example: `curl ${host}/api/v1/anime/quote`,
      description: 'Get random anime quotes from various sources'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

animeRoute.get('/quote', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const quote = await getRandomQuote();
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

animeRoute.get('/random', cors(), async (req, res) => {
  // Redirect to /quote endpoint
  res.redirect('/api/v1/anime/quote');
});

module.exports = animeRoute;