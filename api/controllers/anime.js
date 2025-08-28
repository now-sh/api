const { fetchWithTimeout } = require('../utils/fetchWithTimeout');

// Alternative anime quote sources
const animeQuotes = [
  {
    quote: "People die when they are killed.",
    character: "Emiya Shirou",
    anime: "Fate/Stay Night"
  },
  {
    quote: "I'll take a potato chip... and eat it!",
    character: "Light Yagami",
    anime: "Death Note"
  },
  {
    quote: "Believe in the me that believes in you!",
    character: "Kamina",
    anime: "Gurren Lagann"
  },
  {
    quote: "The only ones who should kill are those who are prepared to be killed!",
    character: "Lelouch Lamperouge",
    anime: "Code Geass"
  },
  {
    quote: "I am mad scientist. It's so cool! Sonuvabitch!",
    character: "Okabe Rintarou",
    anime: "Steins;Gate"
  },
  {
    quote: "Whatever happens, happens.",
    character: "Spike Spiegel",
    anime: "Cowboy Bebop"
  },
  {
    quote: "It's not about whether I can, I have to do it.",
    character: "Megumi Fushiguro",
    anime: "Jujutsu Kaisen"
  },
  {
    quote: "If you don't like your destiny, don't accept it. Instead, have the courage to change it the way you want it to be!",
    character: "Naruto Uzumaki",
    anime: "Naruto"
  },
  {
    quote: "Being weak is nothing to be ashamed of... Staying weak is!",
    character: "Fuegoleon Vermillion",
    anime: "Black Clover"
  },
  {
    quote: "A person can only be saved by another person.",
    character: "Gintoki Sakata",
    anime: "Gintama"
  }
];

// External API sources
const ANIME_APIS = [
  'https://api.quotable.io/random?tags=anime',
  'https://animechan.vercel.app/api/random',
  'https://waifu.it/api/quote'
];

// Cache
let cache = {
  quote: null,
  timestamp: 0
};

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Parse quote based on API response format
 */
function parseQuoteResponse(data, apiUrl) {
  if (apiUrl.includes('quotable.io')) {
    return {
      quote: data.content,
      character: data.author || 'Unknown',
      anime: 'Various Anime'
    };
  } else if (apiUrl.includes('animechan')) {
    return {
      quote: data.quote,
      character: data.character,
      anime: data.anime
    };
  } else if (apiUrl.includes('waifu.it')) {
    return {
      quote: data.quote,
      character: data.author || 'Unknown',
      anime: data.anime || 'Unknown Anime'
    };
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
  
  // Try external APIs first
  for (const api of ANIME_APIS) {
    try {
      const response = await fetchWithTimeout(api, {
        method: "GET"
      }, 5000); // 5 second timeout
      
      if (response.ok) {
        const data = await response.json();
        quote = parseQuoteResponse(data, api);
        if (quote) break;
      }
    } catch (error) {
      console.log(`Failed to fetch from ${api}:`, error.message);
      continue;
    }
  }
  
  // Fallback to local quotes if all APIs fail
  if (!quote) {
    const randomIndex = Math.floor(Math.random() * animeQuotes.length);
    quote = animeQuotes[randomIndex];
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