// dotenv loaded in index.js
const express = require('express');
const covidRoute = express.Router();
const cors = require('cors');
const { setStandardHeaders } = require('../utils/standardHeaders');

const covid = require('../controllers/covid');

covidRoute.get('/', cors(), async (req, res) => {
  try {
    const covidapi = await covid();
    const data = { global: covidapi };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

covidRoute.get('/help', cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  try {
    const helpData = {
      title: 'Global COVID-19 Statistics API',
      endpoint: `${host}/api/v1/world/covid`,
      description: 'Get current global COVID-19 statistics from disease.sh',
      data_source: 'https://disease.sh/v3/covid-19/all',
      cli_example: `curl ${host}/api/v1/world/covid`,
      bash_function: `covid_stats() { curl -s "${host}/api/v1/world/covid" | jq -r '.global | "Cases: \\(.cases) Deaths: \\(.deaths) Recovered: \\(.recovered)"'; }`
    };
    setStandardHeaders(res, helpData);
    res.json(helpData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = covidRoute;
