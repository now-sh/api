require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const diseaseRoute = express.Router();
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

diseaseRoute.use(
  '/',
  createProxyMiddleware({
    target: 'https://disease.sh',
    changeOrigin: true,
    pathRewrite: {
      [`^/api/v1/disease`]: 'https://disease.sh/v3/covid-19/all',
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
  })
);

module.exports = diseaseRoute;
