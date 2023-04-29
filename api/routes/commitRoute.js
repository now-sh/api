require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const commitRoute = express.Router();
const cors = require('cors');
const messages = require('../public/data/gitmessages.json');

const url = process.env.GIT_MESSAGE_URL || 'https://github.com/apimgr/gitmessages/raw/main/api/messages.json';

commitRoute.get('/', cors(), async (req, res) => {
  const index = Math.floor(Math.random() * (messages.length + 1));
  const commitMessage = `${messages[index]} `;
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        message: commitMessage,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

commitRoute.get('/json', cors(), async (req, res) => {
  const index = Math.floor(Math.random() * (messages.length + 1));
  const commitMessage = `${messages[index]} `;
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        message: commitMessage,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

commitRoute.get('/txt', cors(), async (req, res) => {
  const index = Math.floor(Math.random() * (messages.length + 1));
  const commitMessage = `${messages[index]} `;
  res.setHeader('Content-Type', 'text/plain');
  try {
    res.send(commitMessage);
  } catch (error) {
    res.json({ error: error.message });
  }
});

commitRoute.get('/help', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        url: url,
        default: `${req.protocol}://${req.headers.host}/api/v1/commit/`,
        txt: `${req.protocol}://${req.headers.host}/api/v1/commit/txt/`,
        json: `${req.protocol}://${req.headers.host}/api/v1/commit/json/`,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = commitRoute;
