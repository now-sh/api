require('dotenv').config();
const express = require('express');
const githubRoute = express.Router();
const cors = require('cors');
const fetch = require('node-fetch');

const myHeaders = require('../middleware/headers');
const githubToken = process.env.GITHUB_API_KEY;
const cache = null;
const lastCacheTime = null;

const api_version = process.env.GITHUB_API_VERSION || '2022-11-28';

githubRoute.get('', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
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
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
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

githubRoute.get('/jason', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const response = await fetch('https://api.github.com/users/casjay?per_page=200&sort=name', {
    method: 'GET',
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': api_version, Authorization: 'Bearer ' + githubToken, myHeaders },
  });
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (error) {
    res.json({ error: error.message });
  }
});

githubRoute.get('/user/:id', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const response = await fetch(`https://api.github.com/users/${req.params.id}?per_page=200&sort=name`, {
    method: 'GET',
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': api_version, Authorization: 'Bearer ' + githubToken, myHeaders },
  });
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (error) {
    res.json({ error: error.message });
  }
});

githubRoute.get('/repos/:id', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const response = await fetch(`https://api.github.com/users/${req.params.id}/repos?per_page=200&sort=name`, {
    method: 'GET',
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': api_version, Authorization: 'Bearer ' + githubToken, myHeaders },
  });
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (error) {
    res.json({ error: error.message });
  }
});

githubRoute.get('/orgs/:id', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const response = await fetch(`https://api.github.com/users/${req.params.id}/orgs?per_page=200&sort=name`, {
    method: 'GET',
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': api_version, Authorization: 'Bearer ' + githubToken, myHeaders },
  });
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (error) {
    res.json({ error: error.message });
  }
});

githubRoute.get('/org/:id', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const response = await fetch(`https://api.github.com/orgs/${req.params.id}?per_page=200&sort=name`, {
    method: 'GET',
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': api_version, Authorization: 'Bearer ' + githubToken, myHeaders },
  });
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = githubRoute;
