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
  const customCss = `
    /* Hide default topbar */
    .swagger-ui .topbar { display: none; }
    
    /* Custom header with site branding */
    .swagger-ui::before {
      content: "";
      display: block;
      background: linear-gradient(135deg, #bd93f9 0%, #ff79c6 50%, #8be9fd 100%);
      height: 4px;
      width: 100%;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
    }
    
    /* Add custom site header */
    .swagger-ui .info::before {
      content: "🚀 CasJay API Documentation";
      display: block;
      font-size: 2.5rem;
      font-weight: bold;
      text-align: center;
      color: var(--swagger-purple);
      margin-bottom: 1rem;
      padding: 2rem 0 1rem 0;
      background: linear-gradient(135deg, #bd93f9, #ff79c6, #8be9fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Add functional navigation link */
    .swagger-ui .info {
      position: relative;
    }
    
    .swagger-ui .info::after {
      content: "";
      display: block;
      height: 40px;
    }
    
    /* Custom navigation element */
    .api-nav {
      position: fixed;
      top: 8px;
      right: 20px;
      z-index: 10000;
      background: var(--swagger-background-secondary);
      border: 1px solid var(--swagger-purple);
      border-radius: 8px;
      padding: 8px 16px;
      font-weight: 500;
      color: var(--swagger-cyan);
      text-decoration: none;
      font-family: inherit;
      font-size: 14px;
      transition: all 0.2s ease;
    }
    
    .api-nav:hover {
      background: var(--swagger-purple);
      color: var(--swagger-background);
      text-decoration: none;
    }
    
    /* Improve overall spacing */
    .swagger-ui {
      padding-top: 8px;
    }
  `;
  
  swaggerUi.setup(req.swaggerSpecs, {
    customCss: customCss,
    customCssUrl: draculaThemeUrl,
    customSiteTitle: '🚀 CasJay API Documentation',
    customfavIcon: '/favicon.ico',
    explorer: true,
    customJs: `
      // Add navigation link after page loads
      window.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
          const navLink = document.createElement('a');
          navLink.href = '/';
          navLink.className = 'api-nav';
          navLink.textContent = '← Back to Main Site';
          navLink.setAttribute('target', '_self');
          document.body.appendChild(navLink);
        }, 500);
      });
    `,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai'
      },
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      displayOperationId: false,
      displayRequestDuration: true
    }
  })(req, res, next);
});

module.exports = docsRoute;