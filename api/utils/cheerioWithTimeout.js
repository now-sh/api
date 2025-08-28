const cheerio = require('cheerio');
const fetchWithTimeout = require('./fetchWithTimeout');

/**
 * Load a URL into cheerio with timeout support
 * @param {string} url - URL to fetch
 * @param {Object} options - Options including timeout
 * @returns {Promise<CheerioStatic>} - Cheerio instance with loaded HTML
 */
async function cheerioLoadWithTimeout(url, options = {}) {
  const timeout = options.timeout || 5000;
  const fetchOptions = options.fetchOptions || {};

  try {
    // Fetch the URL with timeout
    const response = await fetchWithTimeout(url, fetchOptions, timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Load HTML into cheerio
    const $ = cheerio.load(html, {
      decodeEntities: true,
      ...options.cheerioOptions
    });
    
    return $;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
}

module.exports = cheerioLoadWithTimeout;