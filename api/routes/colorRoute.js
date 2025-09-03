const express = require('express'); const { Request, Response } = require('express');
const { body, param, validationResult } = require('express-validator');
const cors = require('cors');
const { setStandardHeaders } = require('../utils/standardHeaders');
const colorController = require('../controllers/color');
const { formatValidationErrors } = require('../utils/validationHelper');

const colorRoute = express.Router();

colorRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const helpData = {
    title: 'Color Converter',
    message: 'Convert colors between different formats',
    endpoints: {
      convert: `${host}/api/v1/color/convert`,
      simple: `${host}/api/v1/color/:from/:to/:color`
    },
    formats: {
      hex: 'Hexadecimal (#FF0000)',
      rgb: 'RGB (rgb(255, 0, 0))',
      hsl: 'HSL (hsl(0, 100%, 50%))'
    },
    examples: {
      hex_to_rgb: `GET ${host}/api/v1/color/hex/rgb/%23FF0000`,
      rgb_to_hsl: `POST ${host}/api/v1/color/convert with {"color": "rgb(255, 0, 0)", "from": "rgb", "to": "hsl"}`,
      hsl_to_hex: `POST ${host}/api/v1/color/convert with {"color": "hsl(120, 100%, 50%)", "from": "hsl", "to": "hex"}`
    }
  };
  setStandardHeaders(res, helpData);
  res.json(helpData);
});

colorRoute.get('/:from/:to/:color',
  cors(),
  param('from').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid source format'),
  param('to').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid target format'),
  param('color').notEmpty().withMessage('Color is required'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    try {
      const color = decodeURIComponent(req.params.color);
      const result = colorController.convertColor(color, req.params.from, req.params.to);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
);

colorRoute.post('/convert',
  cors(),
  body('color').notEmpty().withMessage('Color is required'),
  body('from').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid source format'),
  body('to').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid target format'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: formatValidationErrors(errors.array())
      });
    }

    try {
      const result = colorController.convertColor(
        req.body.color,
        req.body.from,
        req.body.to
      );
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }
);

module.exports = colorRoute;