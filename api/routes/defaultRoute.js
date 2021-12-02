require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const defaultRoute = express.Router();
const datetime = require('node-datetime');
const cors = require('cors');

defaultRoute.get('/', cors(), (req, res) => {
  try {
    res.sendFile(path.join(`${__dirname}/public/index.html`));
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = defaultRoute;
