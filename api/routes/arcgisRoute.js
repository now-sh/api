require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const arcgisRoute = express.Router();
const cors = require('cors');

const arcgisData = require('../controllers/arcgis');

arcgisRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.setHeader('Content-Type', 'application/json');
  
  if (req.path === '/help') {
    try {
      return res.json({
        title: 'ArcGIS COVID-19 Data API',
        endpoint: `${host}/api/v1/arcgis`,
        description: 'Get COVID-19 data from ArcGIS Feature Server',
        data_source: process.env.ARGIS_URL || 'ArcGIS Feature Server',
        cli_example: `curl ${host}/api/v1/arcgis`,
        bash_function: `arcgis_data() { curl -s "${host}/api/v1/arcgis" | jq '.arcgis.features[]'; }`
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  try {
    const arcgis = await arcgisData();
    res.json({ arcgis });
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

module.exports = arcgisRoute;
