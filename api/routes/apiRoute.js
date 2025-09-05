require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const datetime = require('node-datetime');
const cors = require('cors');

const { setStandardHeaders } = require('../utils/standardHeaders');
const { mongoose, getDatabaseStatus } = require('../db/connection');

const apiRoute = express.Router();
const dttoday = datetime.create();
const dtyester = datetime.create();
dtyester.offsetInHours(-24);
const yesterday = dtyester.format('Y-m-d');
const today = dttoday.format('Y-m-d');
const curtime = dttoday.format('H:M');

const timeZone = process.env.TIMEZONE || 'America/New_York';
const version = process.env.VERSION;
const githubToken = process.env.GITHUB_API_KEY;

// Check if GitHub token is valid (not blank, not placeholder)
const isValidToken = githubToken && 
                    githubToken.trim() !== '' && 
                    githubToken !== 'myverylonggithubapikey';
const githubHeader = isValidToken ? 'Token is set' : 'Token is NOT set';

apiRoute.get('', cors(), (req, res) => {
  try {
    const data = {
      Greetings: ' 🥞 🐛 💜 Welcome to my API Server 💜 🐛 🥞 ',
      Message: `The current api endpoint is ${req.protocol}://${req.headers.host}/api/v1`,
      Version: version,
      TimeZone: timeZone,
      Time: curtime,
      Today: today,
      Yesterday: yesterday,
    };
    setStandardHeaders(res, data);
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRoute.get('/v1', cors(), (req, res) => {
  try {
    const data = {
      Greetings: ' 🥞 🐛 💜 Welcome to my API Server 💜 🐛 🥞 ',
      Message: `The current api endpoint is ${req.protocol}://${req.headers.host}/api/v1`,
      Help: `${req.protocol}://${req.headers.host}/api/help`,
      Version: version,
      TimeZone: timeZone,
      Time: curtime,
      Today: today,
      Yesterday: yesterday,
    };
    setStandardHeaders(res, data);
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRoute.get('/help', cors(), async (req, res) => {
  try {
    const data = {
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
      TimeZone: `${req.protocol}://${req.headers.host}/api/v1/timezones/help`,
      PassGen: `${req.protocol}://${req.headers.host}/api/v1/passwd`,
      Documentation: `${req.protocol}://${req.headers.host}/api/docs`,
    };
    setStandardHeaders(res, data);
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Version handler function (exported for healthz alias)
const versionHandler = async (req, res) => {
  const auth = req.header('auth-token') || req.header('Bearer') || req.header('token') || req.header('authorization') || 'no';
  
  // Check Reddit OAuth status
  const redditClientId = process.env.REDDIT_CLIENT_ID;
  const redditClientSecret = process.env.REDDIT_CLIENT_SECRET;
  const hasRedditAuth = redditClientId && redditClientSecret && 
                       redditClientId.trim() !== '' && 
                       redditClientSecret.trim() !== '';
  const redditAuthStatus = hasRedditAuth ? 'Set and Valid' : 'Not Set';
  
  // Check database connection status
  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI_API;
  const dbStatusDetails = getDatabaseStatus();
  const dbConnected = dbStatusDetails.connected;
  const dbStatus = dbStatusDetails.connected ? 'Connected' : 'Not Connected';
  
  // Sanitize MongoDB URI
  let sanitizedUri = 'Not Set';
  if (mongoUri) {
    // Replace username:password with asterisks
    sanitizedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@');
    // Also hide the database name after the last /
    sanitizedUri = sanitizedUri.replace(/\/([^/?]+)(\?|$)/, '/****$2');
  }
  
  // Gather more system info (sanitized)
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  const nodeVersion = process.version;
  const platform = process.platform;
  const arch = process.arch;
  
  // Proxy information (sanitized)
  const proxyInfo = {
    disease: {
      target: 'https://disease.sh',
      endpoints: ['/v3/covid-19/all', '/v3'],
      status: 'Active'
    }
  };
  
  // Determine overall health status
  let healthStatus = 'healthy';
  let healthIssues = [];
  
  // Check database connection
  if (!dbConnected) {
    healthStatus = 'degraded';
    healthIssues.push('Database not connected');
  }
  
  // Check memory usage (warn if heap is over 98% of total)
  const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  if (heapPercentage > 98) {
    if (healthStatus === 'healthy') healthStatus = 'degraded';
    healthIssues.push(`High memory usage (${Math.round(heapPercentage)}%)`);
  }
  
  // Check if critical environment variables are set
  if (!mongoUri && healthStatus === 'healthy') {
    healthStatus = 'degraded';
    healthIssues.push('MongoDB URI not configured');
  }
  
  // Check uptime (warn if just restarted - less than 10 seconds)
  if (uptime < 10) {
    if (healthStatus === 'healthy') healthStatus = 'degraded';
    healthIssues.push('Service recently restarted');
  }
  
  try {
    const data = {
      Health: {
        Status: healthStatus,
        Issues: healthIssues,
        Timestamp: new Date().toISOString()
      },
      Greetings: ' 🥞 🐛 💜 Welcome to my API Server 💜 🐛 🥞 ',
      Version: version,
      TimeZone: timeZone,
      Yesterday: yesterday,
      Today: today,
      Time: curtime,
      GitHubToken: githubHeader,
      RedditAuth: redditAuthStatus,
      Database: {
        Status: dbStatus,
        URI: sanitizedUri,
        Details: {
          State: dbStatusDetails.status,
          Configured: dbStatusDetails.uri,
          ConnectionAttempts: dbStatusDetails.attempts
        }
      },
      System: {
        NodeVersion: nodeVersion,
        Platform: platform,
        Architecture: arch,
        Uptime: `${Math.floor(uptime / 60)} minutes`,
        Memory: {
          HeapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
          HeapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
          RSS: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
          HeapPercentage: `${Math.round(heapPercentage)}%`
        }
      },
      Environment: {
        NodeEnv: process.env.NODE_ENV || 'development',
        Port: process.env.PORT || '1919'
      },
      Proxies: proxyInfo,
      Auth: auth,
    };
    
    // Set appropriate status code based on health
    const statusCode = healthStatus === 'healthy' ? 200 : 503;
    
    setStandardHeaders(res, data);
    res.status(statusCode).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add the handler to the route
apiRoute.get('/v1/version', cors(), versionHandler);

apiRoute.post('/v1/version', cors(), versionHandler);

module.exports = apiRoute;
module.exports.versionHandler = versionHandler;
