const express = require('express');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const uuidController = require('../controllers/uuid');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const uuidRoute = express.Router();

/**
 * Validation middleware
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendJSON(res, formatError('Validation failed', {
      details: formatValidationErrors(errors.array())
    }), { status: 400 });
    return;
  }
  next();
}

/**
 * Generate UUID v4 - JSON response
 */
uuidRoute.get('/v4',
  cors(),
  (req, res) => {
    try {
      const result = uuidController.generateUUID();
      sendJSON(res, formatSuccess({
        uuid: result.uuid,
        version: result.version,
        format: result.format
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate UUID v4 - Text response
 */
uuidRoute.get('/v4/text',
  cors(),
  (req, res) => {
    try {
      const result = uuidController.generateUUID();
      sendText(res, result.uuid);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Generate UUID with options - JSON response
 */
uuidRoute.post('/generate',
  cors(),
  body('uppercase').optional().isBoolean().withMessage('uppercase must be boolean'),
  body('version').optional().isIn(['v4']).withMessage('version must be v4'),
  body('count').optional().isInt({ min: 1, max: 100 }).withMessage('count must be between 1 and 100'),
  validateRequest,
  (req, res) => {
    try {
      const options = {
        uppercase: req.body.uppercase || false,
        version: req.body.version || 'v4'
      };
      const count = parseInt(req.body.count) || 1;
      
      if (count === 1) {
        const result = uuidController.generateUUID(options);
        sendJSON(res, formatSuccess({
          uuid: result.uuid,
          version: result.version,
          format: result.format,
          uppercase: options.uppercase
        }));
      } else {
        const uuids = [];
        for (let i = 0; i < count; i++) {
          const result = uuidController.generateUUID(options);
          uuids.push(result.uuid);
        }
        sendJSON(res, formatSuccess({
          uuids,
          count: uuids.length,
          version: options.version,
          uppercase: options.uppercase
        }));
      }
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate UUID with options - Text response
 */
uuidRoute.post('/generate/text',
  cors(),
  body('uppercase').optional().isBoolean().withMessage('uppercase must be boolean'),
  body('version').optional().isIn(['v4']).withMessage('version must be v4'),
  body('count').optional().isInt({ min: 1, max: 100 }).withMessage('count must be between 1 and 100'),
  validateRequest,
  (req, res) => {
    try {
      const options = {
        uppercase: req.body.uppercase || false,
        version: req.body.version || 'v4'
      };
      const count = parseInt(req.body.count) || 1;
      
      if (count === 1) {
        const result = uuidController.generateUUID(options);
        sendText(res, result.uuid);
      } else {
        const uuids = [];
        for (let i = 0; i < count; i++) {
          const result = uuidController.generateUUID(options);
          uuids.push(result.uuid);
        }
        sendText(res, uuids.join('\n'));
      }
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Generate multiple UUIDs via GET - JSON response
 */
uuidRoute.get('/generate/:count',
  cors(),
  param('count').isInt({ min: 1, max: 100 }).withMessage('count must be between 1 and 100'),
  validateRequest,
  (req, res) => {
    try {
      const count = parseInt(req.params.count);
      const uuids = [];
      
      for (let i = 0; i < count; i++) {
        const result = uuidController.generateUUID();
        uuids.push(result.uuid);
      }
      
      sendJSON(res, formatSuccess({
        uuids,
        count: uuids.length,
        version: 'v4'
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Generate multiple UUIDs via GET - Text response
 */
uuidRoute.get('/generate/:count/text',
  cors(),
  param('count').isInt({ min: 1, max: 100 }).withMessage('count must be between 1 and 100'),
  validateRequest,
  (req, res) => {
    try {
      const count = parseInt(req.params.count);
      const uuids = [];
      
      for (let i = 0; i < count; i++) {
        const result = uuidController.generateUUID();
        uuids.push(result.uuid);
      }
      
      sendText(res, uuids.join('\n'));
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Validate UUID format
 */
uuidRoute.post('/validate',
  cors(),
  body('uuid').notEmpty().withMessage('UUID is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = uuidController.validateUUID(req.body.uuid);
      sendJSON(res, formatSuccess({
        uuid: req.body.uuid,
        valid: result.valid,
        version: result.version,
        format: result.format
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Validate UUID via GET
 */
uuidRoute.get('/validate/:uuid',
  cors(),
  param('uuid').notEmpty().withMessage('UUID is required'),
  validateRequest,
  (req, res) => {
    try {
      const result = uuidController.validateUUID(req.params.uuid);
      sendJSON(res, formatSuccess({
        uuid: req.params.uuid,
        valid: result.valid,
        version: result.version,
        format: result.format
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Help endpoint
 */
uuidRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'UUID Generator',
    message: 'Generate and validate universally unique identifiers',
    endpoints: {
      generate: {
        simple: `GET ${host}/api/v1/tools/uuid/v4`,
        simpleText: `GET ${host}/api/v1/tools/uuid/v4/text`,
        custom: `POST ${host}/api/v1/tools/uuid/generate`,
        customText: `POST ${host}/api/v1/tools/uuid/generate/text`,
        multiple: `GET ${host}/api/v1/tools/uuid/generate/:count`,
        multipleText: `GET ${host}/api/v1/tools/uuid/generate/:count/text`
      },
      validate: {
        post: `POST ${host}/api/v1/tools/uuid/validate`,
        get: `GET ${host}/api/v1/tools/uuid/validate/:uuid`
      }
    },
    parameters: {
      count: 'Number of UUIDs to generate (1-100)',
      uuid: 'UUID to validate',
      uppercase: 'Return UUID in uppercase (boolean)',
      version: 'UUID version (currently only v4 supported)'
    },
    examples: {
      simple: `GET ${host}/api/v1/tools/uuid/v4`,
      simpleText: `GET ${host}/api/v1/tools/uuid/v4/text`,
      multiple: `GET ${host}/api/v1/tools/uuid/generate/5`,
      custom: `POST ${host}/api/v1/tools/uuid/generate {"uppercase": true, "count": 3}`,
      validate: `GET ${host}/api/v1/tools/uuid/validate/550e8400-e29b-41d4-a716-446655440000`
    }
  });
  
  sendJSON(res, data);
});

module.exports = uuidRoute;