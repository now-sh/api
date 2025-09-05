const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

const router = express.Router();

// Swagger UI options
const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CasJay API Documentation',
  customfavIcon: '/favicon.ico'
};

// Serve Swagger documentation
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, options));

// Serve raw Swagger JSON
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = router;