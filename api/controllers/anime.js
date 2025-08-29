const { getJson } = require('../utils/httpClient');
const { getHeaders } = require('../middleware/headers');


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

// Cache
let cache = {
  quote: null,
  timestamp: 0
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Parse quote based on API response format
 */
function parseQuoteResponse(data, apiUrl) {
  if (apiUrl.includes('katanime.vercel.app')) {
    // Katanime returns an object with result array
    if (data.sukses && data.result && data.result.length > 0) {
      const quote = data.result[0];
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
 * Get a random anime quote
 */
async function getRandomQuote() {
  const now = Date.now();
  
  // Return cached quote if still valid
  if (cache.quote && (now - cache.timestamp) < CACHE_TTL) {
    return cache.quote;
  }
  
  let quote = null;
  
  // Try external APIs
  for (const api of ANIME_APIS) {
    try {
      const data = await getJson(api, { timeout: 5000 });
      quote = parseQuoteResponse(data, api);
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
  
  // Update cache
  cache = {
    quote: result,
    timestamp: now
  };
  
  return result;
}

module.exports = {
  getRandomQuote
};