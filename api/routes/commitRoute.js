require('dotenv').config();
const express = require('express');
const commitRoute = express.Router();
const cors = require('cors');
const { fetchJsonWithTimeout } = require('../utils/fetchWithTimeout');

// GitHub URL for commit messages
const COMMIT_MESSAGES_URL = process.env.GIT_MESSAGE_URL || 'https://github.com/apimgr/Commitmessages/raw/refs/heads/main/gitmessages.json';

// Cache for messages
let messagesCache = {
  data: null,
  timestamp: 0
};

const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

// Fallback messages in case GitHub is unavailable
const fallbackMessages = [
  "🗃️ Committing everything that changed 🗃️",
  "🚀 Version Bump: {version}-git 🚀",
  "🔧 Fixed bug that prevented this from working",
  "✨ Added new feature",
  "📝 Updated documentation",
  "🐛 Fixed typo in code",
  "♻️ Refactored for better performance",
  "🎨 Improved code structure",
  "⚡️ Performance improvements",
  "🔒 Security patch applied",
  "🌐 Updated dependencies",
  "💄 UI improvements",
  "🔨 Build configuration update",
  "🧹 Code cleanup",
  "📦 Package updates"
];

// Function to fetch messages with caching
async function fetchMessages() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (messagesCache.data && (now - messagesCache.timestamp) < CACHE_TTL) {
    return messagesCache.data;
  }
  
  try {
    const data = await fetchJsonWithTimeout(COMMIT_MESSAGES_URL, {}, 5000);
    
    // Update cache
    messagesCache = {
      data: data,
      timestamp: now
    };
    
    return data;
  } catch (error) {
    console.error('Failed to fetch commit messages from GitHub:', error.message);
    
    // Return cached data if available, otherwise use fallback
    if (messagesCache.data) {
      return messagesCache.data;
    }
    return fallbackMessages;
  }
}


commitRoute.get('/', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const messages = await fetchMessages();
    const index = Math.floor(Math.random() * messages.length);
    const commitMessage = messages[index];
    
    res.json({
      message: commitMessage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

commitRoute.get('/json', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const messages = await fetchMessages();
    const index = Math.floor(Math.random() * messages.length);
    const commitMessage = messages[index];
    
    res.json({
      message: commitMessage
    });
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
    
    res.send(commitMessage);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

commitRoute.get('/all', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const messages = await fetchMessages();
    
    res.json({
      messages: messages,
      count: messages.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

commitRoute.get('/help', cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.setHeader('Content-Type', 'application/json');
  try {
    res.json({
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
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = commitRoute;