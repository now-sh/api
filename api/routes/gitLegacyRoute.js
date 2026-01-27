// dotenv loaded in index.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { param, validationResult } = require('express-validator');
const { formatValidationErrors } = require('../utils/validationHelper');

const gitLegacyRoute = express.Router();

// Cache for API responses
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const githubToken = process.env.GITHUB_API_KEY;
const api_version = process.env.GITHUB_API_VERSION || '2022-11-28';

// Check if GitHub token is valid
const isValidToken = githubToken && 
                    githubToken.trim() !== '' && 
                    githubToken !== 'myverylonggithubapikey';

// Build headers with or without auth
const buildGitHubHeaders = () => {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': api_version,
    'User-Agent': 'Node.js API Client'
  };
  
  if (isValidToken) {
    headers['Authorization'] = `token ${githubToken}`;
  }
  
  return headers;
};

// Helper function to fetch with cache
async function fetchWithCache(url, cacheKey) {
  const now = Date.now();
  const cached = apiCache.get(cacheKey);
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  const response = await axios.get(url, {
    headers: buildGitHubHeaders(),
    timeout: 10000
  });
  
  apiCache.set(cacheKey, {
    data: response.data,
    timestamp: now
  });
  
  return response.data;
}

// Validation middleware
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: formatValidationErrors(errors.array())
    });
    return;
  }
  next();
}

/**
 * Legacy Git Routes - For backward compatibility
 */

// Help endpoint
gitLegacyRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  res.json({
    success: true,
    data: {
      title: 'GitHub API (Legacy Routes)',
      message: 'Legacy routes for backward compatibility. New routes are under /api/v1/social/github',
      endpoints: {
        jason: `GET ${host}/api/v1/git/jason`,
        user: `GET ${host}/api/v1/git/user/:id`,
        repos: `GET ${host}/api/v1/git/repos/:id`, 
        orgs: `GET ${host}/api/v1/git/orgs/:id`,
        org: `GET ${host}/api/v1/git/org/:id`
      },
      newRoutes: {
        jason: `GET ${host}/api/v1/me/info/github`,
        user: `GET ${host}/api/v1/social/github/user/:id`,
        repos: `GET ${host}/api/v1/social/github/repos/:id`,
        orgs: `GET ${host}/api/v1/social/github/orgs/:id`,
        org: `GET ${host}/api/v1/social/github/org/:id`
      }
    }
  });
});

/**
 * Get Jason's GitHub info - Legacy route
 */
gitLegacyRoute.get('/jason', cors(), async (req, res) => {
  try {
    const data = await fetchWithCache('https://api.github.com/users/casjay', 'user:casjay');
    res.json(data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * Get GitHub user info
 */
gitLegacyRoute.get('/user/:id',
  cors(),
  param('id').notEmpty().withMessage('User ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      const data = await fetchWithCache(`https://api.github.com/users/${req.params.id}`, `user:${req.params.id}`);
      res.json(data);
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
 * Get user repositories
 */
gitLegacyRoute.get('/repos/:id',
  cors(),
  param('id').notEmpty().withMessage('User ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      let allRepos = [];
      let page = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const data = await fetchWithCache(
          `https://api.github.com/users/${req.params.id}/repos?sort=name&per_page=100&page=${page}`, 
          `repos:${req.params.id}:page:${page}`
        );
        
        if (data.length === 0) {
          hasMorePages = false;
        } else {
          allRepos = allRepos.concat(data);
          page++;
          if (page > 20) hasMorePages = false; // Safety limit
        }
      }
      
      allRepos.sort((a, b) => a.name.localeCompare(b.name));
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
 * Get user organizations
 */
gitLegacyRoute.get('/orgs/:id',
  cors(),
  param('id').notEmpty().withMessage('User ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      let allOrgs = [];
      let page = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const data = await fetchWithCache(
          `https://api.github.com/users/${req.params.id}/orgs?sort=name&per_page=100&page=${page}`,
          `orgs:${req.params.id}:page:${page}`
        );
        
        if (data.length === 0) {
          hasMorePages = false;
        } else {
          allOrgs = allOrgs.concat(data);
          page++;
          if (page > 10) hasMorePages = false; // Safety limit
        }
      }
      
      allOrgs.sort((a, b) => a.login.localeCompare(b.login));
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
 * Get organization repositories
 */
gitLegacyRoute.get('/org/:id',
  cors(),
  param('id').notEmpty().withMessage('Organization ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      let allRepos = [];
      let page = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const data = await fetchWithCache(
          `https://api.github.com/orgs/${req.params.id}/repos?sort=name&per_page=100&page=${page}`,
          `org:${req.params.id}:repos:page:${page}`
        );
        
        if (data.length === 0) {
          hasMorePages = false;
        } else {
          allRepos = allRepos.concat(data);
          page++;
          if (page > 20) hasMorePages = false; // Safety limit
        }
      }
      
      allRepos.sort((a, b) => a.name.localeCompare(b.name));
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

module.exports = gitLegacyRoute;