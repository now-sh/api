require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const commitRoute = express.Router();
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const commitment_url = process.env.GIT_MESSAGE_URL || 'https://commitment-6jyr.onrender.com';

commitRoute.use(
  '/',
  createProxyMiddleware({
    target: commitment_url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/commit/txt/': '/txt',
      '^/api/v1/commit/text/': '/txt',
      '^/api/v1/commit/json/': '/json',
      '^/api/v1/commit': '/txt',
      '^/api/v1/commit/': '/txt',
    },
    onProxyRes: function (proxyRes, req, res) {
      if (proxyRes.statusCode === 404) {
        return res.json({ Error: 'Page not found.' });
      }
      if (proxyRes.statusCode === 500) {
        return res.json({ Error: 'Something went horribly wrong.' });
      }
    },
  })
);

module.exports = commitRoute;
