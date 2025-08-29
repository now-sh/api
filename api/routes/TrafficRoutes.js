require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const trafficRoute = express.Router();
const cors = require('cors');

const nysTraffic = require('../controllers/traffic');

trafficRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.setHeader('Content-Type', 'application/json');
  
  // Check if this is a help request
  if (req.path.endsWith('/help')) {
    try {
      res.json({
        title: 'New York State Traffic Data API',
        endpoint: `${host}/api/v1/traffic`,
        description: 'Get current traffic incidents and alerts for New York State from 511ny.org',
        data_source: '511ny.org traffic events',
        endpoints: {
          help: `${host}/api/v1/traffic/help`,
          nys_traffic: `${host}/api/v1/traffic/nys`
        },
        cli_example: `curl ${host}/api/v1/traffic/nys`,
        bash_function: `nys_traffic() { curl -s "${host}/api/v1/traffic/nys" | jq -r '.traffic | length as $count | "NYS Traffic Events: \\($count) incidents"'; }`
      });
    } catch (error) {
      res.json({ error: error.message });
    }
    return;
  }

  // Regular endpoint listing
  try {
    res.send(
      JSON.stringify({
        NYS: `${req.protocol}://${req.headers.host}/api/v1/traffic/nys`,
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
