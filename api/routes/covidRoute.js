require('dotenv').config();
const express = require('express');
const covidRoute = express.Router();
const cors = require('cors');

const covid = require('../controllers/covid');

covidRoute.get('/', cors(), async (req, res) => {
  const covidapi = await covid();
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        global: covidapi,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = covidRoute;
