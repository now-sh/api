require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const tzRoute = express.Router();
const cors = require('cors');

const dataDir = path.join(__dirname + '/../public/data');

tzRoute.get('/', cors(), async (req, res) => {
  const auth =
    req.header('auth-token') ||
    req.header('Bearer') ||
    req.header('token') ||
    req.header('authorization') ||
    'null';
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(`${dataDir}/timezones.json`);
});

tzRoute.get('/countries', cors(), async (req, res) => {
  const auth =
    req.header('auth-token') ||
    req.header('Bearer') ||
    req.header('token') ||
    req.header('authorization') ||
    'null';
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(`${dataDir}/countries.json`);
});

tzRoute.get('/:help', cors(), async (req, res) => {
  const auth =
    req.header('auth-token') ||
    req.header('Bearer') ||
    req.header('token') ||
    req.header('authorization') ||
    'null';
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        getTimezone: [
          `${req.protocol}://${req.headers.host}/api/v1/timezones`,
          `curl -q -LSsf ${req.protocol}://${req.headers.host}/api/v1/timezones | jq -rc '.[]' | grep 'Search term' | jq -r '{abbr:.abbr,offset:.offset,tz:.utc}'`,
        ],
        getCountry: [
          `${req.protocol}://${req.headers.host}/api/v1/timezones/countries`,
          `curl -q -LSsf ${req.protocol}://${req.headers.host}/api/v1/timezones/countries | jq -rc '.[]' | grep 'Search term' | jq -r '{name:.name,capital:.capital,countryCode:.country_code,timeZones:.timezones}'`,
        ],
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = tzRoute;
