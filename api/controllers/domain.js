const { getJson } = require('../utils/httpClient');

const DOMAINS_URL = process.env.DOMAINS_URL || 'https://raw.githubusercontent.com/casjay/public/main/domains.json';

// Cache
let cache = null;
let lastCacheTime = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all domains
 */
const getDomains = async () => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cache && lastCacheTime && (now - lastCacheTime) < CACHE_TTL) {
    return cache;
  }
  
  try {
    const data = await getJson(DOMAINS_URL, { timeout: 5000 });
    
    // Extract domains array from the object
    let domains = [];
    if (Array.isArray(data)) {
      domains = data;
    } else if (data && data.domains && Array.isArray(data.domains)) {
      domains = data.domains;
    } else if (data && typeof data === 'object') {
      // If it's an object but not the expected format, try to extract domain names
      domains = Object.values(data).flat().filter(d => typeof d === 'string');
    }
    
    // Update cache
    cache = domains;
    lastCacheTime = now;
    
    return domains;
  } catch (error) {
    console.error('Failed to fetch domains:', error.message);
    throw new Error('Failed to fetch domain data');
  }
};

/**
 * Search domains
 */
const searchDomains = async (query) => {
  if (!query || typeof query !== 'string') {
    throw new Error('Invalid search query');
  }
  
  const domains = await getDomains();
  const searchTerm = query.toLowerCase();
  
  // Search for domains containing the query
  const results = domains.filter(domain => 
    domain.toLowerCase().includes(searchTerm)
  );
  
  return results;
};

/**
 * Get domain statistics
 */
const getDomainStats = async () => {
  const domains = await getDomains();
  
  if (domains.length === 0) {
    return {
      total: 0,
      tldBreakdown: {},
      longest: null,
      shortest: null,
      averageLength: 0
    };
  }
  
  // Calculate TLD breakdown
  const tldBreakdown = {};
  let totalLength = 0;
  let longest = domains[0];
  let shortest = domains[0];
  
  domains.forEach(domain => {
    // Extract TLD
    const parts = domain.split('.');
    const tld = parts.length > 1 ? `.${parts[parts.length - 1]}` : 'unknown';
    
    tldBreakdown[tld] = (tldBreakdown[tld] || 0) + 1;
    
    // Track lengths
    totalLength += domain.length;
    
    if (domain.length > longest.length) {
      longest = domain;
    }
    if (domain.length < shortest.length) {
      shortest = domain;
    }
  });
  
  return {
    total: domains.length,
    tldBreakdown,
    longest,
    shortest,
    averageLength: Math.round(totalLength / domains.length * 10) / 10
  };
};

module.exports = {
  getDomains,
  searchDomains,
  getDomainStats
};