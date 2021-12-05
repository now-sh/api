require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const apiRoute = express.Router();
const datetime = require('node-datetime');
const cors = require('cors');

const dttoday = datetime.create();
const dtyester = datetime.create();
dtyester.offsetInHours(-24);
const yesterday = dtyester.format('Y-m-d');
const today = dttoday.format('Y-m-d');
const curtime = dttoday.format('H:M');

const timeZone = process.env.TIMEZONE || 'America/New_York';
const version = process.env.VERSION;
const githubToken = process.env.GITHUB_API_KEY;

const githubHeader = (githubToken && 'Token is set') || 'Token is unset';

apiRoute.get('', cors(), (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        Greetings: ' 🥞 🐛 💜 Welcome to my API Server 💜 🐛 🥞 ',
        Message: `The current api endpoint is ${req.protocol}://${req.headers.host}/api/v1`,
        Version: version,
        TimeZone: timeZone,
        Time: curtime,
        Today: today,
        Yesterday: yesterday,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

apiRoute.get('/v1', cors(), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.send(
      JSON.stringify({
        Version: `${req.protocol}://${req.headers.host}/api/v1/version`,
        Domains: `${req.protocol}://${req.headers.host}/api/v1/domains`,
        Commit: `${req.protocol}://${req.headers.host}/api/v1/commit`,
        Covid: `${req.protocol}://${req.headers.host}/api/v1/disease`,
        Arcgis: `${req.protocol}://${req.headers.host}/api/v1/arcgis`,
        Global: `${req.protocol}://${req.headers.host}/api/v1/global`,
        USA: `${req.protocol}://${req.headers.host}/api/v1/usa`,
        NYS: `${req.protocol}://${req.headers.host}/api/v1/nys`,
        Closings: `${req.protocol}://${req.headers.host}/api/v1/closings`,
        Git: `${req.protocol}://${req.headers.host}/api/v1/git`,
        Reddit: `${req.protocol}://${req.headers.host}/api/v1/reddit`,
        Traffic: `${req.protocol}://${req.headers.host}/api/v1/traffic`,
        Profile: `${req.protocol}://${req.headers.host}/api/v1/profile`,
        Blog: `${req.protocol}://${req.headers.host}/api/v1/blogs`,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

apiRoute.get('/v1/version', cors(), async (req, res) => {
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
        Greetings: ' 🥞 🐛 💜 Welcome to my API Server 💜 🐛 🥞 ',
        Version: version,
        TimeZone: timeZone,
        Yesterday: yesterday,
        Today: today,
        Time: curtime,
        GitHubToken: githubHeader,
        Auth: auth,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

apiRoute.post('/v1/version', cors(), async (req, res) => {
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
        Greetings: ' 🥞 🐛 💜 Welcome to my API Server 💜 🐛 🥞 ',
        Version: VERSION,
        TimeZone: TimeZone,
        Yesterday: yesterday,
        Today: today,
        Time: curtime,
        GitHubToken: githubHeader,
        Auth: auth,
      })
    );
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = apiRoute;
