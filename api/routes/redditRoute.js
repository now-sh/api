require('dotenv').config();
const express = require('express');
const redditRoute = express.Router();
const cors = require('cors');

const fetch = require('node-fetch');

redditRoute.get('/', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        Jason: `${req.protocol}://${req.headers.host}/api/v1/reddit/jason`,
        Users: `${req.protocol}://${req.headers.host}/api/v1/reddit/:user`,
        Reddits: `${req.protocol}://${req.headers.host}/api/v1/reddit/:subreddit`,
      })
    );
  } catch (err) {
    res.json({ error: err.message });
  }
});

redditRoute.get('/jason', cors(), async (req, res) => {
  const response = await fetch(
    `https://www.reddit.com/u/casjay/.json?sort=new&limit=500`
  );
  res.setHeader('Content-Type', 'application/json');
  try {
    const json = await response.json();
    this.json = json.data.children;
    this.json.shift;
    this.json.shift;
    this.json.shift;
    res.send(
      JSON.stringify({
        reddit: this.json,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

redditRoute.get('/u/:id', cors(), async (req, res) => {
  const response = await fetch(
    `https://www.reddit.com/u/${req.params.id}/.json?sort=new&limit=500`
  );
  res.setHeader('Content-Type', 'application/json');
  try {
    const json = await response.json();
    this.json = json.data.children;
    this.json.shift;
    this.json.shift;
    this.json.shift;
    res.send(
      JSON.stringify({
        reddit: this.json,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

redditRoute.get('/:id', cors(), async (req, res) => {
  const response = await fetch(
    `https://www.reddit.com/r/${req.params.id}/.json?sort=new&limit=500`
  );
  res.setHeader('Content-Type', 'application/json');
  try {
    const json = await response.json();
    this.json = json.data.children;
    this.json.shift;
    this.json.shift;
    this.json.shift;
    res.send(
      JSON.stringify({
        reddit: this.json,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = redditRoute;
