const express = require('express');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const colorController = require('../controllers/color');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const colorRoute = express.Router();

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
 * Convert color via GET - JSON response
 */
colorRoute.get('/:from/:to/:color',
  cors(),
  param('from').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid source format'),
  param('to').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid target format'),
  param('color').notEmpty().withMessage('Color is required'),
  validateRequest,
  (req, res) => {
    try {
      const color = decodeURIComponent(req.params.color);
      const result = colorController.convertColor(color, req.params.from, req.params.to);
      sendJSON(res, formatSuccess({
        original: color,
        from: req.params.from,
        to: req.params.to,
        converted: result.converted,
        rgb: result.rgb,
        hex: result.hex,
        hsl: result.hsl
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Convert color via GET - Text response
 */
colorRoute.get('/:from/:to/:color/text',
  cors(),
  param('from').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid source format'),
  param('to').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid target format'),
  param('color').notEmpty().withMessage('Color is required'),
  validateRequest,
  (req, res) => {
    try {
      const color = decodeURIComponent(req.params.color);
      const result = colorController.convertColor(color, req.params.from, req.params.to);
      sendText(res, result.converted);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Convert color via POST - JSON response
 */
colorRoute.post('/convert',
  cors(),
  body('color').notEmpty().withMessage('Color is required'),
  body('from').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid source format'),
  body('to').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid target format'),
  validateRequest,
  (req, res) => {
    try {
      const result = colorController.convertColor(
        req.body.color,
        req.body.from,
        req.body.to
      );
      sendJSON(res, formatSuccess({
        original: req.body.color,
        from: req.body.from,
        to: req.body.to,
        converted: result.converted,
        rgb: result.rgb,
        hex: result.hex,
        hsl: result.hsl
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Convert color via POST - Text response
 */
colorRoute.post('/convert/text',
  cors(),
  body('color').notEmpty().withMessage('Color is required'),
  body('from').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid source format'),
  body('to').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid target format'),
  validateRequest,
  (req, res) => {
    try {
      const result = colorController.convertColor(
        req.body.color,
        req.body.from,
        req.body.to
      );
      sendText(res, result.converted);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Generate color palette - JSON response
 */
colorRoute.post('/palette',
  cors(),
  body('color').notEmpty().withMessage('Base color is required'),
  body('type').optional().isIn(['monochromatic', 'analogous', 'complementary', 'triadic', 'tetradic']).withMessage('Invalid palette type'),
  body('count').optional().isInt({ min: 2, max: 20 }).withMessage('Count must be between 2 and 20'),
  validateRequest,
  (req, res) => {
    try {
      const result = colorController.generatePalette(
        req.body.color,
        req.body.type || 'monochromatic',
        parseInt(req.body.count) || 5
      );
      sendJSON(res, formatSuccess({
        baseColor: req.body.color,
        paletteType: req.body.type || 'monochromatic',
        count: result.colors.length,
        colors: result.colors
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Get color information
 */
colorRoute.get('/info/:color',
  cors(),
  param('color').notEmpty().withMessage('Color is required'),
  validateRequest,
  (req, res) => {
    try {
      const color = decodeURIComponent(req.params.color);
      const result = colorController.getColorInfo(color);
      sendJSON(res, formatSuccess({
        original: color,
        hex: result.hex,
        rgb: result.rgb,
        hsl: result.hsl,
        brightness: result.brightness,
        luminance: result.luminance,
        isLight: result.isLight,
        isDark: result.isDark
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Help endpoint
 */
colorRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'Color Converter',
    message: 'Convert colors between formats and generate palettes',
    endpoints: {
      convert: {
        post: `POST ${host}/api/v1/tools/color/convert`,
        postText: `POST ${host}/api/v1/tools/color/convert/text`,
        get: `GET ${host}/api/v1/tools/color/:from/:to/:color`,
        getText: `GET ${host}/api/v1/tools/color/:from/:to/:color/text`
      },
      palette: `POST ${host}/api/v1/tools/color/palette`,
      info: `GET ${host}/api/v1/tools/color/info/:color`
    },
    formats: {
      hex: 'Hexadecimal (#FF0000)',
      rgb: 'RGB (rgb(255, 0, 0))',
      hsl: 'HSL (hsl(0, 100%, 50%))'
    },
    paletteTypes: {
      monochromatic: 'Different shades of the same color',
      analogous: 'Adjacent colors on color wheel',
      complementary: 'Opposite colors on color wheel',
      triadic: 'Three evenly spaced colors',
      tetradic: 'Four colors forming rectangle'
    },
    parameters: {
      color: 'Color value in any supported format',
      from: 'Source format (hex, rgb, hsl)',
      to: 'Target format (hex, rgb, hsl)',
      type: 'Palette type for generation',
      count: 'Number of colors in palette (2-20)'
    },
    examples: {
      convertGet: `GET ${host}/api/v1/tools/color/hex/rgb/%23FF0000`,
      convertGetText: `GET ${host}/api/v1/tools/color/hex/rgb/%23FF0000/text`,
      convertPost: `POST ${host}/api/v1/tools/color/convert {"color": "rgb(255, 0, 0)", "from": "rgb", "to": "hsl"}`,
      palette: `POST ${host}/api/v1/tools/color/palette {"color": "#FF0000", "type": "complementary", "count": 5}`,
      info: `GET ${host}/api/v1/tools/color/info/%23FF0000`
    }
  });
  
  sendJSON(res, data);
});

module.exports = colorRoute;