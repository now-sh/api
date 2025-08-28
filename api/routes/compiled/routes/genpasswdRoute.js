"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var cors_1 = require("cors");
var passwordController = require("../controllers/password");
var validationHelper_1 = require("../utils/validationHelper");
var genpasswdRoute = express_1["default"].Router();
genpasswdRoute.get(['/', '/help'], (0, cors_1["default"])(), function (req, res) {
    var host = "".concat(req.protocol, "://").concat(req.headers.host);
    res.json({
        title: 'Password Generator',
        message: 'Generate secure passwords with customizable options',
        endpoints: {
            simple: "".concat(host, "/api/v1/passwd/:length"),
            custom: "".concat(host, "/api/v1/passwd/generate")
        },
        options: {
            length: '4-128 characters',
            numbers: 'Include numbers',
            symbols: 'Include symbols',
            uppercase: 'Include uppercase letters',
            lowercase: 'Include lowercase letters',
            excludeSimilar: 'Exclude similar characters (ilLI1oO0)',
            exclude: 'Custom characters to exclude'
        },
        examples: {
            simple: "GET ".concat(host, "/api/v1/passwd/20"),
            custom: "POST ".concat(host, "/api/v1/passwd/generate with options")
        }
    });
});
genpasswdRoute.get('/:length', (0, cors_1["default"])(), (0, express_validator_1.param)('length').isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    try {
        var result = passwordController.generatePassword({
            length: parseInt(req.params.length)
        });
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
genpasswdRoute.post('/generate', (0, cors_1["default"])(), (0, express_validator_1.body)('length').optional().isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'), (0, express_validator_1.body)('numbers').optional().isBoolean().withMessage('numbers must be boolean'), (0, express_validator_1.body)('symbols').optional().isBoolean().withMessage('symbols must be boolean'), (0, express_validator_1.body)('uppercase').optional().isBoolean().withMessage('uppercase must be boolean'), (0, express_validator_1.body)('lowercase').optional().isBoolean().withMessage('lowercase must be boolean'), (0, express_validator_1.body)('excludeSimilar').optional().isBoolean().withMessage('excludeSimilar must be boolean'), (0, express_validator_1.body)('exclude').optional().isString().withMessage('exclude must be string'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    try {
        var result = passwordController.generatePassword(req.body);
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
// Backward compatibility
genpasswdRoute.post('/', (0, cors_1["default"])(), (0, express_validator_1.body)('length').optional().isInt({ min: 4, max: 128 }).withMessage('Length must be between 4 and 128'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    try {
        var length_1 = parseInt(req.body.length) || 16;
        var result = passwordController.generatePassword({ length: length_1 });
        res.json(__assign({ title: 'Generate Passwords', password: result.password, passwordLength: length_1 }, result));
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred'
        });
    }
});
exports["default"] = genpasswdRoute;
