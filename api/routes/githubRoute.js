require('dotenv').config();
const express = require('express');
const githubRoute = express.Router();
const cors = require('cors');
const { getHeaders } = require('../middleware/headers');
const { getJson } = require('../utils/httpClient');
const httpClient = require('../utils/httpClient');
const { fetchAllGitHubPages } = require('../utils/pagination');
const { setStandardHeaders } = require('../utils/standardHeaders');
const githubToken = process.env.GITHUB_API_KEY;

// Cache for API responses by endpoint
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const api_version = process.env.GITHUB_API_VERSION || '2022-11-28';

// Check if GitHub token is valid (not blank, not placeholder)
const isValidToken = githubToken && 
                    githubToken.trim() !== '' && 
                    githubToken !== 'myverylonggithubapikey';

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

githubRoute.get('', cors(), async (req, res) => {
  try {
    const helpData = {
      jason: `My github repo:                    ${req.protocol}://${req.headers.host}/api/v1/git/jason`,
      org: `Get repos from a github org:       ${req.protocol}://${req.headers.host}/api/v1/git/org/:id`,
      orgs: `Get orgs owned by a github user:   ${req.protocol}://${req.headers.host}/api/v1/git/orgs/:id`,
      users: `Get user info from github:         ${req.protocol}://${req.headers.host}/api/v1/git/user/:id`,
      repo: `List repos owned by a github user: ${req.protocol}://${req.headers.host}/api/v1/git/repos/:id`,
    };
    setStandardHeaders(res, helpData);
    res.send(helpData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
githubRoute.get('/help', cors(), async (req, res) => {
  try {
    const helpData = {
      jason: `My github repo:                    ${req.protocol}://${req.headers.host}/api/v1/git/jason`,
      org: `Get repos from a github org:       ${req.protocol}://${req.headers.host}/api/v1/git/org/:id`,
      orgs: `Get orgs owned by a github user:   ${req.protocol}://${req.headers.host}/api/v1/git/orgs/:id`,
      users: `Get user info from github:         ${req.protocol}://${req.headers.host}/api/v1/git/user/:id`,
      repo: `List repos owned by a github user: ${req.protocol}://${req.headers.host}/api/v1/git/repos/:id`,
    };
    setStandardHeaders(res, helpData);
    res.send(helpData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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


githubRoute.get('/jason', cors(), async (req, res) => {
  try {
    const result = await fetchWithCacheAndHeaders('https://api.github.com/users/casjay', 'user:casjay');
    setStandardHeaders(res, result.data, { headers: result.headers });
    res.send(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

githubRoute.get('/user/:id', cors(), async (req, res) => {
  try {
    const result = await fetchWithCacheAndHeaders(`https://api.github.com/users/${req.params.id}`, `user:${req.params.id}`);
    setStandardHeaders(res, result.data, { headers: result.headers });
    res.send(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

githubRoute.get('/repos/:id', cors(), async (req, res) => {
  try {
    let allRepos = [];
    let page = 1;
    let hasMorePages = true;
    let lastHeaders = {};
    
    while (hasMorePages) {
      const cacheKey = `repos:${req.params.id}:page:${page}`;
      const result = await fetchWithCacheAndHeaders(`https://api.github.com/users/${req.params.id}/repos?sort=name&per_page=100&page=${page}`, cacheKey);
      
      lastHeaders = result.headers; // Keep the latest headers for rate limit info
      
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
    
    // Sort by name to ensure consistent ordering across pages
    allRepos.sort((a, b) => a.name.localeCompare(b.name));
    
    // If no repos, return link to GitHub profile
    if (allRepos.length === 0) {
      const profileLink = {
        message: 'No repositories found',
        github_profile: `<a href="https://github.com/${req.params.id}" target="_blank" rel="noopener noreferrer">View ${req.params.id} on GitHub</a>`
      };
      setStandardHeaders(res, profileLink, {
        headers: lastHeaders,
        emptyMessage: 'No repositories found for this user'
      });
      res.send(profileLink);
    } else {
      setStandardHeaders(res, allRepos, {
        headers: lastHeaders
      });
      res.send(allRepos);
    }
  } catch (error) {
    // If user doesn't exist, return link to GitHub profile
    if (error.response && error.response.status === 404) {
      const profileLink = {
        message: 'User not found',
        github_profile: `<a href="https://github.com/${req.params.id}" target="_blank" rel="noopener noreferrer">View ${req.params.id} on GitHub</a>`
      };
      setStandardHeaders(res, profileLink, {
        emptyMessage: 'User not found'
      });
      res.send(profileLink);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

githubRoute.get('/orgs/:id', cors(), async (req, res) => {
  try {
    let allOrgs = [];
    let page = 1;
    let hasMorePages = true;
    let lastHeaders = {};
    
    while (hasMorePages) {
      const cacheKey = `orgs:${req.params.id}:page:${page}`;
      const result = await fetchWithCacheAndHeaders(`https://api.github.com/users/${req.params.id}/orgs?sort=name&per_page=100&page=${page}`, cacheKey);
      
      lastHeaders = result.headers; // Keep the latest headers for rate limit info
      
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
    
    // Sort by login name to ensure consistent ordering across pages
    allOrgs.sort((a, b) => a.login.localeCompare(b.login));
    
    setStandardHeaders(res, allOrgs, {
      headers: lastHeaders,
      emptyMessage: 'No organizations found for this user'
    });
    res.send(allOrgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

githubRoute.get('/org/:id', cors(), async (req, res) => {
  try {
    let allRepos = [];
    let page = 1;
    let hasMorePages = true;
    let lastHeaders = {};
    
    while (hasMorePages) {
      const cacheKey = `org:${req.params.id}:repos:page:${page}`;
      const result = await fetchWithCacheAndHeaders(`https://api.github.com/orgs/${req.params.id}/repos?sort=name&per_page=100&page=${page}`, cacheKey);
      
      lastHeaders = result.headers; // Keep the latest headers for rate limit info
      
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
    
    // Sort by name to ensure consistent ordering across pages
    allRepos.sort((a, b) => a.name.localeCompare(b.name));
    
    // If no repos, return link to GitHub organization
    if (allRepos.length === 0) {
      const profileLink = {
        message: 'No repositories found',
        github_profile: `<a href="https://github.com/${req.params.id}" target="_blank" rel="noopener noreferrer">View ${req.params.id} on GitHub</a>`
      };
      setStandardHeaders(res, profileLink, {
        headers: lastHeaders,
        emptyMessage: 'No repositories found for this organization'
      });
      res.send(profileLink);
    } else {
      setStandardHeaders(res, allRepos, {
        headers: lastHeaders
      });
      res.send(allRepos);
    }
  } catch (error) {
    // If organization doesn't exist, return link to GitHub profile
    if (error.response && error.response.status === 404) {
      const profileLink = {
        message: 'Organization not found',
        github_profile: `<a href="https://github.com/${req.params.id}" target="_blank" rel="noopener noreferrer">View ${req.params.id} on GitHub</a>`
      };
      setStandardHeaders(res, profileLink, {
        emptyMessage: 'Organization not found'
      });
      res.send(profileLink);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = githubRoute;
