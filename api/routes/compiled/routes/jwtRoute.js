"use strict";
exports.__esModule = true;
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var cors_1 = require("cors");
var jwtController = require("../controllers/jwt");
var validationHelper_1 = require("../utils/validationHelper");
var jwtRoute = express_1["default"].Router();
jwtRoute.get(['/', '/help'], (0, cors_1["default"])(), function (req, res) {
    var host = "".concat(req.protocol, "://").concat(req.headers.host);
    res.json({
        title: 'JWT Decoder & Validator',
        message: 'Decode and validate JSON Web Tokens',
        endpoints: {
            decode: "".concat(host, "/api/v1/jwt/decode"),
            validate: "".concat(host, "/api/v1/jwt/validate")
        },
        features: [
            'Decode JWT header and payload',
            'Check token expiration',
            'Validate signature with secret',
            'Display claims and metadata'
        ],
        examples: {
            decode: "POST ".concat(host, "/api/v1/jwt/decode with {\"token\": \"eyJ...\"}"),
            validate: "POST ".concat(host, "/api/v1/jwt/validate with {\"token\": \"eyJ...\", \"secret\": \"your-secret\"}")
        }
    });
});
jwtRoute.post('/decode', (0, cors_1["default"])(), (0, express_validator_1.body)('token').notEmpty().withMessage('JWT token is required'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    try {
        var result = jwtController.decodeJWT(req.body.token);
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
jwtRoute.post('/validate', (0, cors_1["default"])(), (0, express_validator_1.body)('token').notEmpty().withMessage('JWT token is required'), (0, express_validator_1.body)('secret').notEmpty().withMessage('Secret is required for validation'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    try {
        var result = jwtController.decodeJWT(req.body.token, {
            secret: req.body.secret
        });
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
exports["default"] = jwtRoute;
