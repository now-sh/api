require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const commitRoute = express.Router();
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

commitRoute.use(
  '/',
  createProxyMiddleware({
    pathRewrite: {
      [`^/api/v1/commit`]: 'https://commitment.herokuapp.com/json',
      [`^/api/v1/commit/txt`]: 'https://commitment.herokuapp.com/txt',
      [`^/api/v1/commit/json`]: 'https://commitment.herokuapp.com/json',
    },

    // subscribe to http-proxy's proxyRes event
    onProxyRes: function (proxyRes, req, res) {
      if (proxyRes.statusCode === 404) {
        return res.json({ Error: 'Page not found.' });
      }
      if (proxyRes.statusCode === 500) {
        return res.json({ Error: 'Something went horribly wrong.' });
      }
    },
    // subscribe to http-proxy's proxyReq event
    onProxyReq: function (proxyReq, req, res) {},
    target: 'https://commitment.herokuapp.com',
    changeOrigin: true,
  })
);

module.exports = commitRoute;
