require('dotenv').config();
const express = require('express');
const domainRoute = express.Router();
const cors = require('cors');
const { getJson } = require('../utils/httpClient');
const { setStandardHeaders } = require('../utils/standardHeaders');

const domain_json = 'https://raw.githubusercontent.com/casjay/casjay/main/domains.json';
const domain_file = process.env.DOMAIN_LIST || domain_json;

// Cache with proper structure
let domainCache = {
  data: null,
  timestamp: 0
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache


domainRoute.get('/', cors(), async (req, res) => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (domainCache.data && (now - domainCache.timestamp) < CACHE_TTL) {
    const data = domainCache.data;
    setStandardHeaders(res, data);
    return res.json(data);
  }
  
  try {
    const data = await getJson(domain_file, { timeout: 5000 });
    
    // Update cache
    domainCache = {
      data: data,
      timestamp: now
    };
    
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { 
      error: 'Domain data service unavailable',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(503).json(data);
  }
});

domainRoute.get('/help', cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  try {
    const data = {
      title: 'Domain List API',
      endpoint: `${host}/api/v1/domains`,
      description: 'Get list of CasJay\'s domains',
      data_source: domain_file,
      cli_example: `curl ${host}/api/v1/domains`,
      search_function: `domain_search() { curl -s "${host}/api/v1/domains" | jq -r '.[] | select(. | test($1; "i"))' --arg 1 "$1"; }`
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { error: error.message };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

module.exports = domainRoute;