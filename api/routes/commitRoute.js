// dotenv loaded in index.js
const express = require('express');
const cors = require('cors');
const { param, validationResult } = require('express-validator');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');
const { getJson } = require('../utils/httpClient');

const commitRoute = express.Router();

// GitHub URL for commit messages
const COMMIT_MESSAGES_URL = process.env.GIT_MESSAGE_URL || 'https://raw.githubusercontent.com/apimgr/gitmessages/main/src/data/messages.json';

// Cache for messages
let messagesCache = {
  data: null,
  timestamp: 0
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

/**
 * Validation middleware
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendJSON(res, formatError('Validation failed', {
      details: formatValidationErrors(errors.array())
    }), { status: 400 });
    return;
  }
  next();
}

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


/**
 * Get random commit message - JSON response
 */
commitRoute.get('/', cors(), async (req, res) => {
  try {
    const messages = await fetchMessages();
    const index = Math.floor(Math.random() * messages.length);
    const commitMessage = messages[index];
    
    sendJSON(res, formatSuccess({
      message: commitMessage,
      index,
      total: messages.length
    }), { noCache: true });
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 500 });
  }
});

/**
 * Get random commit message - Text response
 */
commitRoute.get('/text', cors(), async (req, res) => {
  try {
    const messages = await fetchMessages();
    const index = Math.floor(Math.random() * messages.length);
    const commitMessage = messages[index];
    
    sendText(res, commitMessage);
  } catch (error) {
    sendText(res, `Error: ${error.message}`);
  }
});

/**
 * Get multiple random commit messages
 */
commitRoute.get('/batch/:count',
  cors(),
  param('count').isInt({ min: 1, max: 200 }).withMessage('Count must be between 1 and 200'),
  validateRequest,
  async (req, res) => {
    try {
      const messages = await fetchMessages();
      const count = parseInt(req.params.count);
      const selectedMessages = [];
      
      for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * messages.length);
        selectedMessages.push(messages[index]);
      }
      
      sendJSON(res, formatSuccess({
        messages: selectedMessages,
        count: selectedMessages.length,
        total: messages.length
      }), { noCache: true });
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Get multiple random commit messages - Text response
 */
commitRoute.get('/batch/:count/text',
  cors(),
  param('count').isInt({ min: 1, max: 200 }).withMessage('Count must be between 1 and 200'),
  validateRequest,
  async (req, res) => {
    try {
      const messages = await fetchMessages();
      const count = parseInt(req.params.count);
      const selectedMessages = [];
      
      for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * messages.length);
        selectedMessages.push(messages[index]);
      }
      
      sendText(res, selectedMessages.join('\n'));
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

// Legacy route for backward compatibility
commitRoute.get('/txt', cors(), async (req, res) => {
  try {
    const messages = await fetchMessages();
    const index = Math.floor(Math.random() * messages.length);
    const commitMessage = messages[index];
    
    sendText(res, commitMessage);
  } catch (error) {
    sendText(res, `Error: ${error.message}`);
  }
});

// Legacy route for backward compatibility
commitRoute.get('/json', cors(), async (req, res) => {
  try {
    const messages = await fetchMessages();
    const index = Math.floor(Math.random() * messages.length);
    const commitMessage = messages[index];
    
    sendJSON(res, formatSuccess({
      message: commitMessage,
      index,
      total: messages.length
    }), { noCache: true });
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 500 });
  }
});

/**
 * Get all commit messages
 */
commitRoute.get('/all', cors(), async (req, res) => {
  try {
    const messages = await fetchMessages();
    
    sendJSON(res, formatSuccess({
      messages,
      count: messages.length,
      source: COMMIT_MESSAGES_URL
    }));
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 500 });
  }
});

/**
 * Help endpoint
 */
commitRoute.get('/help', cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'Git Commit Message Generator',
    message: 'Generate random commit messages for your git commits',
    source: COMMIT_MESSAGES_URL,
    endpoints: {
      random: {
        json: `GET ${host}/api/v1/tools/commit/`,
        text: `GET ${host}/api/v1/tools/commit/text`
      },
      batch: {
        json: `GET ${host}/api/v1/tools/commit/batch/:count`,
        text: `GET ${host}/api/v1/tools/commit/batch/:count/text`
      },
      all: `GET ${host}/api/v1/tools/commit/all`
    },
    parameters: {
      count: 'Number of commit messages to generate (1-20)'
    },
    examples: {
      random: `GET ${host}/api/v1/tools/commit/`,
      randomText: `GET ${host}/api/v1/tools/commit/text`,
      batch: `GET ${host}/api/v1/tools/commit/batch/5`,
      batchText: `GET ${host}/api/v1/tools/commit/batch/5/text`,
      all: `GET ${host}/api/v1/tools/commit/all`
    },
    cli_examples: {
      basic: `curl ${host}/api/v1/tools/commit/text`,
      json: `curl ${host}/api/v1/tools/commit/`,
      git_alias: `git config --global alias.random-commit '!f() { git commit -m "$(curl -s ${host}/api/v1/tools/commit/text)"; }; f'`,
      bash_function: `commit_random() { git commit -m "$(curl -s ${host}/api/v1/tools/commit/text)" "$@"; }`
    }
  });
  
  sendJSON(res, data);
});

module.exports = commitRoute;