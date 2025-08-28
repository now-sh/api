"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var cors_1 = require("cors");
var urlController = require("../controllers/url");
var authController = require("../controllers/auth");
var optionalAuth_1 = require("../middleware/optionalAuth");
var checkAuth_1 = require("../middleware/checkAuth");
var rateLimiter_1 = require("../middleware/rateLimiter");
var validationHelper_1 = require("../utils/validationHelper");
var urlRoute = express_1["default"].Router();
urlRoute.get(['/', '/help'], (0, cors_1["default"])(), function (req, res) {
    var host = "".concat(req.protocol, "://").concat(req.headers.host);
    res.json({
        title: 'URL Shortener',
        message: 'Create and manage short URLs',
        endpoints: {
            shorten: "".concat(host, "/api/v1/url/shorten"),
            redirect: "".concat(host, "/s/:code"),
            stats: "".concat(host, "/api/v1/url/stats/:code"),
            list: "".concat(host, "/api/v1/url/list")
        },
        features: {
            anonymous: 'Create short URLs without authentication',
            authenticated: 'Track and manage your URLs',
            custom_alias: 'Create custom short codes',
            expiration: 'Set expiration time',
            statistics: 'View click statistics'
        },
        examples: {
            simple: "POST ".concat(host, "/api/v1/url/shorten with {\"url\": \"https://example.com\"}"),
            custom: "POST ".concat(host, "/api/v1/url/shorten with {\"url\": \"https://example.com\", \"customAlias\": \"mylink\"}"),
            expiring: "POST ".concat(host, "/api/v1/url/shorten with {\"url\": \"https://example.com\", \"expiresIn\": 86400000}")
        }
    });
});
urlRoute.post('/shorten', (0, cors_1["default"])(), optionalAuth_1["default"], rateLimiter_1.authLimiter, (0, express_validator_1.body)('url').isURL().withMessage('Valid URL is required'), (0, express_validator_1.body)('customAlias').optional().matches(/^[a-zA-Z0-9-_]+$/).isLength({ min: 3, max: 50 })
    .withMessage('Custom alias must be 3-50 characters and contain only letters, numbers, hyphens, and underscores'), (0, express_validator_1.body)('expiresIn').optional().isInt({ min: 60000, max: 31536000000 })
    .withMessage('Expiration must be between 1 minute and 1 year'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var errors, host, userId, _a, options, result, error_1, statusCode;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
                        })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                host = "".concat(req.protocol, "://").concat(req.headers.host);
                if (!(req.isAuthenticated && req.user)) return [3 /*break*/, 3];
                return [4 /*yield*/, authController.getUserId(req.user)["catch"](function () { return null; })];
            case 2:
                _a = _b.sent();
                return [3 /*break*/, 4];
            case 3:
                _a = null;
                _b.label = 4;
            case 4:
                userId = _a;
                options = {
                    baseUrl: host,
                    userId: userId,
                    customAlias: req.body.customAlias,
                    expiresIn: req.body.expiresIn
                };
                return [4 /*yield*/, urlController.createShortUrl(req.body.url, options)];
            case 5:
                result = _b.sent();
                res.status(201).json({
                    success: true,
                    data: result
                });
                return [3 /*break*/, 7];
            case 6:
                error_1 = _b.sent();
                statusCode = error_1 instanceof Error && error_1.message.includes('already taken') ? 409 :
                    error_1 instanceof Error && error_1.message.includes('Invalid') ? 400 : 500;
                res.status(statusCode).json({
                    success: false,
                    error: error_1 instanceof Error ? error_1.message : 'An error occurred'
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
urlRoute.get('/stats/:code', (0, cors_1["default"])(), optionalAuth_1["default"], (0, express_validator_1.param)('code').notEmpty().withMessage('Code is required'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var errors, userId, _a, stats, error_2, statusCode;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
                        })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                if (!(req.isAuthenticated && req.user)) return [3 /*break*/, 3];
                return [4 /*yield*/, authController.getUserId(req.user)["catch"](function () { return null; })];
            case 2:
                _a = _b.sent();
                return [3 /*break*/, 4];
            case 3:
                _a = null;
                _b.label = 4;
            case 4:
                userId = _a;
                return [4 /*yield*/, urlController.getUrlStats(req.params.code, userId)];
            case 5:
                stats = _b.sent();
                res.json({
                    success: true,
                    data: stats
                });
                return [3 /*break*/, 7];
            case 6:
                error_2 = _b.sent();
                statusCode = error_2 instanceof Error && error_2.message.includes('not found') ? 404 :
                    error_2 instanceof Error && error_2.message.includes('access') ? 403 : 500;
                res.status(statusCode).json({
                    success: false,
                    error: error_2 instanceof Error ? error_2.message : 'An error occurred'
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
urlRoute.get('/list', (0, cors_1["default"])(), checkAuth_1["default"], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, urls, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, authController.getUserId(req.user)];
            case 1:
                userId = _a.sent();
                return [4 /*yield*/, urlController.getUserUrls(userId)];
            case 2:
                urls = _a.sent();
                res.json({
                    success: true,
                    data: urls
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                res.status(500).json({
                    success: false,
                    error: error_3 instanceof Error ? error_3.message : 'An error occurred'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Redirect endpoint (separate from API routes)
urlRoute.get('/redirect/:code', (0, cors_1["default"])(), (0, express_validator_1.param)('code').notEmpty().withMessage('Code is required'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var errors, url, error_4, statusCode;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            errors: (0, validationHelper_1.formatValidationErrors)(errors.array())
                        })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, urlController.getUrlByCode(req.params.code)];
            case 2:
                url = _a.sent();
                // For API endpoint, return the URL instead of redirecting
                res.json({
                    success: true,
                    data: {
                        originalUrl: url.originalUrl,
                        clicks: url.clicks
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                statusCode = error_4 instanceof Error && error_4.message.includes('not found') ? 404 :
                    error_4 instanceof Error && error_4.message.includes('expired') ? 410 : 500;
                res.status(statusCode).json({
                    success: false,
                    error: error_4 instanceof Error ? error_4.message : 'An error occurred'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports["default"] = urlRoute;
