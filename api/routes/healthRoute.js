const express = require('express');
const cors = require('cors');
const healthRoute = express.Router();

healthRoute.get('/', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.status(200).send(JSON.stringify({ Status: 'Ok' }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

healthRoute.get('/json', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.status(200).send(JSON.stringify({ Status: 'Ok' }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

healthRoute.get('/txt', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  try {
    res.status(200).send('Ok');
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = healthRoute;
