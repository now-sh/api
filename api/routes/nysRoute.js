// dotenv loaded in index.js
const express = require('express');
const nysRoute = express.Router();
const cors = require('cors');

const nys = require('../controllers/nys');
const { setStandardHeaders } = require('../utils/standardHeaders');

nysRoute.get(['/', '/help'], cors(), async (req, res) => {
  // Check if this is a help request
  if (req.path.endsWith('/help')) {
    const host = `${req.protocol}://${req.headers.host}`;
    try {
      const data = {
        title: 'New York State COVID-19 Data API',
        endpoint: `${host}/api/v1/nys`,
        description: 'Get current COVID-19 statistics for New York State from disease.sh',
        data_source: 'https://disease.sh/v3/covid-19/states/New%20York',
        cli_example: `curl ${host}/api/v1/nys`,
        bash_function: `nys_covid() { curl -s "${host}/api/v1/nys" | jq -r '.nys | "NY Cases: \\(.cases) Deaths: \\(.deaths) Recovered: \\(.recovered)"'; }`
      };
      setStandardHeaders(res, data);
      res.json(data);
    } catch (error) {
      const data = { error: error.message };
      setStandardHeaders(res, data);
      res.status(500).json(data);
    }
    return;
  }

  // Regular data endpoint
  try {
    const usanys = await nys();
    const data = {
      nys: usanys,
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (err) {
    const data = { error: err };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

module.exports = nysRoute;
