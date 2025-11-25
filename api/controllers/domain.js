const { getJson } = require('../utils/httpClient');

const DOMAINS_URL = process.env.DOMAINS_URL || 'https://raw.githubusercontent.com/casjay/public/main/domains.json';

// Cache
let cache = null;
let lastCacheTime = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all domains (separated into domains and subdomains)
 */
const getDomains = async () => {
  const now = Date.now();

  // Return cached data if still valid
  if (cache && lastCacheTime && (now - lastCacheTime) < CACHE_TTL) {
    return cache;
  }

  try {
    const data = await getJson(DOMAINS_URL, { timeout: 5000 });

    // Extract domains and subdomains from the object
    let domains = [];
    let subdomains = [];

    if (data && typeof data === 'object') {
      // Handle the expected format with "domains" and "subDomains" keys
      if (Array.isArray(data.domains)) {
        domains = data.domains.filter(d => d && d.trim());
      }
      if (Array.isArray(data.subDomains)) {
        subdomains = data.subDomains.filter(d => d && d.trim());
      }

      // Fallback: if data is just an array
      if (Array.isArray(data)) {
        const allDomains = data.filter(d => d && d.trim());
        allDomains.forEach(domain => {
          const parts = domain.split('.');
          if (parts.length > 2) {
            subdomains.push(domain);
          } else {
            domains.push(domain);
          }
        });
      }
    }

    const allDomains = [...domains, ...subdomains];

    // Update cache
    cache = { domains, subdomains, all: allDomains };
    lastCacheTime = now;

    return cache;
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

  const data = await getDomains();
  const searchTerm = query.toLowerCase();

  // Search in all domains
  const filteredDomains = data.domains.filter(domain =>
    domain.toLowerCase().includes(searchTerm)
  );

  const filteredSubdomains = data.subdomains.filter(domain =>
    domain.toLowerCase().includes(searchTerm)
  );

  return {
    domains: filteredDomains,
    subdomains: filteredSubdomains,
    all: [...filteredDomains, ...filteredSubdomains]
  };
};

/**
 * Get domain statistics
 */
const getDomainStats = async () => {
  const data = await getDomains();
  const allDomains = data.all;

  if (allDomains.length === 0) {
    return {
      total: 0,
      totalDomains: 0,
      totalSubdomains: 0,
      tldBreakdown: {},
      longest: null,
      shortest: null,
      averageLength: 0
    };
  }

  // Calculate TLD breakdown
  const tldBreakdown = {};
  let totalLength = 0;
  let longest = allDomains[0];
  let shortest = allDomains[0];

  allDomains.forEach(domain => {
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
    total: allDomains.length,
    totalDomains: data.domains.length,
    totalSubdomains: data.subdomains.length,
    tldBreakdown,
    longest,
    shortest,
    averageLength: Math.round(totalLength / allDomains.length * 10) / 10
  };
};

module.exports = {
  getDomains,
  searchDomains,
  getDomainStats
};