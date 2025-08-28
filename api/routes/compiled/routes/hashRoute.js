"use strict";
exports.__esModule = true;
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var cors_1 = require("cors");
var hashController = require("../controllers/hash");
var validationHelper_1 = require("../utils/validationHelper");
var hashRoute = express_1["default"].Router();
hashRoute.get(['/', '/help'], (0, cors_1["default"])(), function (req, res) {
    var host = "".concat(req.protocol, "://").concat(req.headers.host);
    res.json({
        title: 'Hash Utility',
        message: 'Generate hashes using various algorithms',
        endpoints: {
            hash_text: "".concat(host, "/api/v1/hash/:algorithm"),
            algorithms: hashController.getSupportedAlgorithms()
        },
        examples: {
            sha256: "POST ".concat(host, "/api/v1/hash/sha256 with {\"text\": \"Hello World\"}"),
            md5: "POST ".concat(host, "/api/v1/hash/md5 with {\"text\": \"password123\"}")
        }
    });
});
hashRoute.post('/:algorithm', (0, cors_1["default"])(), (0, express_validator_1.param)('algorithm').isIn(hashController.getSupportedAlgorithms()).withMessage('Invalid algorithm'), (0, express_validator_1.body)('text').notEmpty().withMessage('Text is required'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    try {
        var result = hashController.hashText(req.body.text, req.params.algorithm);
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
exports["default"] = hashRoute;
