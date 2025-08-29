const axios = require('axios');
const { getHeaders } = require('../middleware/headers');

/**
 * Unified HTTP client using axios for all requests
 * Replaces both fetchWithTimeout and node-fetch usage
 */

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_RETRIES = 3;

// Create base axios instance
const httpClient = axios.create({
  timeout: DEFAULT_TIMEOUT,
  validateStatus: (status) => status < 500 // Don't throw on 4xx errors
});

/**
 * Basic HTTP GET request
 * @param {string} url - The URL to fetch
 * @param {object} options - Request options
 * @returns {Promise<object>} - Response data
 */
async function get(url, options = {}) {
  const config = {
    method: 'GET',
    url,
    timeout: options.timeout || DEFAULT_TIMEOUT,
    headers: options.headers || getHeaders(),
    ...options
  };
  
  const response = await httpClient.request(config);
  return response.data;
}

/**
 * HTTP GET request that returns JSON
 * @param {string} url - The URL to fetch
 * @param {object} options - Request options
 * @returns {Promise<object>} - Parsed JSON response
 */
async function getJson(url, options = {}) {
  return await get(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...getHeaders(),
      ...options.headers
    }
  });
}

/**
 * HTTP GET request that returns text
 * @param {string} url - The URL to fetch
 * @param {object} options - Request options
 * @returns {Promise<string>} - Text response
 */
async function getText(url, options = {}) {
  const config = {
    method: 'GET',
    url,
    timeout: options.timeout || DEFAULT_TIMEOUT,
    headers: options.headers || getHeaders(),
    responseType: 'text',
    ...options
  };
  
  const response = await httpClient.request(config);
  return response.data;
}

/**
 * HTTP POST request with JSON body
 * @param {string} url - The URL to post to
 * @param {object} data - Data to send
 * @param {object} options - Request options
 * @returns {Promise<object>} - Response data
 */
async function postJson(url, data, options = {}) {
  const config = {
    method: 'POST',
    url,
    data,
    timeout: options.timeout || DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      ...getHeaders(),
      ...options.headers
    },
    ...options
  };
  
  const response = await httpClient.request(config);
  return response.data;
}

/**
 * HTTP request with retry logic
 * @param {string} url - The URL to fetch
 * @param {object} options - Request options
 * @param {number} retries - Number of retries
 * @returns {Promise<object>} - Response data
 */
async function getWithRetry(url, options = {}, retries = DEFAULT_RETRIES) {
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await get(url, options);
    } catch (error) {
      lastError = error;
      if (i === retries) break;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  throw lastError;
}

/**
 * HTTP request with multiple fallback URLs
 * @param {string[]} urls - Array of URLs to try
 * @param {object} options - Request options
 * @returns {Promise<object>} - Response data from first successful URL
 */
async function getWithFallback(urls, options = {}) {
  let lastError;
  
  for (const url of urls) {
    try {
      return await get(url, options);
    } catch (error) {
      lastError = error;
      console.log(`Failed to fetch from ${url}:`, error.message);
    }
  }
  
  throw lastError;
}

/**
 * HTTP request with caching
 * @param {string} url - The URL to fetch
 * @param {Map} cache - Cache object
 * @param {string} cacheKey - Cache key
 * @param {number} ttl - Time to live in milliseconds
 * @param {object} options - Request options
 * @returns {Promise<object>} - Response data
 */
async function getWithCache(url, cache, cacheKey, ttl, options = {}) {
  const now = Date.now();
  const cached = cache.get(cacheKey);
  
  if (cached && (now - cached.timestamp < ttl)) {
    return cached.data;
  }
  
  const data = await getJson(url, options);
  
  cache.set(cacheKey, {
    data,
    timestamp: now
  });
  
  return data;
}

module.exports = {
  get,
  getJson,
  getText,
  postJson,
  getWithRetry,
  getWithFallback,
  getWithCache,
  httpClient
};