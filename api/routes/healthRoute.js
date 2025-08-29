const express = require('express');
const cors = require('cors');
const os = require('os');
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

/**
 * Comprehensive health check endpoint
 */
healthRoute.get('/healthz', cors(), async (req, res) => {
  const startTime = Date.now();
  
  // Check database connections
  const databaseStatus = {};
  const connections = global.mongoConnections || {};
  
  for (const [name, connection] of Object.entries(connections)) {
    if (connection) {
      try {
        // Check if connection is ready (1 = connected)
        const isConnected = connection.readyState === 1;
        databaseStatus[name] = {
          status: isConnected ? 'healthy' : 'unhealthy',
          connected: isConnected,
          // Don't expose sensitive connection details
          database: connection.db?.databaseName || name
        };
      } catch (error) {
        databaseStatus[name] = {
          status: 'error',
          connected: false,
          error: error.message
        };
      }
    } else {
      databaseStatus[name] = {
        status: 'not_configured',
        connected: false
      };
    }
  }
  
  // Calculate overall health
  const dbValues = Object.values(databaseStatus);
  const healthyDbs = dbValues.filter(db => db.status === 'healthy').length;
  const totalDbs = dbValues.length;
  const allDbsHealthy = healthyDbs === totalDbs && totalDbs > 0;
  
  // Check GitHub token status
  const githubToken = process.env.GITHUB_API_KEY;
  const isValidToken = githubToken && 
                      githubToken.trim() !== '' && 
                      githubToken !== 'myverylonggithubapikey';
  const githubTokenStatus = isValidToken ? 'Token is set' : 'Token is NOT set';

  // Build response
  const healthStatus = {
    status: allDbsHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: {
      seconds: Math.floor(process.uptime()),
      human: formatUptime(process.uptime())
    },
    databases: databaseStatus,
    databaseSummary: {
      total: totalDbs,
      healthy: healthyDbs,
      unhealthy: totalDbs - healthyDbs
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsage: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        systemFree: Math.round(os.freemem() / 1024 / 1024) + ' MB',
        systemTotal: Math.round(os.totalmem() / 1024 / 1024) + ' MB'
      }
    },
    githubToken: githubTokenStatus,
    responseTime: Date.now() - startTime + 'ms'
  };
  
  // Set appropriate status code
  const statusCode = allDbsHealthy ? 200 : 503;
  
  res.status(statusCode).json(healthStatus);
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);
  
  return parts.join(' ') || '0s';
}

module.exports = healthRoute;
