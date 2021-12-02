require('dotenv').config();
const express = require('express');
const closingsRoute = express.Router();
const cors = require('cors');

const closings = require('../controllers/closings');

closingsRoute.get('/', cors(), async (req, res) => {
  const wnytClosed = await closings();
  try {
    res.setHeader('Content-Type', 'application/json');
    res.send(
      JSON.stringify({
        Closed: wnytClosed,
      })
    );
  } catch (err) {
    res.json({ error: error.message });
  }
});

module.exports = closingsRoute;
