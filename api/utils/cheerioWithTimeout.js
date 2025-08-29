const cheerio = require('cheerio');
const { getText } = require('./httpClient');

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
    // Fetch the URL with timeout using httpClient
    const html = await getText(url, {
      timeout,
      ...fetchOptions
    });
    
    // Load HTML into cheerio
    const $ = cheerio.load(html, {
      decodeEntities: true,
      ...options.cheerioOptions
    });
    
    return $;
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
}

module.exports = cheerioLoadWithTimeout;