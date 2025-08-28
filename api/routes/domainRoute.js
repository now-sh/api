require('dotenv').config();
const express = require('express');
const domainRoute = express.Router();
const cors = require('cors');
const { fetchJsonWithTimeout } = require('../utils/fetchWithTimeout');

const domain_json = 'https://raw.githubusercontent.com/casjay/casjay/main/domains.json';
const domain_file = process.env.DOMAIN_LIST || domain_json;

// Cache with proper structure
let domainCache = {
  data: null,
  timestamp: 0
};

const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache


domainRoute.get('/', cors(), async (req, res) => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (domainCache.data && (now - domainCache.timestamp) < CACHE_TTL) {
    return res.json(domainCache.data);
  }
  
  try {
    const data = await fetchJsonWithTimeout(domain_file, {}, 5000);
    
    // Update cache
    domainCache = {
      data: data,
      timestamp: now
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (error) {
    // Return cached data if available
    if (domainCache.data) {
      console.error('Failed to fetch fresh domain data, using cache:', error.message);
      return res.json(domainCache.data);
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch domain data',
      message: error.message 
    });
  }
});

module.exports = domainRoute;