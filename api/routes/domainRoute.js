require('dotenv').config();
const express = require('express');
const domainRoute = express.Router();
const cors = require('cors');
const fetch = require('node-fetch');

const myHeaders = require('../middleware/headers');
const githubToken = process.env.GITHUB_API_KEY;
const cache = null;
const lastCacheTime = null;
const domain_json = 'https://raw.githubusercontent.com/casjay/casjay/main/domains.json';
const domain_file = process.env.DOMAIN_LIST || domain_json;

domainRoute.get('/', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const response = await fetch(domain_file);
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.json(json);
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = domainRoute;
