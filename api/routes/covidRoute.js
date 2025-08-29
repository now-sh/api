require('dotenv').config();
const express = require('express');
const covidRoute = express.Router();
const cors = require('cors');

const covid = require('../controllers/covid');

covidRoute.get('/', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const covidapi = await covid();
    res.json({ global: covidapi });
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

covidRoute.get('/help', cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.setHeader('Content-Type', 'application/json');
  try {
    res.json({
      title: 'Global COVID-19 Statistics API',
      endpoint: `${host}/api/v1/global`,
      description: 'Get current global COVID-19 statistics from disease.sh',
      data_source: 'https://disease.sh/v3/covid-19/all',
      cli_example: `curl ${host}/api/v1/global`,
      bash_function: `covid_stats() { curl -s "${host}/api/v1/global" | jq -r '.global | "Cases: \\(.cases) Deaths: \\(.deaths) Recovered: \\(.recovered)"'; }`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = covidRoute;
