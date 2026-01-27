const { getJson } = require('../utils/httpClient');


// External API sources
const ANIME_APIS = [
  'https://katanime.vercel.app/api/getrandom',
  'https://raw.githubusercontent.com/apimgr/anime-quotes/refs/heads/main/dataset.json'
  // Removed dead APIs:
  // - api.quotable.io (no anime tag support)
  // - animechan.vercel.app (dead)
  // - waifu.it (requires auth)
  // - animechan.io (404 on endpoints)
  // - yurippe.vercel.app (now dead)
];

// Cache for API responses by URL
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for API data

/**
 * Parse quote based on API response format
 */
function parseQuoteResponse(data, apiUrl) {
  if (apiUrl.includes('katanime.vercel.app')) {
    // Katanime returns an object with result array
    if (data.sukses && data.result && data.result.length > 0) {
      // Pick a random quote from the result array
      const randomIndex = Math.floor(Math.random() * data.result.length);
      const quote = data.result[randomIndex];
      return {
        quote: quote.english || quote.indo,
        character: quote.character,
        anime: quote.anime
      };
    }
  } else if (apiUrl.includes('apimgr/anime-quotes')) {
    // apimgr dataset is an array of quotes
    if (Array.isArray(data) && data.length > 0) {
      // Pick a random quote from the dataset
      const randomIndex = Math.floor(Math.random() * data.length);
      const quote = data[randomIndex];
      return {
        quote: quote.quote,
        character: quote.character,
        anime: quote.anime
      };
    }
  }
  return null;
}

/**
 * Fetch data from API with caching
 */
async function fetchWithCache(apiUrl) {
  const now = Date.now();
  const cached = apiCache.get(apiUrl);
  
  // Return cached data if still valid
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  // Fetch fresh data
  const data = await getJson(apiUrl, { timeout: 5000 });
  
  // Cache the response
  apiCache.set(apiUrl, {
    data: data,
    timestamp: now
  });
  
  return data;
}

/**
 * Get a random anime quote
 */
async function getRandomQuote() {
  let quote = null;
  
  // Try each API until we get a quote
  for (const api of ANIME_APIS) {
    try {
      const data = await fetchWithCache(api);
      
      // For the dataset API, pick a random quote
      if (api.includes('apimgr/anime-quotes') && Array.isArray(data)) {
        const randomIndex = Math.floor(Math.random() * data.length);
        quote = {
          quote: data[randomIndex].quote,
          character: data[randomIndex].character,
          anime: data[randomIndex].anime
        };
      } else {
        // For other APIs, parse the response
        quote = parseQuoteResponse(data, api);
      }
      
      if (quote) break;
    } catch (error) {
      console.log(`Failed to fetch from ${api}:`, error.message);
      continue;
    }
  }
  
  if (!quote) {
    throw new Error('All anime quote APIs are currently unavailable');
  }
  
  // Format the response
  const result = {
    quote: quote.quote,
    character: quote.character,
    anime: quote.anime,
    source: quote.source || 'anime-quotes'
  };
  
  return result;
}

module.exports = {
  getRandomQuote
};