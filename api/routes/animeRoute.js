require('dotenv').config();
const express = require('express');
const animeRoute = express.Router();
const cors = require('cors');

const fetch = require('node-fetch');
const default_route = ['/', '/help'];

animeRoute.get(default_route, cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        quote: `${req.protocol}://${req.headers.host}/api/v1/anime/quote`,
      })
    );
  } catch (err) {
    res.json({ error: err.message });
  }
});

animeRoute.get('/quote', cors(), async (req, res) => {
  const response = await fetch(`https://api.animechan.io/v1/quotes/random`, {
    method: "GET",
    mode: 'no-cors'
  });
  res.setHeader('Content-Type', 'application/json');
  try {
    const json = await response.json();
    this.json = json.data;
    res.send(
      JSON.stringify({
        quote: this.json.content,
        anime: this.json.anime.name,
        character: this.json.character.name,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = animeRoute;
