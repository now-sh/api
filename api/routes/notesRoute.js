require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const notesRoute = express.Router();
const cors = require('cors');

const notesAPI = require('../controllers/notes');

const cache = null;
const lastCacheTime = null;

notesAPI.get('/', cors(), async (req, res) => {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const response = await fetch(`${notes_server}/${req.params.id}`);
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.json(json);
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = notesRoute;
