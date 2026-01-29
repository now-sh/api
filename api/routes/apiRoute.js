// dotenv loaded in index.js
const express = require('express');
const datetime = require('node-datetime');
const cors = require('cors');

const { setStandardHeaders } = require('../utils/standardHeaders');
const { getDatabaseStatus, connectToDatabase } = require('../db/connection');

const apiRoute = express.Router();

const configuredTimeZone = process.env.TIMEZONE || 'America/New_York';

// Detect server's system timezone
const getServerTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Helper to get current date/time in configured timezone (called on each request)
// Uses UTC as base and converts to target timezone - works regardless of server TZ
const getDateTime = (targetTimezone = configuredTimeZone) => {
  // Date objects in JS are always UTC internally
  const now = new Date();
  const options = { timeZone: targetTimezone };

  // Get time in target timezone
  const curtime = now.toLocaleTimeString('en-US', {
    ...options,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  // Get today's date in target timezone
  const today = now.toLocaleDateString('en-CA', options); // en-CA gives YYYY-MM-DD format

  // Get yesterday's date in target timezone
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterday = yesterdayDate.toLocaleDateString('en-CA', options);

  return {
    yesterday,
    today,
    curtime,
    timezone: targetTimezone,
    serverTimezone: getServerTimezone(),
    utc: now.toISOString()
  };
};
const packageJson = require('../../package.json');
const version = process.env.VERSION || packageJson.version;
const githubToken = process.env.GITHUB_API_KEY;

// Check if GitHub token is valid (not blank, not placeholder)
const isValidToken = githubToken && 
                    githubToken.trim() !== '' && 
                    githubToken !== 'myverylonggithubapikey';
const githubHeader = isValidToken ? 'Token is set' : 'Token is NOT set';

apiRoute.get('/', cors(), (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.headers.host}`;
    const dt = getDateTime();
    const data = {
      Greetings: ' 🥞 🐛 💜 Welcome to my API Server 💜 🐛 🥞 ',
      Message: `The current api endpoint is ${baseUrl}/api/v1`,
      Version: version,
      TimeZone: dt.timezone,
      Time: dt.curtime,
      Today: dt.today,

      Documentation: `${baseUrl}/api/docs`,

      Routes: {
        // Tools - Developer Tools & Utilities
        Tools: {
          Base64: `${baseUrl}/api/v1/tools/base64`,
          Hash: `${baseUrl}/api/v1/tools/hash`,
          UUID: `${baseUrl}/api/v1/tools/uuid`,
          JWT: `${baseUrl}/api/v1/tools/jwt`,
          QRCode: `${baseUrl}/api/v1/tools/qr`,
          Color: `${baseUrl}/api/v1/tools/color`,
          Lorem: `${baseUrl}/api/v1/tools/lorem`,
          Password: `${baseUrl}/api/v1/tools/passwd`,
          Commit: `${baseUrl}/api/v1/tools/commit`,
          Markdown: `${baseUrl}/api/v1/tools/markdown`,
          Cron: `${baseUrl}/api/v1/tools/cron`,
          Regex: `${baseUrl}/api/v1/tools/regex`,
          Diff: `${baseUrl}/api/v1/tools/diff`,
          Dictionary: `${baseUrl}/api/v1/tools/dictionary`
        },

        // Personal Data
        Me: {
          Blog: `${baseUrl}/api/v1/me/blog`,
          Domains: `${baseUrl}/api/v1/me/domains`,
          Info: `${baseUrl}/api/v1/me/info`
        },

        // Data Storage
        Data: {
          Todos: `${baseUrl}/api/v1/data/todos`,
          Notes: `${baseUrl}/api/v1/data/notes`,
          URLs: `${baseUrl}/api/v1/data/urls`
        },

        // Fun & Entertainment
        Fun: {
          Jokes: `${baseUrl}/api/v1/fun/jokes`,
          Facts: `${baseUrl}/api/v1/fun/facts`,
          Trivia: `${baseUrl}/api/v1/fun/trivia`,
          Anime: `${baseUrl}/api/v1/fun/anime`
        },

        // Social Media APIs
        Social: {
          Blogs: `${baseUrl}/api/v1/social/blogs`,
          GitHub: `${baseUrl}/api/v1/social/github`,
          Reddit: `${baseUrl}/api/v1/social/reddit`
        },

        // World Information
        World: {
          Covid: `${baseUrl}/api/v1/world/covid`,
          Disease: `${baseUrl}/api/v1/world/disease`,
          Closings: `${baseUrl}/api/v1/world/closings`,
          Timezones: `${baseUrl}/api/v1/world/timezones`,
          USA: `${baseUrl}/api/v1/world/usa`,
          NYS: `${baseUrl}/api/v1/world/nys`,
          ArcGIS: `${baseUrl}/api/v1/world/arcgis`
        },

        // Authentication
        Auth: {
          Login: `${baseUrl}/api/v1/auth/login`,
          Register: `${baseUrl}/api/v1/auth/register`,
          Profile: `${baseUrl}/api/v1/profile`
        },

        // Server
        Server: {
          Version: `${baseUrl}/api/v1/version`,
          Health: `${baseUrl}/api/healthz`,
          Cache: `${baseUrl}/api/v1/cache`,
          Docs: `${baseUrl}/api/v1/docs`,
          Debug: `${baseUrl}/api/v1/debug`
        }
      }
    };
    setStandardHeaders(res, data);
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRoute.get('/v1', cors(), (req, res) => {
  try {
    const dt = getDateTime();
    const data = {
      Greetings: ' 🥞 🐛 💜 Welcome to my API Server 💜 🐛 🥞 ',
      Message: `The current api endpoint is ${req.protocol}://${req.headers.host}/api/v1`,
      Help: `${req.protocol}://${req.headers.host}/api/help`,
      Version: version,
      TimeZone: dt.timezone,
      Time: dt.curtime,
      Today: dt.today,
      Yesterday: dt.yesterday,
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
  const isVercel = process.env.VERCEL || process.env.NOW_REGION;
  
  // In serverless environments, actively try to connect for health checks
  let dbStatusDetails = getDatabaseStatus();
  if (isVercel && !dbStatusDetails.connected) {
    try {
      await connectToDatabase();
      dbStatusDetails = getDatabaseStatus();
    } catch (error) {
      // Connection failed, keep the original status
    }
  }
  
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
  
  // Helper to mask sensitive data
  const maskSensitive = (value) => {
    if (!value) return 'Not Configured';
    if (typeof value === 'string' && value.length > 0) return 'Configured ✓';
    return 'Configured ✓';
  };

  try {
    const os = require('os');
    const dt = getDateTime();
    const data = {
      Health: {
        Status: healthStatus,
        Issues: healthIssues,
        Timestamp: dt.utc
      },
      Greetings: ' 🥞 🐛 💜 Welcome to my API Server 💜 🐛 🥞 ',
      Version: version,
      TimeZone: dt.timezone,
      ServerTimeZone: dt.serverTimezone,
      Yesterday: dt.yesterday,
      Today: dt.today,
      Time: dt.curtime,

      // External Data Sources (showing actual values/defaults used)
      DataSources: {
        GitMessages: process.env.GIT_MESSAGE_URL || 'https://raw.githubusercontent.com/apimgr/gitmessages/main/src/data/messages.json',
        Timezones: process.env.TIMEZONE_URL || 'https://raw.githubusercontent.com/apimgr/timezones/main/src/data/timezones.json',
        Countries: process.env.COUNTRIES_URL || 'https://raw.githubusercontent.com/apimgr/countries/main/countries.json',
        Domains: process.env.DOMAINS_URL || 'https://raw.githubusercontent.com/casjay/public/main/domains.json',
        GitHubUser: process.env.GITHUB_USERNAME || 'casjay',
        RedditUser: process.env.MY_REDDIT_USER || 'casjay',
        BlogRepo: process.env.BLOG_URL || 'https://api.github.com/repos/malaks-us/jason/contents/_posts',
      },

      // API Keys Status (masked)
      APIKeys: {
        GitHub: maskSensitive(process.env.GITHUB_API_KEY),
        Reddit: maskSensitive(process.env.REDDIT_CLIENT_ID),
      },

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

      Server: {
        NodeVersion: nodeVersion,
        Platform: platform,
        Architecture: arch,
        FQDN: process.env.HOSTNAME || process.env.HOST || os.hostname(),
        Uptime: `${Math.floor(uptime / 60)} minutes`,
        Memory: {
          HeapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
          HeapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
          RSS: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
          HeapPercentage: `${Math.round(heapPercentage)}%`,
          Total: `${Math.round(os.totalmem() / 1024 / 1024 / 1024 * 10) / 10} GB`,
          Free: `${Math.round(os.freemem() / 1024 / 1024 / 1024 * 10) / 10} GB`
        },
        CPUs: `${os.cpus().length} cores`
      },

      Environment: {
        NodeEnv: process.env.NODE_ENV || 'development',
        Port: process.env.PORT || '1919',
        IsVercel: process.env.VERCEL ? 'Yes' : 'No',
        Region: process.env.VERCEL_REGION || process.env.NOW_REGION || 'N/A'
      },

      Proxies: proxyInfo,

      // User Agent Configuration
      UserAgent: {
        Default: 'Windows 11 Edge (Chromium)',
        Reddit: process.env.REDDIT_USER_AGENT || 'API:v1.9.4 (by /u/casjay)'
      },

      Auth: auth,
    };
    
    // Always return 200 - health status is in the body for monitoring tools
    setStandardHeaders(res, data);
    res.status(200).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add the handler to the route
apiRoute.get('/v1/version', cors(), versionHandler);

apiRoute.post('/v1/version', cors(), versionHandler);

module.exports = apiRoute;
module.exports.versionHandler = versionHandler;
