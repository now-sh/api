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
var loremController = require("../controllers/lorem");
var validationHelper_1 = require("../utils/validationHelper");
var loremRoute = express_1["default"].Router();
loremRoute.get(['/', '/help'], (0, cors_1["default"])(), function (req, res) {
    var host = "".concat(req.protocol, "://").concat(req.headers.host);
    res.json({
        title: 'Lorem Ipsum Generator',
        message: 'Generate placeholder text',
        endpoints: {
            sentences: "".concat(host, "/api/v1/lorem/sentences/:number"),
            paragraphs: "".concat(host, "/api/v1/lorem/paragraphs/:paragraphs/:sentences"),
            json: 'Add /json to any endpoint for JSON format'
        },
        examples: {
            sentences: "GET ".concat(host, "/api/v1/lorem/sentences/4"),
            sentences_json: "GET ".concat(host, "/api/v1/lorem/sentences/4/json"),
            paragraphs: "GET ".concat(host, "/api/v1/lorem/paragraphs/3/5"),
            paragraphs_json: "GET ".concat(host, "/api/v1/lorem/paragraphs/3/5/json")
        }
    });
});
loremRoute.get('/sentences/:number', (0, cors_1["default"])(), (0, express_validator_1.param)('number').isInt({ min: 1, max: 50 }).withMessage('Number must be between 1 and 50'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    var numberOfSentences = parseInt(req.params.number);
    var result = loremController.generateSentences(numberOfSentences);
    res.json(__assign(__assign({}, result), { format: 'plain' }));
});
loremRoute.get('/sentences/:number/json', (0, cors_1["default"])(), (0, express_validator_1.param)('number').isInt({ min: 1, max: 50 }).withMessage('Number must be between 1 and 50'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    var numberOfSentences = parseInt(req.params.number);
    var result = loremController.generateSentences(numberOfSentences);
    res.json(__assign(__assign({}, result), { format: 'json' }));
});
loremRoute.get('/paragraphs/:paragraphs/:sentences', (0, cors_1["default"])(), (0, express_validator_1.param)('paragraphs').isInt({ min: 1, max: 20 }).withMessage('Paragraphs must be between 1 and 20'), (0, express_validator_1.param)('sentences').isInt({ min: 1, max: 10 }).withMessage('Sentences must be between 1 and 10'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    var numberOfParagraphs = parseInt(req.params.paragraphs);
    var sentencesPerParagraph = parseInt(req.params.sentences);
    var result = loremController.generateParagraphs(numberOfParagraphs, sentencesPerParagraph);
    res.json(__assign(__assign({}, result), { format: 'plain' }));
});
loremRoute.get('/paragraphs/:paragraphs/:sentences/json', (0, cors_1["default"])(), (0, express_validator_1.param)('paragraphs').isInt({ min: 1, max: 20 }).withMessage('Paragraphs must be between 1 and 20'), (0, express_validator_1.param)('sentences').isInt({ min: 1, max: 10 }).withMessage('Sentences must be between 1 and 10'), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    var numberOfParagraphs = parseInt(req.params.paragraphs);
    var sentencesPerParagraph = parseInt(req.params.sentences);
    var result = loremController.generateParagraphs(numberOfParagraphs, sentencesPerParagraph);
    res.json(__assign(__assign({}, result), { format: 'json' }));
});
loremRoute.post('/generate', (0, cors_1["default"])(), (0, express_validator_1.body)('sentences').optional().isInt({ min: 1, max: 50 }), (0, express_validator_1.body)('paragraphs').optional().isInt({ min: 1, max: 20 }), (0, express_validator_1.body)('sentencesPerParagraph').optional().isInt({ min: 1, max: 10 }), function (req, res) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
        });
    }
    var _a = req.body, sentences = _a.sentences, paragraphs = _a.paragraphs, _b = _a.sentencesPerParagraph, sentencesPerParagraph = _b === void 0 ? 5 : _b;
    if (!sentences && !paragraphs) {
        return res.status(400).json({
            success: false,
            error: 'Specify either sentences or paragraphs'
        });
    }
    if (sentences && paragraphs) {
        return res.status(400).json({
            success: false,
            error: 'Specify only one of sentences or paragraphs'
        });
    }
    try {
        var result = loremController.generateCustom({ sentences: sentences, paragraphs: paragraphs, sentencesPerParagraph: sentencesPerParagraph });
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
exports["default"] = loremRoute;
