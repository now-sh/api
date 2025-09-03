require('dotenv').config();
const express = require('express');
const profileRoute = express.Router();
const cors = require('cors');

const profileData = require('../controllers/profile');
const { setStandardHeaders } = require('../utils/standardHeaders');

profileRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  if (req.path === '/help') {
    try {
      const data = {
        title: 'Profile API',
        endpoint: `${host}/api/v1/profile`,
        description: 'Get CasJay\'s profile information from GitHub',
        cli_example: `curl ${host}/api/v1/profile`,
        bash_function: `get_profile() { curl -s "${host}/api/v1/profile" | jq -r '.profile | "Name: \\(.name) Company: \\(.company) Bio: \\(.bio)"'; }`
      };
      setStandardHeaders(res, data);
      return res.json(data);
    } catch (error) {
      const data = { error: error.message };
      setStandardHeaders(res, data);
      return res.status(500).json(data);
    }
  }
  
  try {
    const profile = await profileData();
    const data = { profile };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { error: error.message };
    setStandardHeaders(res, data);
    res.status(503).json(data);
  }
});

module.exports = profileRoute;
