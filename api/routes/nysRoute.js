require('dotenv').config();
const express = require('express');
const nysRoute = express.Router();
const cors = require('cors');

const nys = require('../controllers/nys');

nysRoute.get('/', cors(), async (req, res) => {
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
