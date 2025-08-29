require('dotenv').config();
const express = require('express');
const profileRoute = express.Router();
const cors = require('cors');

const profileData = require('../controllers/profile');

profileRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.setHeader('Content-Type', 'application/json');
  
  if (req.path === '/help') {
    try {
      return res.json({
        title: 'Profile API',
        endpoint: `${host}/api/v1/profile`,
        description: 'Get CasJay\'s profile information from GitHub',
        cli_example: `curl ${host}/api/v1/profile`,
        bash_function: `get_profile() { curl -s "${host}/api/v1/profile" | jq -r '.profile | "Name: \\(.name) Company: \\(.company) Bio: \\(.bio)"'; }`
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  try {
    const profile = await profileData();
    res.json({ profile });
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

module.exports = profileRoute;
