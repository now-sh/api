require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const tzRoute = express.Router();
const cors = require('cors');

const dataDir = path.join(__dirname + '/../public/data');

const countryData = fs.readFileSync(dataDir + '/countries.json');
const timezoneData = fs.readFileSync(dataDir + '/timezones.json');
const countryDataJSON = JSON.parse(countryData);
const timezoneDataJSON = JSON.parse(timezoneData);

tzRoute.get('/', cors(), async (req, res) => {
  const auth = req.header('auth-token') || req.header('Bearer') || req.header('token') || req.header('authorization') || 'null';
  res.setHeader('Content-Type', 'application/json');
  res.send(timezoneDataJSON);
});

tzRoute.get('/countries', cors(), async (req, res) => {
  const auth = req.header('auth-token') || req.header('Bearer') || req.header('token') || req.header('authorization') || 'null';
  res.setHeader('Content-Type', 'application/json');
  res.send(countryDataJSON);
});

tzRoute.get('/:help', cors(), async (req, res) => {
  const auth = req.header('auth-token') || req.header('Bearer') || req.header('token') || req.header('authorization') || 'null';
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        getTimezone: [
          `${req.protocol}://${req.headers.host}/api/v1/timezones`,
          `tz_search() { curl -q -LSsf ${req.protocol}://${req.headers.host}/api/v1/timezones | jq -rc '.[]' | grep "$1" | jq -r '{abbr:.abbr,offset:.offset,tz:.utc}' ;}`,
        ],
        getCountry: [
          `${req.protocol}://${req.headers.host}/api/v1/timezones/countries`,
          `tz_country_search() { curl -q -LSsf ${req.protocol}://${req.headers.host}/api/v1/timezones/countries | jq -rc '.[]' | grep "$1" | jq -r '{name:.name,capital:.capital,countryCode:.country_code,timeZones:.timezones}' ;}`,
        ],
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = tzRoute;
