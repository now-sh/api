require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const trafficRoute = express.Router();
const cors = require('cors');

const nysTraffic = require('../controllers/traffic');

trafficRoute.get('/', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        NYS: `https://${req.headers.host}/api/v1/traffic/nys`,
      })
    );
  } catch (err) {
    res.json({ error: err.message });
  }
});

trafficRoute.get('/nys', cors(), async (req, res) => {
  const trafficAlert = await nysTraffic();
  try {
    res.setHeader('Content-Type', 'application/json');
    res.send(
      JSON.stringify({
        traffic: trafficAlert,
      })
    );
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = trafficRoute;
