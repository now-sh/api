// dotenv loaded in index.js
const path = require('path');
const express = require('express');
const handlerRoute = express.Router();
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

const morganHandler = handlerRoute.use(morgan('common'));

// Custom security headers - CSP temporarily disabled for debugging
const securityHeaders = handlerRoute.use((req, res, next) => {
  // Basic security headers only
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove any CSP to test
  res.removeHeader('Content-Security-Policy');
  
  next();
});
const compressionHandler = handlerRoute.use(compression());
const expressHandler = handlerRoute.use(
  express.static(path.join(__dirname, '../public')),
  express.json({ limit: '10mb' }),
  express.urlencoded({
    extended: true,
    limit: '10mb'
  }),
  cors()
);

module.exports = { expressHandler, morganHandler, securityHeaders, compressionHandler, handlerRoute };
