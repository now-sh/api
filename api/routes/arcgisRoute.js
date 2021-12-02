require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const arcgisRoute = express.Router();
const cors = require('cors');

const arcgisData = require('../controllers/arcgis');

arcgisRoute.get('/', cors(), async (req, res) => {
  const arcgis = await arcgisData();
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        arcgis,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = arcgisRoute;
