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
// Middleware
var checkAuth_1 = require("../middleware/checkAuth");
var rateLimiter_1 = require("../middleware/rateLimiter");
// Controller
var authController = require("../controllers/auth");
var validationHelper_1 = require("../utils/validationHelper");
var authRoute = express_1["default"].Router();
authRoute.get(['/', '/help'], (0, cors_1["default"])(), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var host;
    return __generator(this, function (_a) {
        host = "".concat(req.protocol, "://").concat(req.headers.host);
        res.setHeader('Content-Type', 'application/json');
        try {
            res.json({
                title: 'Authentication API',
                message: "The current api endpoint is ".concat(host, "/api/v1/auth"),
                endpoints: {
                    info: "".concat(host, "/api/v1/auth/me"),
                    login: "".concat(host, "/api/v1/auth/login"),
                    signup: "".concat(host, "/api/v1/auth/signup"),
                    update: "".concat(host, "/api/v1/auth/update"),
                    rotate: "".concat(host, "/api/v1/auth/rotate"),
                    tokens: "".concat(host, "/api/v1/auth/tokens"),
                    revoke: "".concat(host, "/api/v1/auth/revoke"),
                    revokeAll: "".concat(host, "/api/v1/auth/revoke-all"),
                    demo: "".concat(host, "/api/v1/auth/demo")
                },
                examples: {
                    login_body: '{ "email": "yourEmail", "password": "yourPassword" }',
                    signup_body: '{ "name": "yourName", "email": "yourEmail", "password": "yourPassword" }',
                    auth_header: 'Authorization: Bearer YOUR_TOKEN',
                    curl_examples: {
                        signup: "curl -X POST ".concat(host, "/api/v1/auth/signup -H \"Content-Type: application/json\" -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"test123\"}'"),
                        login: "curl -X POST ".concat(host, "/api/v1/auth/login -H \"Content-Type: application/json\" -d '{\"email\":\"test@example.com\",\"password\":\"test123\"}'"),
                        me: "curl ".concat(host, "/api/v1/auth/me -H \"Authorization: Bearer YOUR_TOKEN\"")
                    }
                },
                token_info: {
                    how_to_get: 'Login or signup to receive a JWT token',
                    usage: 'Include token in Authorization header as "Bearer YOUR_TOKEN"',
                    expiry: 'Never expires',
                    format: 'JWT (JSON Web Token)'
                }
            });
        }
        catch (err) {
            res.status(500).json({ error: err instanceof Error ? err.message : 'An error occurred' });
        }
        return [2 /*return*/];
    });
}); });
authRoute.get('/me', (0, cors_1["default"])(), checkAuth_1["default"], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.user) {
                    throw new Error('User not authenticated');
                }
                return [4 /*yield*/, authController.getUser(req.user)];
            case 1:
                user = _a.sent();
                res.json({
                    success: true,
                    errors: [],
                    data: { user: user }
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(404).json({
                    success: false,
                    error: error_1 instanceof Error ? error_1.message : 'An error occurred'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
authRoute.post('/signup', (0, cors_1["default"])(), rateLimiter_1.authLimiter, (0, express_validator_1.body)('email').isEmail().withMessage('The email is invalid'), (0, express_validator_1.body)('password').isLength({ min: 5 }).withMessage('The password must be at least 5 characters'), (0, express_validator_1.body)('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var validationErrors, _a, email, password, name, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                validationErrors = (0, express_validator_1.validationResult)(req);
                if (!validationErrors.isEmpty()) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            errors: (0, validationHelper_1.formatValidationErrors)(validationErrors.array()),
                            data: null
                        })];
                }
                _a = req.body, email = _a.email, password = _a.password, name = _a.name;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, authController.signup(email, password, name)];
            case 2:
                result = _b.sent();
                res.json({
                    success: true,
                    errors: [],
                    data: result
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                res.status(400).json({
                    success: false,
                    errors: [{
                            msg: error_2 instanceof Error ? error_2.message : 'An error occurred'
                        }],
                    data: null
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
authRoute.post('/login', (0, cors_1["default"])(), rateLimiter_1.authLimiter, (0, express_validator_1.body)('email').isEmail().withMessage('The email is invalid'), (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var validationErrors, _a, email, password, result, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                validationErrors = (0, express_validator_1.validationResult)(req);
                if (!validationErrors.isEmpty()) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            errors: (0, validationHelper_1.formatValidationErrors)(validationErrors.array()),
                            data: null
                        })];
                }
                _a = req.body, email = _a.email, password = _a.password;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, authController.login(email, password)];
            case 2:
                result = _b.sent();
                res.json({
                    success: true,
                    errors: [],
                    data: result
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                res.status(401).json({
                    success: false,
                    errors: [{
                            msg: error_3 instanceof Error ? error_3.message : 'An error occurred'
                        }],
                    data: null
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
authRoute.put('/update', (0, cors_1["default"])(), checkAuth_1["default"], (0, express_validator_1.body)('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'), (0, express_validator_1.body)('password').optional().isLength({ min: 5 }).withMessage('Password must be at least 5 characters'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var validationErrors, user, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validationErrors = (0, express_validator_1.validationResult)(req);
                if (!validationErrors.isEmpty()) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            errors: (0, validationHelper_1.formatValidationErrors)(validationErrors.array())
                        })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                if (!req.user) {
                    throw new Error('User not authenticated');
                }
                return [4 /*yield*/, authController.updateProfile(req.user, req.body)];
            case 2:
                user = _a.sent();
                res.json({
                    success: true,
                    data: { user: user }
                });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                res.status(400).json({
                    success: false,
                    error: error_4 instanceof Error ? error_4.message : 'An error occurred'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Token rotation endpoint
authRoute.post('/rotate', (0, cors_1["default"])(), checkAuth_1["default"], (0, express_validator_1.body)('revokeOld').optional().isBoolean().withMessage('revokeOld must be boolean'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var validationErrors, authHeader, oldToken, revokeOld, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validationErrors = (0, express_validator_1.validationResult)(req);
                if (!validationErrors.isEmpty()) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            errors: (0, validationHelper_1.formatValidationErrors)(validationErrors.array())
                        })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    throw new Error('No token provided');
                }
                oldToken = authHeader.substring(7);
                revokeOld = req.body.revokeOld !== false;
                return [4 /*yield*/, authController.rotateToken(oldToken, revokeOld)];
            case 2:
                result = _a.sent();
                res.json({
                    success: true,
                    data: __assign(__assign({}, result), { revokedOldToken: revokeOld })
                });
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                res.status(400).json({
                    success: false,
                    error: error_5 instanceof Error ? error_5.message : 'An error occurred'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Get user's active tokens
authRoute.get('/tokens', (0, cors_1["default"])(), checkAuth_1["default"], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tokens, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.user) {
                    throw new Error('User not authenticated');
                }
                return [4 /*yield*/, authController.getUserTokens(req.user)];
            case 1:
                tokens = _a.sent();
                res.json({
                    success: true,
                    data: {
                        tokens: tokens,
                        count: tokens.length
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                res.status(400).json({
                    success: false,
                    error: error_6 instanceof Error ? error_6.message : 'An error occurred'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Revoke specific token
authRoute.post('/revoke', (0, cors_1["default"])(), checkAuth_1["default"], (0, express_validator_1.body)('token').optional().isString().withMessage('Token must be string'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tokenToRevoke, error_7;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                tokenToRevoke = req.body.token || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.substring(7));
                if (!tokenToRevoke) {
                    throw new Error('No token to revoke');
                }
                return [4 /*yield*/, authController.revokeToken(tokenToRevoke)];
            case 1:
                _b.sent();
                res.json({
                    success: true,
                    message: 'Token revoked successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _b.sent();
                res.status(400).json({
                    success: false,
                    error: error_7 instanceof Error ? error_7.message : 'An error occurred'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Revoke all user tokens
authRoute.post('/revoke-all', (0, cors_1["default"])(), checkAuth_1["default"], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var count, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.user) {
                    throw new Error('User not authenticated');
                }
                return [4 /*yield*/, authController.revokeAllUserTokens(req.user)];
            case 1:
                count = _a.sent();
                res.json({
                    success: true,
                    message: "Revoked ".concat(count, " tokens")
                });
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                res.status(400).json({
                    success: false,
                    error: error_8 instanceof Error ? error_8.message : 'An error occurred'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Demo endpoint to show how token generation works
authRoute.get('/demo', (0, cors_1["default"])(), function (req, res) {
    var host = "".concat(req.protocol, "://").concat(req.headers.host);
    res.json({
        title: 'Authentication Demo',
        message: 'This shows how to create, use, and rotate tokens',
        steps: [
            {
                step: 1,
                action: 'Create Account',
                endpoint: 'POST /api/v1/auth/signup',
                body: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'securepassword123'
                },
                response: {
                    success: true,
                    data: {
                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        user: {
                            id: '507f1f77bcf86cd799439011',
                            email: 'john@example.com',
                            name: 'John Doe'
                        }
                    }
                }
            },
            {
                step: 2,
                action: 'Use Token',
                description: 'Include the token in Authorization header for authenticated requests',
                example: {
                    header: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    endpoints: [
                        'GET /api/v1/auth/me',
                        'PUT /api/v1/auth/update',
                        'GET /api/v1/auth/tokens',
                        'POST /api/v1/todos (if authenticated)',
                        'POST /api/v1/notes (if authenticated)'
                    ]
                }
            },
            {
                step: 3,
                action: 'Rotate Token',
                description: 'Generate a new token and optionally revoke the old one',
                endpoint: 'POST /api/v1/auth/rotate',
                headers: {
                    'Authorization': 'Bearer YOUR_CURRENT_TOKEN'
                },
                body: {
                    revokeOld: true // Optional, defaults to true
                },
                response: {
                    success: true,
                    data: {
                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...NEW_TOKEN',
                        user: {
                            id: '507f1f77bcf86cd799439011',
                            email: 'john@example.com',
                            name: 'John Doe'
                        },
                        revokedOldToken: true
                    }
                }
            },
            {
                step: 4,
                action: 'View Active Tokens',
                endpoint: 'GET /api/v1/auth/tokens',
                description: 'See all your active tokens (truncated for security)',
                response: {
                    success: true,
                    data: {
                        tokens: [
                            {
                                token: 'eyJhbGciOiJIUzI1NiI...',
                                createdAt: '2024-01-01T00:00:00.000Z',
                                lastUsedAt: '2024-01-01T12:00:00.000Z',
                                description: 'Login Token',
                                isActive: true
                            }
                        ],
                        count: 1
                    }
                }
            },
            {
                step: 5,
                action: 'Revoke Token',
                endpoints: [
                    {
                        name: 'Revoke specific token',
                        method: 'POST /api/v1/auth/revoke',
                        body: { token: 'FULL_TOKEN_TO_REVOKE' }
                    },
                    {
                        name: 'Revoke current token',
                        method: 'POST /api/v1/auth/revoke',
                        body: {}
                    },
                    {
                        name: 'Revoke all tokens',
                        method: 'POST /api/v1/auth/revoke-all',
                        body: {}
                    }
                ]
            }
        ],
        token_management: {
            rotation: {
                purpose: 'Security best practice to limit token exposure',
                endpoint: "".concat(host, "/api/v1/auth/rotate"),
                options: {
                    revokeOld: 'Boolean - whether to revoke the old token (default: true)'
                }
            },
            revocation: {
                purpose: 'Invalidate compromised or unused tokens',
                endpoints: {
                    single: "".concat(host, "/api/v1/auth/revoke"),
                    all: "".concat(host, "/api/v1/auth/revoke-all")
                },
                note: 'Revoked tokens are immediately invalid'
            },
            tracking: {
                purpose: 'Monitor token usage',
                endpoint: "".concat(host, "/api/v1/auth/tokens"),
                info: 'Shows creation time, last use, and description'
            }
        },
        token_structure: {
            type: 'JWT (JSON Web Token)',
            payload: {
                email: 'user email address',
                iat: 'issued at timestamp'
            },
            note: 'Tokens do not expire - no exp field in payload',
            signing_algorithm: 'HS256',
            secret: 'Stored in JWT_SECRET environment variable',
            security: {
                storage: 'Tokens are tracked in database',
                validation: 'Each request checks token is still active',
                revocation: 'Tokens can be revoked individually or all at once'
            }
        }
    });
});
exports["default"] = authRoute;
