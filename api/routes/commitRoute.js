require('dotenv').config();
const express = require('express');
const commitRoute = express.Router();
const cors = require('cors');
const { setStandardHeaders } = require('../utils/standardHeaders');
const { getJson } = require('../utils/httpClient');

// GitHub URL for commit messages
const COMMIT_MESSAGES_URL = process.env.GIT_MESSAGE_URL || 'https://raw.githubusercontent.com/apimgr/Commitmessages/refs/heads/main/gitmessages.json';

// Cache for messages
let messagesCache = {
  data: null,
  timestamp: 0
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache


// Function to fetch messages with caching
async function fetchMessages() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (messagesCache.data && (now - messagesCache.timestamp) < CACHE_TTL) {
    return messagesCache.data;
  }
  
  const data = await getJson(COMMIT_MESSAGES_URL, { timeout: 5000 });
  
  // Update cache
  messagesCache = {
    data: data,
    timestamp: now
  };
  
  return data;
}


commitRoute.get('/', cors(), async (req, res) => {
  try {
    const messages = await fetchMessages();
    const index = Math.floor(Math.random() * messages.length);
    const commitMessage = messages[index];
    
    const data = {
      message: commitMessage
    };
    setStandardHeaders(res, data, { noCache: true });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

commitRoute.get('/json', cors(), async (req, res) => {
  try {
    const messages = await fetchMessages();
    const index = Math.floor(Math.random() * messages.length);
    const commitMessage = messages[index];
    
    const data = {
      message: commitMessage
    };
    setStandardHeaders(res, data, { noCache: true });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

commitRoute.get('/txt', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  try {
    const messages = await fetchMessages();
    const index = Math.floor(Math.random() * messages.length);
    const commitMessage = messages[index];
    
    res.send(commitMessage + '\n');
  } catch (error) {
    res.status(500).send(`Error: ${error.message}\n`);
  }
});

commitRoute.get('/all', cors(), async (req, res) => {
  try {
    const messages = await fetchMessages();
    
    const data = {
      messages: messages,
      count: messages.length
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

commitRoute.get('/help', cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  try {
    const data = {
      title: 'Git Commit Message Generator',
      description: 'Generate random commit messages for your git commits',
      url: COMMIT_MESSAGES_URL,
      endpoints: {
        default: `${host}/api/v1/commit/`,
        json: `${host}/api/v1/commit/json/`,
        txt: `${host}/api/v1/commit/txt/`,
        all: `${host}/api/v1/commit/all`
      },
      cli_examples: {
        basic: `curl ${host}/api/v1/commit/txt`,
        json: `curl ${host}/api/v1/commit`,
        git_alias: `git config --global alias.random-commit '!f() { git commit -m "$(curl -s ${host}/api/v1/commit/txt)"; }; f'`,
        bash_function: `commit_random() { git commit -m "$(curl -s ${host}/api/v1/commit/txt)" "$@"; }`
      }
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = commitRoute;