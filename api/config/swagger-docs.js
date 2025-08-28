module.exports = {
  base64: {
    tag: {
      name: 'Base64',
      description: 'Base64 encode/decode utilities'
    },
    paths: {
      '/api/v1/base64': {
        get: {
          summary: 'Base64 encode/decode utility',
          tags: ['Utilities'],
          responses: {
            200: {
              description: 'Base64 utility information'
            }
          }
        }
      },
      '/api/v1/base64/encode': {
        post: {
          summary: 'Encode text to base64',
          tags: ['Utilities'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    text: {
                      type: 'string'
                    }
                  }
                }
              },
              'application/x-www-form-urlencoded': {
                schema: {
                  type: 'object',
                  properties: {
                    text: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/base64/decode': {
        post: {
          summary: 'Decode base64 to text',
          tags: ['Utilities']
        }
      }
    }
  },
  
  hash: {
    tag: {
      name: 'Hash',
      description: 'Text hashing utilities'
    },
    paths: {
      '/api/v1/hash': {
        get: {
          summary: 'Get hash utility information',
          tags: ['Hash'],
          responses: {
            200: {
              description: 'Hash utility information'
            }
          }
        }
      },
      '/api/v1/hash/{algorithm}': {
        post: {
          summary: 'Hash text with specified algorithm',
          tags: ['Hash'],
          parameters: [
            {
              in: 'path',
              name: 'algorithm',
              required: true,
              schema: {
                type: 'string',
                enum: ['md5', 'sha1', 'sha256', 'sha512']
              },
              description: 'Hash algorithm'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['text'],
                  properties: {
                    text: {
                      type: 'string',
                      description: 'Text to hash'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Hash result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      algorithm: {
                        type: 'string'
                      },
                      hash: {
                        type: 'string'
                      },
                      input: {
                        type: 'string'
                      },
                      length: {
                        type: 'number'
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid input'
            }
          }
        }
      }
    }
  },
  
  uuid: {
    tag: {
      name: 'UUID',
      description: 'UUID generation utility'
    },
    paths: {
      '/api/v1/uuid': {
        get: {
          summary: 'Get UUID utility information',
          tags: ['UUID'],
          responses: {
            200: {
              description: 'UUID utility information'
            }
          }
        }
      },
      '/api/v1/uuid/v4': {
        get: {
          summary: 'Generate a UUID v4',
          tags: ['UUID'],
          responses: {
            200: {
              description: 'Generated UUID',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      uuid: {
                        type: 'string'
                      },
                      version: {
                        type: 'string'
                      },
                      timestamp: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/uuid/generate': {
        post: {
          summary: 'Generate UUID with options',
          tags: ['UUID'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    uppercase: {
                      type: 'boolean',
                      description: 'Return UUID in uppercase'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Generated UUID'
            }
          }
        }
      }
    }
  },
  
  password: {
    tag: {
      name: 'Password',
      description: 'Secure password generation'
    },
    paths: {
      '/api/v1/passwd': {
        get: {
          summary: 'Get password generator information',
          tags: ['Password'],
          responses: {
            200: {
              description: 'Password generator information'
            }
          }
        }
      },
      '/api/v1/passwd/{length}': {
        get: {
          summary: 'Generate password with specified length',
          tags: ['Password'],
          parameters: [
            {
              in: 'path',
              name: 'length',
              required: true,
              schema: {
                type: 'integer',
                minimum: 4,
                maximum: 128
              },
              description: 'Password length'
            }
          ],
          responses: {
            200: {
              description: 'Generated password'
            }
          }
        }
      },
      '/api/v1/passwd/generate': {
        post: {
          summary: 'Generate password with custom options',
          tags: ['Password'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    length: {
                      type: 'integer',
                      minimum: 4,
                      maximum: 128,
                      default: 16
                    },
                    numbers: {
                      type: 'boolean',
                      default: true
                    },
                    symbols: {
                      type: 'boolean',
                      default: true
                    },
                    uppercase: {
                      type: 'boolean',
                      default: true
                    },
                    lowercase: {
                      type: 'boolean',
                      default: true
                    },
                    excludeSimilar: {
                      type: 'boolean',
                      default: false
                    },
                    exclude: {
                      type: 'string',
                      description: 'Characters to exclude'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Generated password with metadata'
            }
          }
        }
      }
    }
  },
  
  jwt: {
    tag: {
      name: 'JWT',
      description: 'JWT decode and validation utility'
    },
    paths: {
      '/api/v1/jwt': {
        get: {
          summary: 'Get JWT utility information',
          tags: ['JWT'],
          responses: {
            200: {
              description: 'JWT utility information'
            }
          }
        }
      },
      '/api/v1/jwt/decode': {
        post: {
          summary: 'Decode JWT without validation',
          tags: ['JWT'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token'],
                  properties: {
                    token: {
                      type: 'string',
                      description: 'JWT token to decode'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Decoded JWT',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      header: {
                        type: 'object'
                      },
                      payload: {
                        type: 'object'
                      },
                      signature: {
                        type: 'string'
                      },
                      valid_format: {
                        type: 'boolean'
                      },
                      expired: {
                        type: 'boolean'
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid JWT'
            }
          }
        }
      },
      '/api/v1/jwt/validate': {
        post: {
          summary: 'Decode and validate JWT with secret',
          tags: ['JWT'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token', 'secret'],
                  properties: {
                    token: {
                      type: 'string',
                      description: 'JWT token to validate'
                    },
                    secret: {
                      type: 'string',
                      description: 'Secret key to validate signature'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Validated JWT'
            }
          }
        }
      }
    }
  },
  
  qr: {
    tag: {
      name: 'QR Code',
      description: 'QR code generation utility'
    },
    paths: {
      '/api/v1/qr': {
        get: {
          summary: 'Get QR code utility information',
          tags: ['QR Code'],
          responses: {
            200: {
              description: 'QR code utility information'
            }
          }
        }
      },
      '/api/v1/qr/text/{text}': {
        get: {
          summary: 'Generate simple QR code for text',
          tags: ['QR Code'],
          parameters: [
            {
              in: 'path',
              name: 'text',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Text to encode'
            }
          ],
          responses: {
            200: {
              description: 'QR code as PNG data URL'
            }
          }
        }
      },
      '/api/v1/qr/generate': {
        post: {
          summary: 'Generate QR code with custom options',
          tags: ['QR Code'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['text'],
                  properties: {
                    text: {
                      type: 'string',
                      description: 'Text to encode'
                    },
                    type: {
                      type: 'string',
                      enum: ['png', 'svg', 'text'],
                      default: 'png'
                    },
                    size: {
                      type: 'integer',
                      minimum: 50,
                      maximum: 500,
                      default: 200
                    },
                    margin: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 10,
                      default: 1
                    },
                    color: {
                      type: 'object',
                      properties: {
                        dark: {
                          type: 'string',
                          default: '#000000'
                        },
                        light: {
                          type: 'string',
                          default: '#FFFFFF'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Generated QR code'
            }
          }
        }
      }
    }
  },
  
  color: {
    tag: {
      name: 'Color',
      description: 'Color format conversion utility'
    },
    paths: {
      '/api/v1/color': {
        get: {
          summary: 'Get color converter information',
          tags: ['Color'],
          responses: {
            200: {
              description: 'Color converter information'
            }
          }
        }
      },
      '/api/v1/color/{from}/{to}/{color}': {
        get: {
          summary: 'Convert color using URL parameters',
          tags: ['Color'],
          parameters: [
            {
              in: 'path',
              name: 'from',
              required: true,
              schema: {
                type: 'string',
                enum: ['hex', 'rgb', 'hsl']
              },
              description: 'Source format'
            },
            {
              in: 'path',
              name: 'to',
              required: true,
              schema: {
                type: 'string',
                enum: ['hex', 'rgb', 'hsl']
              },
              description: 'Target format'
            },
            {
              in: 'path',
              name: 'color',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Color value (URL encoded)'
            }
          ],
          responses: {
            200: {
              description: 'Converted color'
            }
          }
        }
      },
      '/api/v1/color/convert': {
        post: {
          summary: 'Convert color with body parameters',
          tags: ['Color'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['color', 'from', 'to'],
                  properties: {
                    color: {
                      type: 'string',
                      description: 'Color value'
                    },
                    from: {
                      type: 'string',
                      enum: ['hex', 'rgb', 'hsl'],
                      description: 'Source format'
                    },
                    to: {
                      type: 'string',
                      enum: ['hex', 'rgb', 'hsl'],
                      description: 'Target format'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Converted color',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      input: {
                        type: 'string'
                      },
                      inputFormat: {
                        type: 'string'
                      },
                      output: {
                        type: 'string'
                      },
                      outputFormat: {
                        type: 'string'
                      },
                      rgb: {
                        type: 'object',
                        properties: {
                          r: {
                            type: 'integer'
                          },
                          g: {
                            type: 'integer'
                          },
                          b: {
                            type: 'integer'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  
  url: {
    tag: {
      name: 'URL Shortener',
      description: 'URL shortening service'
    },
    paths: {
      '/api/v1/url': {
        get: {
          summary: 'Get URL shortener information',
          tags: ['URL Shortener'],
          responses: {
            200: {
              description: 'URL shortener information'
            }
          }
        }
      },
      '/api/v1/url/shorten': {
        post: {
          summary: 'Create a shortened URL',
          tags: ['URL Shortener'],
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['url'],
                  properties: {
                    url: {
                      type: 'string',
                      format: 'uri',
                      description: 'URL to shorten'
                    },
                    customAlias: {
                      type: 'string',
                      description: 'Custom short code'
                    },
                    expiresIn: {
                      type: 'integer',
                      description: 'Expiration time in milliseconds'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Shortened URL created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      shortCode: {
                        type: 'string'
                      },
                      shortUrl: {
                        type: 'string'
                      },
                      originalUrl: {
                        type: 'string'
                      },
                      expiresAt: {
                        type: 'string',
                        format: 'date-time'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/url/stats/{code}': {
        get: {
          summary: 'Get URL statistics',
          tags: ['URL Shortener'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'code',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Short code'
            }
          ],
          responses: {
            200: {
              description: 'URL statistics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      shortCode: {
                        type: 'string'
                      },
                      originalUrl: {
                        type: 'string'
                      },
                      clicks: {
                        type: 'integer'
                      },
                      createdAt: {
                        type: 'string',
                        format: 'date-time'
                      },
                      lastAccessed: {
                        type: 'string',
                        format: 'date-time'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/url/list': {
        get: {
          summary: "List user's URLs",
          tags: ['URL Shortener'],
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            200: {
              description: "List of user's URLs"
            },
            401: {
              description: 'Authentication required'
            }
          }
        }
      }
    }
  },
  
  lorem: {
    tag: {
      name: 'Lorem Ipsum',
      description: 'Lorem ipsum text generator'
    },
    paths: {
      '/api/v1/lorem': {
        get: {
          summary: 'Get lorem ipsum generator information',
          tags: ['Lorem Ipsum'],
          responses: {
            200: {
              description: 'Lorem ipsum generator information'
            }
          }
        }
      },
      '/api/v1/lorem/sentences/{number}': {
        get: {
          summary: 'Generate sentences',
          tags: ['Lorem Ipsum'],
          parameters: [
            {
              in: 'path',
              name: 'number',
              required: true,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 50
              },
              description: 'Number of sentences'
            }
          ],
          responses: {
            200: {
              description: 'Generated sentences'
            }
          }
        }
      },
      '/api/v1/lorem/sentences/{number}/json': {
        get: {
          summary: 'Generate sentences in JSON format',
          tags: ['Lorem Ipsum'],
          parameters: [
            {
              in: 'path',
              name: 'number',
              required: true,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 50
              },
              description: 'Number of sentences'
            }
          ],
          responses: {
            200: {
              description: 'Generated sentences in JSON'
            }
          }
        }
      },
      '/api/v1/lorem/paragraphs/{paragraphs}/{sentences}': {
        get: {
          summary: 'Generate paragraphs',
          tags: ['Lorem Ipsum'],
          parameters: [
            {
              in: 'path',
              name: 'paragraphs',
              required: true,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 20
              },
              description: 'Number of paragraphs'
            },
            {
              in: 'path',
              name: 'sentences',
              required: true,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 10
              },
              description: 'Sentences per paragraph'
            }
          ],
          responses: {
            200: {
              description: 'Generated paragraphs'
            }
          }
        }
      },
      '/api/v1/lorem/paragraphs/{paragraphs}/{sentences}/json': {
        get: {
          summary: 'Generate paragraphs in JSON format',
          tags: ['Lorem Ipsum'],
          parameters: [
            {
              in: 'path',
              name: 'paragraphs',
              required: true,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 20
              },
              description: 'Number of paragraphs'
            },
            {
              in: 'path',
              name: 'sentences',
              required: true,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 10
              },
              description: 'Sentences per paragraph'
            }
          ],
          responses: {
            200: {
              description: 'Generated paragraphs in JSON'
            }
          }
        }
      },
      '/api/v1/lorem/generate': {
        post: {
          summary: 'Generate custom lorem ipsum',
          tags: ['Lorem Ipsum'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sentences: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 50
                    },
                    paragraphs: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 20
                    },
                    sentencesPerParagraph: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 10
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Generated text'
            }
          }
        }
      }
    }
  },
  
  todo: {
    tag: {
      name: 'Todos',
      description: 'Todo list management with public/private functionality'
    },
    components: {
      schemas: {
        Todo: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            completed: {
              type: 'boolean'
            },
            isPublic: {
              type: 'boolean'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high']
            },
            dueDate: {
              type: 'string',
              format: 'date-time'
            },
            owner: {
              type: 'object'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    }
  },
  
  notes: {
    tag: {
      name: 'Notes',
      description: 'Note-taking and gist management (Google Keep + OpenGist style)'
    },
    components: {
      schemas: {
        Note: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            },
            content: {
              type: 'string'
            },
            snippet: {
              type: 'string'
            },
            contentType: {
              type: 'string',
              enum: ['text', 'markdown', 'code']
            },
            language: {
              type: 'string'
            },
            isPublic: {
              type: 'boolean'
            },
            isGist: {
              type: 'boolean'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            color: {
              type: 'string'
            },
            isPinned: {
              type: 'boolean'
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            viewCount: {
              type: 'number'
            },
            owner: {
              type: 'object'
            },
            collaborators: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    }
  }
};