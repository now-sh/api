const fetch = require('node-fetch');

/**
 * Fetch all pages from a GitHub API endpoint
 * @param {string} url - Initial GitHub API URL
 * @param {object} headers - Request headers
 * @param {number} maxPages - Maximum pages to fetch (safety limit)
 * @returns {Promise<Array>} - Combined results from all pages
 */
async function fetchAllGitHubPages(url, headers, maxPages = 10) {
  const results = [];
  let currentUrl = url;
  let pageCount = 0;
  
  // Add per_page parameter if not present
  if (!currentUrl.includes('per_page=')) {
    const separator = currentUrl.includes('?') ? '&' : '?';
    currentUrl += `${separator}per_page=100`;
  }
  
  while (currentUrl && pageCount < maxPages) {
    try {
      console.log(`📄 Fetching GitHub API page ${pageCount + 1}: ${currentUrl}`);
      
      const response = await fetch(currentUrl, { headers });
      
      if (!response.ok) {
        console.error(`GitHub API error: ${response.status} ${response.statusText}`);
        break;
      }
      
      const data = await response.json();
      
      // Handle both array responses and object responses with data arrays
      if (Array.isArray(data)) {
        results.push(...data);
      } else if (data.items && Array.isArray(data.items)) {
        results.push(...data.items);
      } else if (typeof data === 'object') {
        results.push(data);
      }
      
      // Look for next page link in Link header
      const linkHeader = response.headers.get('link');
      currentUrl = parseLinkHeader(linkHeader, 'next');
      
      pageCount++;
      
      // Respect rate limiting
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
        console.warn('⚠️ GitHub rate limit approaching, stopping pagination');
        break;
      }
      
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error fetching GitHub page ${pageCount + 1}:`, error.message);
      break;
    }
  }
  
  console.log(`✅ Fetched ${results.length} items across ${pageCount} pages`);
  return results;
}

/**
 * Parse GitHub Link header to find specific rel links
 * @param {string} linkHeader - Link header value
 * @param {string} rel - Relationship to find (next, prev, last, first)
 * @returns {string|null} - URL for the specified relationship
 */
function parseLinkHeader(linkHeader, rel) {
  if (!linkHeader) return null;
  
  const links = linkHeader.split(',');
  
  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match && match[2] === rel) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Fetch paginated results with search queries
 * @param {string} query - GitHub search query
 * @param {string} type - Search type (repositories, users, issues, etc.)
 * @param {object} headers - Request headers
 * @param {number} maxPages - Maximum pages to fetch
 * @returns {Promise<object>} - Search results with metadata
 */
async function fetchGitHubSearch(query, type, headers, maxPages = 5) {
  const baseUrl = `https://api.github.com/search/${type}`;
  const url = `${baseUrl}?q=${encodeURIComponent(query)}&per_page=100`;
  
  const results = [];
  let currentUrl = url;
  let pageCount = 0;
  let totalCount = 0;
  
  while (currentUrl && pageCount < maxPages) {
    try {
      console.log(`🔍 Searching GitHub ${type}: ${query} (page ${pageCount + 1})`);
      
      const response = await fetch(currentUrl, { headers });
      
      if (!response.ok) {
        console.error(`GitHub Search API error: ${response.status} ${response.statusText}`);
        break;
      }
      
      const data = await response.json();
      
      if (pageCount === 0) {
        totalCount = data.total_count || 0;
      }
      
      if (data.items && Array.isArray(data.items)) {
        results.push(...data.items);
      }
      
      // Check if we've reached the end
      if (!data.items || data.items.length === 0) {
        break;
      }
      
      // Look for next page
      const linkHeader = response.headers.get('link');
      currentUrl = parseLinkHeader(linkHeader, 'next');
      
      pageCount++;
      
      // Rate limiting check
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
        console.warn('⚠️ GitHub search rate limit approaching, stopping');
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200)); // Slightly longer delay for search
      
    } catch (error) {
      console.error(`Error searching GitHub ${type}:`, error.message);
      break;
    }
  }
  
  return {
    total_count: totalCount,
    incomplete_results: totalCount > results.length,
    items: results,
    fetched_count: results.length,
    pages_fetched: pageCount
  };
}

module.exports = {
  fetchAllGitHubPages,
  fetchGitHubSearch,
  parseLinkHeader
};