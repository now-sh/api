require('dotenv').config();
const express = require('express');
const githubRoute = express.Router();
const cors = require('cors');
const { getHeaders } = require('../middleware/headers');
const { getJson } = require('../utils/httpClient');
const { fetchAllGitHubPages } = require('../utils/pagination');
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
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        jason: `My github repo:                    ${req.protocol}://${req.headers.host}/api/v1/git/jason`,
        org: `Get repos from a github org:       ${req.protocol}://${req.headers.host}/api/v1/git/org/:id`,
        orgs: `Get orgs owned by a github user:   ${req.protocol}://${req.headers.host}/api/v1/git/orgs/:id`,
        users: `Get user info from github:         ${req.protocol}://${req.headers.host}/api/v1/git/user/:id`,
        repo: `List repos owned by a github user: ${req.protocol}://${req.headers.host}/api/v1/git/repos/:id`,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});
githubRoute.get('/help', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        jason: `My github repo:                    ${req.protocol}://${req.headers.host}/api/v1/git/jason`,
        org: `Get repos from a github org:       ${req.protocol}://${req.headers.host}/api/v1/git/org/:id`,
        orgs: `Get orgs owned by a github user:   ${req.protocol}://${req.headers.host}/api/v1/git/orgs/:id`,
        users: `Get user info from github:         ${req.protocol}://${req.headers.host}/api/v1/git/user/:id`,
        repo: `List repos owned by a github user: ${req.protocol}://${req.headers.host}/api/v1/git/repos/:id`,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Helper function to fetch with cache
async function fetchWithCache(url, cacheKey) {
  const now = Date.now();
  const cached = apiCache.get(cacheKey);
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await getJson(url, {
    headers: buildGitHubHeaders(),
    timeout: 10000
  });
  
  apiCache.set(cacheKey, {
    data: data,
    timestamp: now
  });
  
  return data;
}

githubRoute.get('/jason', cors(), async (req, res) => {
  try {
    const json = await fetchWithCache('https://api.github.com/users/casjay', 'user:casjay');
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

githubRoute.get('/user/:id', cors(), async (req, res) => {
  try {
    const json = await getJson(`https://api.github.com/users/${req.params.id}`, {
      headers: buildGitHubHeaders()
    });
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

githubRoute.get('/repos/:id', cors(), async (req, res) => {
  try {
    let allRepos = [];
    let page = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      const repos = await getJson(`https://api.github.com/users/${req.params.id}/repos?sort=name&per_page=100&page=${page}`, {
        headers: buildGitHubHeaders()
      });
      
      if (repos.length === 0) {
        hasMorePages = false;
      } else {
        allRepos = allRepos.concat(repos);
        page++;
        
        // Safety limit to prevent infinite loops
        if (page > 20) {
          hasMorePages = false;
        }
      }
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.send({
      repos: allRepos,
      totalRepos: allRepos.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

githubRoute.get('/orgs/:id', cors(), async (req, res) => {
  try {
    let allOrgs = [];
    let page = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      const orgs = await getJson(`https://api.github.com/users/${req.params.id}/orgs?sort=name&per_page=100&page=${page}`, {
        headers: buildGitHubHeaders()
      });
      
      if (orgs.length === 0) {
        hasMorePages = false;
      } else {
        allOrgs = allOrgs.concat(orgs);
        page++;
        
        // Safety limit to prevent infinite loops
        if (page > 10) {
          hasMorePages = false;
        }
      }
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.send({
      orgs: allOrgs,
      totalOrgs: allOrgs.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

githubRoute.get('/org/:id', cors(), async (req, res) => {
  try {
    let allRepos = [];
    let page = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      const repos = await getJson(`https://api.github.com/orgs/${req.params.id}/repos?sort=name&per_page=100&page=${page}`, {
        headers: buildGitHubHeaders()
      });
      
      if (repos.length === 0) {
        hasMorePages = false;
      } else {
        allRepos = allRepos.concat(repos);
        page++;
        
        // Safety limit to prevent infinite loops
        if (page > 20) {
          hasMorePages = false;
        }
      }
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.send({
      repos: allRepos,
      totalRepos: allRepos.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = githubRoute;
