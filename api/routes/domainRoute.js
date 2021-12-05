require('dotenv').config();
const express = require('express');
const domainRoute = express.Router();
const cors = require('cors');
const fetch = require('node-fetch');

const myHeaders = require('../middleware/headers');
const githubToken = process.env.GITHUB_API_KEY;
const cache = null;
const lastCacheTime = null;

domainRoute.get('/', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const response = await fetch(
    'https://raw.githubusercontent.com/casjay/casjay/main/domains.json'
  );
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.json(json);
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = domainRoute;
