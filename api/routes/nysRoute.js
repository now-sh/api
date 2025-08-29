require('dotenv').config();
const express = require('express');
const nysRoute = express.Router();
const cors = require('cors');

const nys = require('../controllers/nys');

nysRoute.get(['/', '/help'], cors(), async (req, res) => {
  // Check if this is a help request
  if (req.path.endsWith('/help')) {
    const host = `${req.protocol}://${req.headers.host}`;
    res.setHeader('Content-Type', 'application/json');
    try {
      res.json({
        title: 'New York State COVID-19 Data API',
        endpoint: `${host}/api/v1/nys`,
        description: 'Get current COVID-19 statistics for New York State from disease.sh',
        data_source: 'https://disease.sh/v3/covid-19/states/New%20York',
        cli_example: `curl ${host}/api/v1/nys`,
        bash_function: `nys_covid() { curl -s "${host}/api/v1/nys" | jq -r '.nys | "NY Cases: \\(.cases) Deaths: \\(.deaths) Recovered: \\(.recovered)"'; }`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
    return;
  }

  // Regular data endpoint
  try {
    const usanys = await nys();
    res.setHeader('Content-Type', 'application/json');
    res.send(
      JSON.stringify({
        nys: usanys,
      })
    );
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = nysRoute;
