"use strict";
exports.__esModule = true;
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var cors_1 = require("cors");
var uuidController = require("../controllers/uuid");
var validationHelper_1 = require("../utils/validationHelper");
var uuidRoute = express_1["default"].Router();
uuidRoute.get(['/', '/help'], (0, cors_1["default"])(), function (req, res) {
    var host = "".concat(req.protocol, "://").concat(req.headers.host);
    res.json({
        title: 'UUID Generator',
        message: 'Generate universally unique identifiers',
        endpoints: {
            generate: "".concat(host, "/api/v1/uuid/generate"),
            generate_simple: "".concat(host, "/api/v1/uuid/v4")
        },
        examples: {
            simple: "GET ".concat(host, "/api/v1/uuid/v4"),
            customized: "POST ".concat(host, "/api/v1/uuid/generate with {\"uppercase\": true}")
        }
    });
});
uuidRoute.get('/v4', (0, cors_1["default"])(), function (req, res) {
    try {
        var result = uuidController.generateUUID();
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred'
        });
    }
});
uuidRoute.post('/generate', (0, cors_1["default"])(), (0, express_validator_1.body)('uppercase').optional().isBoolean().withMessage('uppercase must be boolean'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    try {
        var options = {
            uppercase: req.body.uppercase || false
        };
        var result = uuidController.generateUUID(options);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred'
        });
    }
});
exports["default"] = uuidRoute;
