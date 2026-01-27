// dotenv loaded in index.js
const express = require('express');
const trafficRoute = express.Router();
const cors = require('cors');

const nysTraffic = require('../controllers/traffic');
const { setStandardHeaders } = require('../utils/standardHeaders');

trafficRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  // Check if this is a help request
  if (req.path.endsWith('/help')) {
    try {
      const data = {
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
      };
      setStandardHeaders(res, data);
      res.json(data);
    } catch (error) {
      const data = { error: error.message };
      setStandardHeaders(res, data);
      res.json(data);
    }
    return;
  }

  // Regular endpoint listing
  try {
    const data = {
      NYS: `${req.protocol}://${req.headers.host}/api/v1/traffic/nys`,
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (err) {
    const data = { error: err.message };
    setStandardHeaders(res, data);
    res.json(data);
  }
});

trafficRoute.get('/nys', cors(), async (req, res) => {
  const trafficAlert = await nysTraffic();
  try {
    const data = {
      traffic: trafficAlert,
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (err) {
    const data = { error: err.message };
    setStandardHeaders(res, data);
    res.json(data);
  }
});

module.exports = trafficRoute;
