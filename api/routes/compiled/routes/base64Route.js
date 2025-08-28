"use strict";
exports.__esModule = true;
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var cors_1 = require("cors");
var base64Controller = require("../controllers/base64");
var validationHelper_1 = require("../utils/validationHelper");
var base64Route = express_1["default"].Router();
base64Route.get(['/', '/help'], (0, cors_1["default"])(), function (req, res) {
    var host = "".concat(req.protocol, "://").concat(req.headers.host);
    res.json({
        title: 'Base64 Encode/Decode Utility',
        endpoints: {
            encode: "".concat(host, "/api/v1/base64/encode"),
            decode: "".concat(host, "/api/v1/base64/decode")
        },
        cli_examples: {
            encode: "curl -X POST ".concat(host, "/api/v1/base64/encode -d \"text=Hello World\""),
            decode: "curl -X POST ".concat(host, "/api/v1/base64/decode -d \"text=SGVsbG8gV29ybGQ=\""),
            encode_file: "curl -X POST ".concat(host, "/api/v1/base64/encode -d \"text=$(cat file.txt)\""),
            pipe: "echo \"Hello\" | curl -X POST ".concat(host, "/api/v1/base64/encode -d @-")
        }
    });
});
base64Route.post('/encode', (0, cors_1["default"])(), (0, express_validator_1.body)('text').notEmpty().withMessage('Text is required'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    try {
        var result = base64Controller.encode(req.body.text);
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
base64Route.post('/decode', (0, cors_1["default"])(), (0, express_validator_1.body)('text').notEmpty().withMessage('Base64 text is required'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    try {
        var result = base64Controller.decode(req.body.text);
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
// GET method alternatives for simple encoding
base64Route.get('/encode/:text', (0, cors_1["default"])(), function (req, res) {
    try {
        var text = decodeURIComponent(req.params.text);
        var result = base64Controller.encode(text);
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
base64Route.get('/decode/:text', (0, cors_1["default"])(), function (req, res) {
    try {
        var result = base64Controller.decode(req.params.text);
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
exports["default"] = base64Route;
