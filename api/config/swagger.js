const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDocs = require('./swagger-docs');

// Combine all paths from swagger-docs
const paths = {};
const tags = [];
const components = { 
  schemas: {
    Error: {
      type: 'object',
      properties: {
        error: {
          type: 'string'
        }
      }
    },
    ValidationError: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              msg: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    AuthResponse: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {}
        },
        data: {
          type: 'object',
          properties: {
            token: {
              type: 'string'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                email: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  }
};

// Process all documentation modules
Object.values(swaggerDocs).forEach(doc => {
  if (doc.tag) {
    tags.push(doc.tag);
  }
  
  if (doc.paths) {
    Object.assign(paths, doc.paths);
  }
  
  if (doc.components && doc.components.schemas) {
    Object.assign(components.schemas, doc.components.schemas);
  }
});

// Helper function to get server URL
const getServerUrl = () => {
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  
  // Default to relative URL for reverse proxy compatibility
  return '';
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Server',
      version: process.env.npm_package_version || '1.9.2',
      description: 'A multi-purpose Express.js API server with various endpoints',
      contact: {
        name: 'CasjaysDev',
        email: 'git-admin@casjaysdev.pro',
        url: 'https://api.casjay.coffee'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: getServerUrl(),
        description: 'API Server',
        variables: {
          protocol: {
            enum: ['http', 'https'],
            default: 'https'
          },
          host: {
            default: 'api.casjay.coffee'
          },
          port: {
            default: ''
          }
        }
      }
    ],
    tags: tags,
    paths: paths,
    components: {
      ...components,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      }
    }
  },
  apis: [] // We're using centralized docs now, not parsing route files
};

const specs = swaggerJsdoc(options);

module.exports = specs;