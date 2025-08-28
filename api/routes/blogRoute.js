require('dotenv').config();
const express = require('express');
const blogRoute = express.Router();
const cors = require('cors');

const fetch = require('node-fetch');

const { getHeaders } = require('../middleware/headers');
const { fetchAllGitHubPages } = require('../utils/pagination');
const githubToken = process.env.GITHUB_API_KEY;
const api = 'https://api.github.com/repos/malaks-us/jason/contents/_posts';

const cache = null;
const lastCacheTime = null;
const blog = process.env.BLOG_URL || api;

blogRoute.get('/', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        Jason: `${req.protocol}://${req.headers.host}/api/v1/blogs/jason`,
        Users: `${req.protocol}://${req.headers.host}/api/v1/blogs/:user/:repo`,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

blogRoute.get('/help', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        Jason: `${req.protocol}://${req.headers.host}/api/v1/blogs/jason`,
        Users: `${req.protocol}://${req.headers.host}/api/v1/blogs/:user/:repo`,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

blogRoute.get('/jason', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  try {
    const headers = getHeaders({
      'Authorization': `token ${githubToken}`
    });
    
    const posts = await fetchAllGitHubPages(blog, headers);
    res.setHeader('Content-Type', 'application/json');
    res.send(posts);
  } catch (error) {
    res.json({ error: error.message });
  }
});

blogRoute.get('/:id', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  try {
    const repoID = req.params.id;
    const repoURL = 'https://api.github.com/' + repoID + '/contents/_posts';
    const headers = getHeaders({
      'Authorization': `token ${githubToken}`
    });

    const posts = await fetchAllGitHubPages(repoURL, headers);
    res.setHeader('Content-Type', 'application/json');
    res.send(posts);
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = blogRoute;
