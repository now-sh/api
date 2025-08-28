const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../config/swagger');

const docsRoute = express.Router();

// Custom Dracula theme CSS
const draculaThemeUrl = '/css/swagger-dracula.css';

// Middleware to dynamically set server URL based on request
docsRoute.use((req, res, next) => {
  // Get protocol from X-Forwarded-Proto header or request protocol
  const proto = req.get('X-Forwarded-Proto') || req.protocol;
  
  // Get host from X-Forwarded-Host header or request host
  const host = req.get('X-Forwarded-Host') || req.get('Host');
  
  // Parse host and port
  let hostname = host;
  let port = '';
  
  if (host.includes(':')) {
    [hostname, port] = host.split(':');
    // Strip default ports
    if ((proto === 'https' && port === '443') || (proto === 'http' && port === '80')) {
      port = '';
    }
  }
  
  // Build server URL
  const serverUrl = port ? `${proto}://${hostname}:${port}` : `${proto}://${hostname}`;
  
  // Update swagger specs with dynamic server
  const dynamicSpecs = JSON.parse(JSON.stringify(swaggerSpecs));
  dynamicSpecs.servers = [
    {
      url: serverUrl,
      description: 'Current Server'
    }
  ];
  
  // Store the specs for the UI setup
  req.swaggerSpecs = dynamicSpecs;
  next();
});

// Serve Swagger UI
docsRoute.use('/', swaggerUi.serve, (req, res, next) => {
  swaggerUi.setup(req.swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customCssUrl: draculaThemeUrl,
    customSiteTitle: 'API Documentation - Backend API',
    customfavIcon: '/favicon.ico',
    explorer: true,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai'
      }
    }
  })(req, res, next);
});

module.exports = docsRoute;