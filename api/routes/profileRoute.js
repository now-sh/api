// dotenv loaded in index.js
const express = require('express');
const cors = require('cors');
const profileData = require('../controllers/profile');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');

const profileRoute = express.Router();


/**
 * Get profile - JSON response
 */
profileRoute.get('/', cors(), async (req, res) => {
  try {
    const profile = await profileData();
    
    sendJSON(res, formatSuccess({
      profile: {
        name: profile.name,
        username: profile.login,
        bio: profile.bio,
        company: profile.company,
        location: profile.location,
        email: profile.email,
        blog: profile.blog,
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
        avatarUrl: profile.avatar_url,
        githubUrl: profile.html_url,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }
    }));
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 503 });
  }
});

/**
 * Get profile - Text response
 */
profileRoute.get('/text', cors(), async (req, res) => {
  try {
    const profile = await profileData();
    const output = `Name: ${profile.name}\nUsername: ${profile.login}\nBio: ${profile.bio}\nCompany: ${profile.company}\nLocation: ${profile.location}\nFollowers: ${profile.followers}\nFollowing: ${profile.following}\nPublic Repos: ${profile.public_repos}`;
    sendText(res, output);
  } catch (error) {
    sendText(res, `Error: ${error.message}`);
  }
});

/**
 * Help endpoint
 */
profileRoute.get('/help', cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'Profile API',
    message: 'Get CasJay\'s profile information from GitHub',
    endpoints: {
      json: `GET ${host}/api/v1/auth/profile`,
      text: `GET ${host}/api/v1/auth/profile/text`
    },
    examples: {
      json: `GET ${host}/api/v1/auth/profile`,
      text: `GET ${host}/api/v1/auth/profile/text`
    },
    cli_examples: {
      basic: `curl ${host}/api/v1/auth/profile`,
      text: `curl ${host}/api/v1/auth/profile/text`,
      formatted: `curl -s "${host}/api/v1/auth/profile" | jq -r '.data.profile | "Name: \\(.name) Company: \\(.company) Bio: \\(.bio)"'`
    }
  });
  
  sendJSON(res, data);
});

module.exports = profileRoute;
