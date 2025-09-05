const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🚀 CasJay API',
      version: process.env.VERSION || '1.9.4',
      description: `
# CasJay Backend API 🎯

A comprehensive, high-performance API service built with Express.js and MongoDB, featuring:

## 🛠️ **Developer Tools**
- Base64 encoding/decoding, UUID generation, JWT handling
- Hash generation (MD5, SHA256), QR code generation
- Lorem ipsum generation, password utilities

## 🌍 **World Data**  
- Real-time COVID-19 statistics, timezone information
- School closings, regional data (USA/NYS)

## 🌐 **Social Integrations**
- GitHub user/repository data
- Reddit content via RSS feeds
- Blog post management

## 🎮 **Fun & Entertainment**
- Jokes, facts, trivia, anime quotes
- Various entertainment endpoints

## 📊 **Data Management**
- Personal todos, notes, URL shortening
- Data storage and retrieval

## 🎨 **Theme**: Dark mode with Dracula color scheme
## 🚀 **Performance**: Cached responses, rate limiting, error handling
      `,
      contact: {
        name: 'CasJay',
        url: 'https://github.com/casjay',
        email: 'support@casjay.pro'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      'x-logo': {
        url: '/favicon.ico',
        altText: 'CasJay API'
      }
    },
    servers: [
      {
        url: '{protocol}://{host}/api/v1',
        description: 'API Server',
        variables: {
          protocol: {
            enum: ['http', 'https'],
            default: 'http'
          },
          host: {
            default: 'localhost:1919'
          }
        }
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string'
            },
            message: {
              type: 'string'
            }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Tools',
        description: 'Developer tools and utilities'
      },
      {
        name: 'Social',
        description: 'Social media integrations'
      },
      {
        name: 'World',
        description: 'World data and information'
      },
      {
        name: 'Fun',
        description: 'Entertainment endpoints'
      },
      {
        name: 'Data',
        description: 'Data storage and management'
      },
      {
        name: 'Personal',
        description: 'Personal data and profile'
      },
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'System',
        description: 'System information and cache management'
      }
    ]
  },
  apis: [
    './api/routes/*.js',
    './api/docs/swagger/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;