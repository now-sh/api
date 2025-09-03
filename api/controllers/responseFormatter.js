/**
 * Standard response formatter for all API endpoints
 */

/**
 * Format successful response
 */
function formatSuccess(data, options = {}) {
  const response = {
    success: true,
    data: data
  };

  if (options.count !== undefined) {
    response.count = options.count;
  }

  if (options.metadata) {
    response.metadata = options.metadata;
  }

  return response;
}

/**
 * Format error response
 */
function formatError(message, options = {}) {
  const response = {
    success: false,
    error: message
  };

  if (options.code) {
    response.code = options.code;
  }

  if (options.details) {
    response.details = options.details;
  }

  return response;
}

/**
 * Format text response (for /text endpoints)
 */
function formatText(data) {
  if (typeof data === 'string') {
    return data;
  }
  
  if (data.text) {
    return data.text;
  }
  
  if (data.content) {
    return data.content;
  }
  
  if (Array.isArray(data)) {
    return data.join('\n');
  }
  
  return JSON.stringify(data, null, 2);
}

/**
 * Send JSON response with standard headers
 */
function sendJSON(res, data, options = {}) {
  const { setStandardHeaders } = require('../utils/standardHeaders');
  setStandardHeaders(res, data, options);
  res.json(data);
}

/**
 * Send text response
 */
function sendText(res, text, options = {}) {
  const { setStandardHeaders } = require('../utils/standardHeaders');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (options.noCache) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  res.send(text);
}

module.exports = {
  formatSuccess,
  formatError,
  formatText,
  sendJSON,
  sendText
};