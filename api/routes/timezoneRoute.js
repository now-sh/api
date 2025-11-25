require('dotenv').config();
const express = require('express');
const tzRoute = express.Router();
const cors = require('cors');
const { getJson } = require('../utils/httpClient');
const { setStandardHeaders } = require('../utils/standardHeaders');

// GitHub URLs for data
const TIMEZONE_URL = process.env.TIMEZONE_URL || 'https://raw.githubusercontent.com/apimgr/timezones/main/src/data/timezones.json';
const COUNTRIES_URL = process.env.COUNTRIES_URL || 'https://raw.githubusercontent.com/apimgr/countries/main/countries.json';

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
  try {
    const timezoneData = await fetchWithCache(TIMEZONE_URL, 'timezones');
    setStandardHeaders(res, timezoneData);
    res.json(timezoneData);
  } catch (error) {
    const data = { 
      error: 'Timezone data service unavailable',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(503).json(data);
  }
});

tzRoute.get('/countries', cors(), async (req, res) => {
  try {
    const countryData = await fetchWithCache(COUNTRIES_URL, 'countries');
    setStandardHeaders(res, countryData);
    res.json(countryData);
  } catch (error) {
    const data = { 
      error: 'Country data service unavailable',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(503).json(data);
  }
});

tzRoute.get('/search/:query', cors(), async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const timezoneData = await fetchWithCache(TIMEZONE_URL, 'timezones');
    
    const results = timezoneData.filter(tz => 
      tz.text.toLowerCase().includes(query) ||
      tz.abbr.toLowerCase().includes(query) ||
      tz.value.toLowerCase().includes(query) ||
      (tz.utc && tz.utc.some(u => u.toLowerCase().includes(query)))
    );
    
    setStandardHeaders(res, results);
    res.json(results);
  } catch (error) {
    const data = { 
      error: 'Timezone search service unavailable',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(503).json(data);
  }
});

tzRoute.get('/country/:code', cors(), async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const countryData = await fetchWithCache(COUNTRIES_URL, 'countries');
    
    const country = countryData.find(c => c.country_code === code);
    
    if (!country) {
      const data = { 
        error: 'Country not found',
        code: code 
      };
      setStandardHeaders(res, data);
      return res.status(404).json(data);
    }
    
    setStandardHeaders(res, country);
    res.json(country);
  } catch (error) {
    const data = { 
      error: 'Country lookup service unavailable',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(503).json(data);
  }
});

tzRoute.get('/help', cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  try {
    const data = {
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
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { error: error.message };
    setStandardHeaders(res, data);
    res.json(data);
  }
});

module.exports = tzRoute;