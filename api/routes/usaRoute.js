require('dotenv').config();
const express = require('express');
const usaRoute = express.Router();
const cors = require('cors');
const fetch = require('node-fetch');

const usa = require('../controllers/usa');
const myHeaders = require('../middleware/headers');

usaRoute.get('/', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        states: [
          'Alabama',
          'Alaska',
          'Arizona',
          'Arkansas',
          'California',
          'Colorado',
          'Connecticut',
          'Delaware',
          'District of Columbia',
          'Florida',
          'Georgia',
          'Hawaii',
          'Idaho',
          'Illinois',
          'Indiana',
          'Iowa',
          'Kansas',
          'Kentucky',
          'Louisiana',
          'Maine',
          'Maryland',
          'Massachusetts',
          'Michigan',
          'Minnesota',
          'Mississippi',
          'Missouri',
          'Montana',
          'Nebraska',
          'Nevada',
          'New Hampshire',
          'New Jersey',
          'New Mexico',
          'New York',
          'North Carolina',
          'North Dakota',
          'Ohio',
          'Oklahoma',
          'Oregon',
          'Pennsylvania',
          'Rhode Island',
          'South Carolina',
          'South Dakota',
          'Tennessee',
          'Texas',
          'Utah',
          'Vermont',
          'Virginia',
          'Washington',
          'West Virginia',
          'Wisconsin',
          'Wyoming',
        ],
      })
    );
  } catch (error) {
    res.json({ error: 'An error has occurred' });
  }
});

usaRoute.get('/nys', cors(), async (req, res) => {
  const hostname = req.headers.host;
  const proto = req.protocol + '://';
  const response = await fetch(proto + hostname + '/api/v1/nys', {
    headers: {
      myHeaders,
    },
  });
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (error) {
    res.json({ error: error.message });
  }
});

usaRoute.get('/:id', cors(), async (req, res) => {
  const response = await fetch(
    `https://disease.sh/v3/covid-19/states/${req.params.id}`,
    {
      headers: {
        myHeaders,
      },
    }
  );
  try {
    const json = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = usaRoute;
