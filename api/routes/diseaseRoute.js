require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const diseaseRoute = express.Router();
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { setStandardHeaders } = require('../utils/standardHeaders');

diseaseRoute.use(
  '/',
  createProxyMiddleware({
    target: 'https://disease.sh',
    changeOrigin: true,
    pathRewrite: {
      [`^/api/v1/world/disease`]: '/v3/covid-19/all',
    },

    // subscribe to http-proxy's proxyRes event
    onProxyRes: function (proxyRes, req, res) {
      if (proxyRes.statusCode === 404) {
        const data = { Error: 'Page not found.' };
        setStandardHeaders(res, data);
        return res.status(404).json(data);
      }
      if (proxyRes.statusCode === 500) {
        const data = { Error: 'Something went horribly wrong.' };
        setStandardHeaders(res, data);
        return res.status(500).json(data);
      }
    },
    // subscribe to http-proxy's proxyReq event
    onProxyReq: function (proxyReq, req, res) {},
  })
);

module.exports = diseaseRoute;
