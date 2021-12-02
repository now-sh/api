require('dotenv').config();
const express = require('express');
const profileRoute = express.Router();
const cors = require('cors');

const profileData = require('../controllers/profile');

profileRoute.get('/', cors(), async (req, res) => {
  const profile = await profileData();
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        profile,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = profileRoute;
