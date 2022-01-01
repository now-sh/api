require('dotenv').config();
const express = require('express');
const healthRoute = express.Router();
const cors = require('cors');

healthRoute.get('/', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.status(200).send(
      JSON.stringify({
        Status: 'Ok',
      })
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = healthRoute;
