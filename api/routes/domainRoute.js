require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query, validationResult } = require('express-validator');
const domainController = require('../controllers/domain');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const domainRoute = express.Router();

/**
 * Validation middleware
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendJSON(res, formatError('Validation failed', {
      details: formatValidationErrors(errors.array())
    }), { status: 400 });
    return;
  }
  next();
}

/**
 * List all domains - JSON response
 */
domainRoute.get('/list', cors(), async (req, res) => {
  try {
    const domains = await domainController.getDomains();
    
    sendJSON(res, formatSuccess({
      domains,
      count: domains.length,
      source: 'github'
    }));
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 503 });
  }
});

/**
 * List all domains - Text response
 */
domainRoute.get('/list/text', cors(), async (req, res) => {
  try {
    const domains = await domainController.getDomains();
    const output = domains.map((domain, index) => `${index + 1}. ${domain}`).join('\n');
    sendText(res, output);
  } catch (error) {
    sendText(res, `Error: ${error.message}`);
  }
});

/**
 * Search domains - JSON response
 */
domainRoute.get('/search',
  cors(),
  query('q').notEmpty().withMessage('Search query is required'),
  validateRequest,
  async (req, res) => {
    try {
      const results = await domainController.searchDomains(req.query.q);
      
      sendJSON(res, formatSuccess({
        query: req.query.q,
        results,
        count: results.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 503 });
    }
  }
);

/**
 * Search domains - Text response
 */
domainRoute.get('/search/text',
  cors(),
  query('q').notEmpty().withMessage('Search query is required'),
  validateRequest,
  async (req, res) => {
    try {
      const results = await domainController.searchDomains(req.query.q);
      
      if (results.length === 0) {
        sendText(res, 'No domains found matching your query');
      } else {
        const output = results.map((domain, index) => `${index + 1}. ${domain}`).join('\n');
        sendText(res, output);
      }
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Get domain statistics - JSON response
 */
domainRoute.get('/stats', cors(), async (req, res) => {
  try {
    const stats = await domainController.getDomainStats();
    
    sendJSON(res, formatSuccess({
      totalDomains: stats.total,
      topLevelDomains: stats.tldBreakdown,
      longestDomain: stats.longest,
      shortestDomain: stats.shortest,
      averageLength: stats.averageLength
    }));
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 503 });
  }
});

/**
 * Legacy route - List all domains (backward compatibility)
 */
domainRoute.get('/', cors(), async (req, res) => {
  try {
    const domains = await domainController.getDomains();
    res.json(domains);
  } catch (error) {
    res.status(503).json({
      error: 'Domain data service unavailable',
      message: error.message
    });
  }
});

/**
 * Help endpoint
 */
domainRoute.get('/help', cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'Domain List API',
    message: 'Access and search CasJay\'s domain collection',
    endpoints: {
      list: {
        json: `GET ${host}/api/v1/me/domains/list`,
        text: `GET ${host}/api/v1/me/domains/list/text`
      },
      search: {
        json: `GET ${host}/api/v1/me/domains/search?q=query`,
        text: `GET ${host}/api/v1/me/domains/search/text?q=query`
      },
      stats: `GET ${host}/api/v1/me/domains/stats`,
      legacy: `GET ${host}/api/v1/me/domains`
    },
    parameters: {
      q: 'Search query for domain names (case-insensitive)'
    },
    source: 'https://raw.githubusercontent.com/casjay/public/main/domains.json',
    examples: {
      list: `curl ${host}/api/v1/me/domains/list`,
      listText: `curl ${host}/api/v1/me/domains/list/text`,
      search: `curl "${host}/api/v1/me/domains/search?q=dev"`,
      searchText: `curl "${host}/api/v1/me/domains/search/text?q=dev"`,
      stats: `curl ${host}/api/v1/me/domains/stats`
    },
    cli_examples: {
      searchFunction: `domain_search() { curl -s "${host}/api/v1/me/domains/search?q=\$1" | jq -r '.data.results[]'; }`,
      countDomains: `curl -s ${host}/api/v1/me/domains/stats | jq '.data.totalDomains'`
    }
  });
  
  sendJSON(res, data);
});

module.exports = domainRoute;