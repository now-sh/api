require('dotenv').config();
const express = require('express');
const tzRoute = express.Router();
const cors = require('cors');
const { getJson } = require('../utils/httpClient');

// GitHub URLs for data
const TIMEZONE_URL = process.env.TIMEZONE_URL || 'https://raw.githubusercontent.com/apimgr/timezones/refs/heads/main/timezones.json';
const COUNTRIES_URL = process.env.COUNTRIES_URL || 'https://raw.githubusercontent.com/apimgr/countries/refs/heads/main/countries.json';

// Cache data with TTL
let cache = {
  timezones: { data: null, timestamp: 0 },
  countries: { data: null, timestamp: 0 }
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Function to fetch and cache data
async function fetchWithCache(url, cacheKey) {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cache[cacheKey].data && (now - cache[cacheKey].timestamp) < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  
  const data = await getJson(url, { timeout: 5000 });
  
  // Update cache
  cache[cacheKey] = {
    data: data,
    timestamp: now
  };
  
  return data;
}


tzRoute.get('/', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const timezoneData = await fetchWithCache(TIMEZONE_URL, 'timezones');
    res.json(timezoneData);
  } catch (error) {
    res.status(503).json({ 
      error: 'Timezone data service unavailable',
      message: error.message 
    });
  }
});

tzRoute.get('/countries', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const countryData = await fetchWithCache(COUNTRIES_URL, 'countries');
    res.json(countryData);
  } catch (error) {
    res.status(503).json({ 
      error: 'Country data service unavailable',
      message: error.message 
    });
  }
});

tzRoute.get('/search/:query', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const query = req.params.query.toLowerCase();
    const timezoneData = await fetchWithCache(TIMEZONE_URL, 'timezones');
    
    const results = timezoneData.filter(tz => 
      tz.text.toLowerCase().includes(query) ||
      tz.abbr.toLowerCase().includes(query) ||
      tz.value.toLowerCase().includes(query) ||
      (tz.utc && tz.utc.some(u => u.toLowerCase().includes(query)))
    );
    
    res.json(results);
  } catch (error) {
    res.status(503).json({ 
      error: 'Timezone search service unavailable',
      message: error.message 
    });
  }
});

tzRoute.get('/country/:code', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const code = req.params.code.toUpperCase();
    const countryData = await fetchWithCache(COUNTRIES_URL, 'countries');
    
    const country = countryData.find(c => c.country_code === code);
    
    if (!country) {
      return res.status(404).json({ 
        error: 'Country not found',
        code: code 
      });
    }
    
    res.json(country);
  } catch (error) {
    res.status(503).json({ 
      error: 'Country lookup service unavailable',
      message: error.message 
    });
  }
});

tzRoute.get('/help', cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.setHeader('Content-Type', 'application/json');
  try {
    res.json({
      title: 'Timezone API Help',
      endpoints: {
        timezones: `${host}/api/v1/timezones`,
        countries: `${host}/api/v1/timezones/countries`,
        search: `${host}/api/v1/timezones/search/{query}`,
        country: `${host}/api/v1/timezones/country/{code}`
      },
      examples: {
        getTimezone: [
          `${host}/api/v1/timezones`,
          `# Search for a specific timezone`,
          `curl "${host}/api/v1/timezones/search/pacific"`,
          `# Bash function for CLI`,
          `tz_search() { curl -s "${host}/api/v1/timezones" | jq -r '.[] | select(.text | test($1; "i")) | {abbr:.abbr,offset:.offset,tz:.utc[0]}' --arg 1 "$1"; }`
        ],
        getCountry: [
          `${host}/api/v1/timezones/countries`,
          `# Get specific country by code`,
          `curl "${host}/api/v1/timezones/country/US"`,
          `# Bash function for CLI`,
          `tz_country_search() { curl -s "${host}/api/v1/timezones/countries" | jq -r '.[] | select(.name | test($1; "i")) | {name:.name,capital:.capital,code:.country_code,zones:.timezones}' --arg 1 "$1"; }`
        ]
      },
      data_sources: {
        timezones: TIMEZONE_URL,
        countries: COUNTRIES_URL
      }
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = tzRoute;