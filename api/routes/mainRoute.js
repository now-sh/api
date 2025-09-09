require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const defaultRoute = express.Router();
const datetime = require('node-datetime');
const cors = require('cors');
const utilitiesController = require('../controllers/utilities');
const { setStandardHeaders } = require('../utils/standardHeaders');

defaultRoute.get('/', cors(), (req, res) => {
  try {
    res.render('pages/index', {
      title: 'Backend API - Home',
      description: 'Modern API endpoints for development',
      activePage: 'home'
    });
  } catch (error) {
    const data = { error: error.message };
    setStandardHeaders(res, data);
    res.json(data);
  }
});

// ==== NEW CATEGORIZED FRONTEND ROUTES ====

// 🔧 Utilities frontend routes
// Handle both GET and POST for utilities
defaultRoute.get('/utilities/:tool', cors(), async (req, res) => {
  await handleUtilityRequest(req, res);
});

defaultRoute.post('/utilities/:tool', cors(), async (req, res) => {
  await handleUtilityRequest(req, res);
});

async function handleUtilityRequest(req, res) {
  try {
    const { tool } = req.params;
    const pageTitle = tool.charAt(0).toUpperCase() + tool.slice(1).replace('-', ' ');
    
    // Handle form submissions and data for utility tools
    let toolData = null;
    let toolResult = null;
    let toolError = null;
    
    // Process form submissions
    if (req.method === 'POST' || req.query.action) {
      try {
        const axios = require('axios');
        let apiUrl = `${req.protocol}://${req.get('host')}/api/v1/tools/${tool}`;
        let requestData = {};
        
        // Handle different utility tools
        switch(tool) {
          case 'uuid':
            if (req.body?.action === 'generate') {
              apiUrl = `${req.protocol}://${req.get('host')}/api/v1/tools/uuid/v4`;
            }
            break;
          case 'base64':
            if (req.body?.text) {
              const text = req.body.text;
              const operation = req.body.operation || 'encode';
              apiUrl = `${req.protocol}://${req.get('host')}/api/v1/tools/base64/${operation}`;
              requestData = { text: text };
            }
            break;
          case 'passwd':
            if (req.body?.action === 'generate') {
              const length = req.body.length || 16;
              apiUrl = `${req.protocol}://${req.get('host')}/api/v1/tools/passwd/${length}`;
            }
            break;
        }
        
        // Make API call if we have a URL and data
        if (apiUrl) {
          let response;
          if (Object.keys(requestData).length > 0) {
            response = await axios.post(apiUrl, requestData);
          } else {
            response = await axios.get(apiUrl);
          }
          toolResult = response.data;
        }
      } catch (error) {
        toolError = error.message;
      }
    }
    
    res.render(`pages/utilities/${tool}`, {
      title: `${pageTitle} - Backend API`,
      description: `${pageTitle} utility tool`,
      activePage: 'utilities',
      baseUrl: `${req.protocol}://${req.get('host')}`,
      toolData: toolData,
      toolResult: toolResult,
      toolError: toolError,
      query: req.query
    });
  } catch (error) {
    // Send 404 if specific page doesn't exist
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Utilities page not found - ${req.originalUrl}`
    });
  }
}

// 🛠️ Tools frontend routes  
defaultRoute.get('/tools/:tool', cors(), (req, res) => {
  try {
    const { tool } = req.params;
    const pageTitle = tool.charAt(0).toUpperCase() + tool.slice(1).replace('-', ' ');
    
    res.render(`pages/tools/${tool}`, {
      title: `${pageTitle} - Backend API`,
      description: `${pageTitle} tool`,
      activePage: 'tools',
      baseUrl: `${req.protocol}://${req.get('host')}`
    });
  } catch (error) {
    // Fallback to generic page if specific page doesn't exist
    res.status(404).json({
      success: false,
      error: 'Not Found', 
      message: `Tools page not found - ${req.originalUrl}`
    });
  }
});

// 📊 Data frontend routes (GET and POST)
defaultRoute.get('/data/:source', cors(), async (req, res) => {
  await handleDataRequest(req, res);
});

defaultRoute.post('/data/:source', cors(), async (req, res) => {
  await handleDataRequest(req, res);
});

async function handleDataRequest(req, res) {
  try {
    const { source } = req.params;
    const pageTitle = source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' ');
    
    // For data pages, fetch data server-side
    if (source === 'domains') {
      try {
        const axios = require('axios');
        const apiUrl = `${req.protocol}://${req.get('host')}/api/v1/me/info/domains`;
        const response = await axios.get(apiUrl);
        
        let domainsData = response.data;
        const searchTerm = req.body?.search;
        
        // Filter domains if search term provided via POST
        if (searchTerm && domainsData.domains) {
          const filteredDomains = domainsData.domains.filter(domain => 
            domain.toLowerCase().includes(searchTerm.toLowerCase())
          );
          const filteredSubDomains = (domainsData.subDomains || []).filter(subdomain => 
            subdomain && subdomain.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          domainsData = {
            ...domainsData,
            domains: filteredDomains,
            subDomains: filteredSubDomains,
            originalCount: response.data.domains.length,
            filtered: true,
            searchTerm: searchTerm
          };
        }
        
        res.render(`pages/data/${source}`, {
          title: `${pageTitle} - Backend API`,
          description: `${pageTitle} data source`,
          activePage: 'data',
          baseUrl: `${req.protocol}://${req.get('host')}`,
          domainsData: domainsData
        });
      } catch (error) {
        res.render(`pages/data/${source}`, {
          title: `${pageTitle} - Backend API`,
          description: `${pageTitle} data source`,
          activePage: 'data',
          baseUrl: `${req.protocol}://${req.get('host')}`,
          domainsData: null,
          error: 'Failed to load domains data',
          search: req.query.search || ''
        });
      }
    } else if (source === 'blogs') {
      try {
        // Use direct controller call for reliability
        const blogController = require('../controllers/blog');
        const posts = await blogController.getBlogPosts();
        
        console.log(`Blog posts loaded: ${posts.length} posts`);
        
        const blogData = {
          repository: "malaks-us/jason",
          total_posts: posts.length,
          posts: posts
        };
        
        res.render(`pages/data/${source}`, {
          title: `${pageTitle} - Backend API`,
          description: `${pageTitle} data source`,
          activePage: 'data',
          baseUrl: `${req.protocol}://${req.get('host')}`,
          blogData: blogData
        });
      } catch (error) {
        console.error('Blog controller error:', error.message);
        res.render(`pages/data/${source}`, {
          title: `${pageTitle} - Backend API`,
          description: `${pageTitle} data source`,
          activePage: 'data',
          baseUrl: `${req.protocol}://${req.get('host')}`,
          blogData: null,
          error: 'Failed to load blog data: ' + error.message
        });
      }
    } else {
      // For other data pages, try to fetch their data server-side
      let pageData = null;
      let apiError = null;
      
      try {
        const axios = require('axios');
        let apiUrl = null;
        
        switch(source) {
          case 'reddit':
            apiUrl = `${req.protocol}://${req.get('host')}/api/v1/me/info/reddit`;
            break;
          case 'git':
            apiUrl = `${req.protocol}://${req.get('host')}/api/v1/me/info/github`;
            break;
          case 'todos':
            apiUrl = `${req.protocol}://${req.get('host')}/api/v1/data/todos/list`;
            break;
          case 'notes':
            apiUrl = `${req.protocol}://${req.get('host')}/api/v1/data/notes/list`;
            break;
        }
        
        if (apiUrl) {
          const response = await axios.get(apiUrl);
          pageData = response.data;
        }
      } catch (error) {
        apiError = error.message;
      }
      
      res.render(`pages/data/${source}`, {
        title: `${pageTitle} - Backend API`,
        description: `${pageTitle} data source`,
        activePage: 'data',
        baseUrl: `${req.protocol}://${req.get('host')}`,
        pageData: pageData,
        apiError: apiError
      });
    }
  } catch (error) {
    // Fallback to generic page if specific page doesn't exist
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Data page not found - ${req.originalUrl}`
    });
  }
}

// 🏥 Health frontend routes
defaultRoute.get('/health/:service', cors(), (req, res) => {
  try {
    const servicePath = path.join(`${__dirname}/../public/health/${req.params.service}/index.html`);
    if (require('fs').existsSync(servicePath)) {
      res.sendFile(servicePath);
    } else {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Health page not found - ${req.originalUrl}`
      });
    }
  } catch (error) {
    const data = { error: error.message };
    setStandardHeaders(res, data);
    res.json(data);
  }
});

// 👤 Personal frontend routes
defaultRoute.get('/personal/:service', cors(), (req, res) => {
  try {
    const { service } = req.params;
    const pageTitle = service.charAt(0).toUpperCase() + service.slice(1).replace('-', ' ');
    
    res.render(`pages/personal/${service}`, {
      title: `${pageTitle} - Backend API`,
      description: `${pageTitle} personal service`,
      activePage: 'personal'
    });
  } catch (error) {
    // Fallback to generic page if specific page doesn't exist
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Personal page not found - ${req.originalUrl}`
    });
  }
});

// 🌐 Services frontend routes
defaultRoute.get('/services/:service', cors(), (req, res) => {
  try {
    const { service } = req.params;
    const pageTitle = service.charAt(0).toUpperCase() + service.slice(1).replace('-', ' ');
    
    res.render(`pages/services/${service}`, {
      title: `${pageTitle} - Backend API`,
      description: `${pageTitle} service`,
      activePage: 'services'
    });
  } catch (error) {
    // Fallback to generic page if specific page doesn't exist
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Services page not found - ${req.originalUrl}`
    });
  }
});

// 🌍 World frontend routes
defaultRoute.get('/world/:source', cors(), (req, res) => {
  try {
    const { source } = req.params;
    const pageTitle = source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' ');
    
    res.render(`pages/world/${source}`, {
      title: `${pageTitle} - Backend API`,
      description: `${pageTitle} world data`,
      activePage: 'world',
      baseUrl: `${req.protocol}://${req.get('host')}`
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `World page not found - ${req.originalUrl}`
    });
  }
});

// 🌐 Social frontend routes
defaultRoute.get('/social/:platform', cors(), (req, res) => {
  try {
    const { platform } = req.params;
    const pageTitle = platform.charAt(0).toUpperCase() + platform.slice(1).replace('-', ' ');
    
    res.render(`pages/social/${platform}`, {
      title: `${pageTitle} - Backend API`,
      description: `${pageTitle} social platform`,
      activePage: 'social',
      baseUrl: `${req.protocol}://${req.get('host')}`
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Social page not found - ${req.originalUrl}`
    });
  }
});

// 🎮 Fun frontend routes
defaultRoute.get('/fun/:activity', cors(), (req, res) => {
  try {
    const { activity } = req.params;
    const pageTitle = activity.charAt(0).toUpperCase() + activity.slice(1).replace('-', ' ');
    
    res.render(`pages/fun/${activity}`, {
      title: `${pageTitle} - Backend API`,
      description: `${pageTitle} fun activity`,
      activePage: 'fun',
      baseUrl: `${req.protocol}://${req.get('host')}`
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Fun page not found - ${req.originalUrl}`
    });
  }
});

// ==== LEGACY FRONTEND ROUTES (BACKWARD COMPATIBILITY) ====

// Auth route (special case)
defaultRoute.get('/auth', cors(), (req, res) => {
  try {
    res.render('pages/services/auth', {
      title: 'Authentication - Backend API',
      description: 'User authentication and JWT management',
      activePage: 'auth'
    });
  } catch (error) {
    const data = { error: error.message };
    setStandardHeaders(res, data);
    res.json(data);
  }
});

// Legacy specific routes
defaultRoute.get('/base64', cors(), (req, res) => {
  res.redirect('/utilities/base64');
});

defaultRoute.get('/commit', cors(), (req, res) => {
  res.redirect('/tools/commit');
});

// Generic legacy frontend route handler for specific static endpoints only
defaultRoute.get('/:endpoint', cors(), (req, res) => {
  try {
    const endpointPath = path.join(`${__dirname}/../public/${req.params.endpoint}/index.html`);
    // Only serve if specific static file exists
    if (require('fs').existsSync(endpointPath)) {
      res.sendFile(endpointPath);
    } else {
      // No fallback - let 404 handler take over
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Page not found - ${req.originalUrl}`,
        errors: [{ msg: `The requested page ${req.originalUrl} does not exist` }]
      });
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Page not found - ${req.originalUrl}`
    });
  }
});

// Function to generate generic endpoint pages
function generateGenericEndpointPage(endpoint) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} - Backend API</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/darkly/bootstrap.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" />
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand" href="/"><i class="bi bi-code-slash"></i> Backend API</a>
      <div class="navbar-nav ms-auto">
        <a class="nav-link" href="/">Home</a>
        <a class="nav-link" href="/api/docs">API Docs</a>
      </div>
    </div>
  </nav>
  <div class="container mt-5 text-center">
    <h1 class="text-danger">${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} API</h1>
    <p class="lead">This endpoint provides ${endpoint} functionality</p>
    <div class="card border-info mt-4">
      <div class="card-body">
        <h5>API Endpoint</h5>
        <p><code>/api/v1/${endpoint}</code></p>
        <a href="/api/v1/${endpoint}" class="btn btn-info" target="_blank">
          <i class="bi bi-box-arrow-up-right"></i> View API Response
        </a>
        <a href="/api/docs" class="btn btn-outline-info ms-2">
          <i class="bi bi-book"></i> Documentation
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Function to generate categorized endpoint pages
function generateCategorizedEndpointPage(category, tool) {
  const categoryEmoji = {
    'utilities': '🔧',
    'tools': '🛠️', 
    'data': '📊',
    'health': '🏥',
    'personal': '👤',
    'services': '🌐'
  };
  
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${tool.charAt(0).toUpperCase() + tool.slice(1)} ${category.charAt(0).toUpperCase() + category.slice(1)} - Backend API</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/darkly/bootstrap.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" />
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand" href="/"><i class="bi bi-code-slash"></i> Backend API</a>
      <div class="navbar-nav ms-auto">
        <a class="nav-link" href="/">Home</a>
        <a class="nav-link" href="/api/docs">API Docs</a>
      </div>
    </div>
  </nav>
  <div class="container mt-5 text-center">
    <h1 class="text-danger">
      ${categoryEmoji[category] || '🔗'} ${tool.charAt(0).toUpperCase() + tool.slice(1)} 
      <small class="text-muted">${category.charAt(0).toUpperCase() + category.slice(1)}</small>
    </h1>
    <p class="lead">This ${category} endpoint provides ${tool} functionality</p>
    <div class="row justify-content-center mt-4">
      <div class="col-md-8">
        <div class="card border-info">
          <div class="card-header">
            <h5 class="mb-0">API Endpoints</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6 class="text-success">New Categorized</h6>
                <p><code>/api/v1/${category}/${tool}</code></p>
                <a href="/api/v1/${category}/${tool}" class="btn btn-success btn-sm" target="_blank">
                  <i class="bi bi-box-arrow-up-right"></i> View Response
                </a>
              </div>
              <div class="col-md-6">
                <h6 class="text-warning">Legacy (Compatible)</h6>
                <p><code>/api/v1/${tool}</code></p>
                <a href="/api/v1/${tool}" class="btn btn-warning btn-sm" target="_blank">
                  <i class="bi bi-box-arrow-up-right"></i> View Response
                </a>
              </div>
            </div>
            <hr>
            <a href="/api/docs" class="btn btn-outline-info">
              <i class="bi bi-book"></i> Full Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// URL Shortener redirect handler
defaultRoute.get('/s/:code', cors(), async (req, res) => {
  try {
    const url = await utilitiesController.getUrlByCode(req.params.code);
    
    // Perform actual redirect
    res.redirect(301, url.originalUrl);
  } catch (error) {
    // Return error page or redirect to home
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Link Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #e74c3c; }
          p { color: #7f8c8d; margin: 20px 0; }
          a { color: #3498db; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>404 - Link Not Found</h1>
        <p>${error.message}</p>
        <p><a href="/">Return to Home</a></p>
      </body>
      </html>
    `);
  }
});

module.exports = defaultRoute;
