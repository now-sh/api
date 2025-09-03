require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const arcgisRoute = express.Router();
const cors = require('cors');
const { setStandardHeaders } = require('../utils/standardHeaders');

const arcgisData = require('../controllers/arcgis');

arcgisRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  if (req.path === '/help') {
    try {
      const helpData = {
        title: 'ArcGIS COVID-19 Data API',
        endpoint: `${host}/api/v1/arcgis`,
        description: 'Get COVID-19 data from ArcGIS Feature Server',
        data_source: process.env.ARGIS_URL || 'ArcGIS Feature Server',
        cli_example: `curl ${host}/api/v1/arcgis`,
        bash_function: `arcgis_data() { curl -s "${host}/api/v1/arcgis" | jq '.arcgis.features[]'; }`
      };
      setStandardHeaders(res, helpData);
      return res.json(helpData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  try {
    const arcgis = await arcgisData();
    const data = { arcgis };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

module.exports = arcgisRoute;
