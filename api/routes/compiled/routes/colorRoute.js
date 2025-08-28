"use strict";
exports.__esModule = true;
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var cors_1 = require("cors");
var colorController = require("../controllers/color");
var validationHelper_1 = require("../utils/validationHelper");
var colorRoute = express_1["default"].Router();
colorRoute.get(['/', '/help'], (0, cors_1["default"])(), function (req, res) {
    var host = "".concat(req.protocol, "://").concat(req.headers.host);
    res.json({
        title: 'Color Converter',
        message: 'Convert colors between different formats',
        endpoints: {
            convert: "".concat(host, "/api/v1/color/convert"),
            simple: "".concat(host, "/api/v1/color/:from/:to/:color")
        },
        formats: {
            hex: 'Hexadecimal (#FF0000)',
            rgb: 'RGB (rgb(255, 0, 0))',
            hsl: 'HSL (hsl(0, 100%, 50%))'
        },
        examples: {
            hex_to_rgb: "GET ".concat(host, "/api/v1/color/hex/rgb/%23FF0000"),
            rgb_to_hsl: "POST ".concat(host, "/api/v1/color/convert with {\"color\": \"rgb(255, 0, 0)\", \"from\": \"rgb\", \"to\": \"hsl\"}"),
            hsl_to_hex: "POST ".concat(host, "/api/v1/color/convert with {\"color\": \"hsl(120, 100%, 50%)\", \"from\": \"hsl\", \"to\": \"hex\"}")
        }
    });
});
colorRoute.get('/:from/:to/:color', (0, cors_1["default"])(), (0, express_validator_1.param)('from').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid source format'), (0, express_validator_1.param)('to').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid target format'), (0, express_validator_1.param)('color').notEmpty().withMessage('Color is required'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    try {
        var color = decodeURIComponent(req.params.color);
        var result = colorController.convertColor(color, req.params.from, req.params.to);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred'
        });
    }
});
colorRoute.post('/convert', (0, cors_1["default"])(), (0, express_validator_1.body)('color').notEmpty().withMessage('Color is required'), (0, express_validator_1.body)('from').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid source format'), (0, express_validator_1.body)('to').isIn(['hex', 'rgb', 'hsl']).withMessage('Invalid target format'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    try {
        var result = colorController.convertColor(req.body.color, req.body.from, req.body.to);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred'
        });
    }
});
exports["default"] = colorRoute;
