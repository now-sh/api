require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const { getHeaders } = require('../middleware/headers');
const { getJson } = require('../utils/httpClient');
const httpClient = require('../utils/httpClient');
const { fetchAllGitHubPages } = require('../utils/pagination');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');
const githubToken = process.env.GITHUB_API_KEY;

const githubRoute = express.Router();

// Cache for API responses by endpoint
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const api_version = process.env.GITHUB_API_VERSION || '2022-11-28';

// Check if GitHub token is valid (not blank, not placeholder)
const isValidToken = githubToken && 
                    githubToken.trim() !== '' && 
                    githubToken !== 'myverylonggithubapikey';

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

// Build headers with or without auth
const buildGitHubHeaders = () => {
  const baseHeaders = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': api_version
  };
  
  if (isValidToken) {
    baseHeaders['Authorization'] = `token ${githubToken}`;
  }
  
  // Use getHeaders to include the HEADER_AGENT
  return getHeaders(baseHeaders);
};


/**
 * Help endpoint
 */
githubRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'GitHub API',
    message: 'Access GitHub user and repository information',
    endpoints: {
      user: {
        byId: `GET ${host}/api/v1/social/github/user/:id`
      },
      repos: {
        user: `GET ${host}/api/v1/social/github/repos/:id`,
        org: `GET ${host}/api/v1/social/github/org/:id`
      },
      organizations: `GET ${host}/api/v1/social/github/orgs/:id`
    },
    parameters: {
      id: 'GitHub username or organization name'
    },
    examples: {
      userInfo: `GET ${host}/api/v1/social/github/user/octocat`,
      userRepos: `GET ${host}/api/v1/social/github/repos/octocat`,
      orgRepos: `GET ${host}/api/v1/social/github/org/github`,
      userOrgs: `GET ${host}/api/v1/social/github/orgs/octocat`
    },
    note: 'Returns raw GitHub API responses for compatibility with existing sites'
  });
  
  sendJSON(res, data);
});

// Helper function to fetch with cache and headers
async function fetchWithCacheAndHeaders(url, cacheKey) {
  const now = Date.now();
  const cached = apiCache.get(cacheKey);
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return { data: cached.data, headers: cached.headers || {} };
  }
  
  // Use axios directly to get both data and headers
  const axios = require('axios');
  const response = await axios.get(url, {
    headers: buildGitHubHeaders(),
    timeout: 10000
  });
  
  apiCache.set(cacheKey, {
    data: response.data,
    headers: response.headers,
    timestamp: now
  });
  
  return { data: response.data, headers: response.headers };
}

// Helper function to fetch with cache (backward compatibility)
async function fetchWithCache(url, cacheKey) {
  const result = await fetchWithCacheAndHeaders(url, cacheKey);
  return result.data;
}


/**
 * Get GitHub user info - Raw response for compatibility
 */
githubRoute.get('/user/:id',
  cors(),
  param('id').notEmpty().withMessage('User ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      const result = await fetchWithCacheAndHeaders(`https://api.github.com/users/${req.params.id}`, `user:${req.params.id}`);
      // Return raw GitHub response for existing site compatibility
      res.json(result.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

/**
 * Get user repositories - Raw array for compatibility
 */
githubRoute.get('/repos/:id',
  cors(),
  param('id').notEmpty().withMessage('User ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      let allRepos = [];
      let page = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const cacheKey = `repos:${req.params.id}:page:${page}`;
        const result = await fetchWithCacheAndHeaders(`https://api.github.com/users/${req.params.id}/repos?sort=name&per_page=100&page=${page}`, cacheKey);
        
        if (result.data.length === 0) {
          hasMorePages = false;
        } else {
          allRepos = allRepos.concat(result.data);
          page++;
          
          // Safety limit to prevent infinite loops
          if (page > 20) {
            hasMorePages = false;
          }
        }
      }
      
      // Sort by name to ensure consistent ordering
      allRepos.sort((a, b) => a.name.localeCompare(b.name));
      
      // Return raw array for existing site compatibility
      res.json(allRepos);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        res.status(404).json([]);
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

/**
 * Get user organizations - Raw array for compatibility
 */
githubRoute.get('/orgs/:id',
  cors(),
  param('id').notEmpty().withMessage('User ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      let allOrgs = [];
      let page = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const cacheKey = `orgs:${req.params.id}:page:${page}`;
        const result = await fetchWithCacheAndHeaders(`https://api.github.com/users/${req.params.id}/orgs?sort=name&per_page=100&page=${page}`, cacheKey);
        
        if (result.data.length === 0) {
          hasMorePages = false;
        } else {
          allOrgs = allOrgs.concat(result.data);
          page++;
          
          // Safety limit to prevent infinite loops
          if (page > 10) {
            hasMorePages = false;
          }
        }
      }
      
      // Sort by login name to ensure consistent ordering
      allOrgs.sort((a, b) => a.login.localeCompare(b.login));
      
      // Return raw array for existing site compatibility
      res.json(allOrgs);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        res.status(404).json([]);
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

/**
 * Get organization repositories - Raw array for compatibility
 */
githubRoute.get('/org/:id',
  cors(),
  param('id').notEmpty().withMessage('Organization ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      let allRepos = [];
      let page = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const cacheKey = `org:${req.params.id}:repos:page:${page}`;
        const result = await fetchWithCacheAndHeaders(`https://api.github.com/orgs/${req.params.id}/repos?sort=name&per_page=100&page=${page}`, cacheKey);
        
        if (result.data.length === 0) {
          hasMorePages = false;
        } else {
          allRepos = allRepos.concat(result.data);
          page++;
          
          // Safety limit to prevent infinite loops
          if (page > 20) {
            hasMorePages = false;
          }
        }
      }
      
      // Sort by name to ensure consistent ordering
      allRepos.sort((a, b) => a.name.localeCompare(b.name));
      
      // Return raw array for existing site compatibility
      res.json(allRepos);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        res.status(404).json([]);
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

module.exports = githubRoute;
