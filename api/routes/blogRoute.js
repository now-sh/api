require('dotenv').config();
const express = require('express');
const blogRoute = express.Router();
const cors = require('cors');

const fetch = require('node-fetch');

const myHeaders = require('../middleware/headers');
const githubToken = process.env.GITHUB_API_KEY;

const cache = null;
const lastCacheTime = null;

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

blogRoute.get('/jason', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const repo = req.params.id;
  const response = await fetch(
    'https://api.github.com/repos/malaks-us/jason/contents/_posts',
    {
      Headers: {
        Authorization: `token ${githubToken}`,
        myHeaders,
      },
    }
  );
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (err) {
    res.json({ error: error.message });
  }
});

blogRoute.get('/:id', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const repoID = req.params.id;
  const repoURL = 'https://api.github.com/' + repoID + '/contents/_posts';

  const response = await fetch(repoURL, {
    Headers: {
      Authorization: `token ${githubToken}`,
      myHeaders,
    },
  });
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (err) {
    res.json({ error: error.message });
  }
});

module.exports = blogRoute;
