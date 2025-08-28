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
exports.revokeAllUserTokens = exports.getUserTokens = exports.rotateToken = exports.getUserId = exports.checkOwnership = exports.updateProfile = exports.verifyToken = exports.getUser = exports.login = exports.signup = exports.revokeToken = exports.isTokenActive = exports.generateToken = void 0;
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var user_1 = require("../models/user");
var Token = require('../models/token');
/**
 * Generate JWT token (no expiration)
 */
var generateToken = function (email) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    // Sign without expiresIn option - token will never expire
    return jsonwebtoken_1["default"].sign({ email: email }, process.env.JWT_SECRET);
};
exports.generateToken = generateToken;
/**
 * Save token to database
 */
var saveToken = function (token, userId, email, description) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Token.create({
                    token: token,
                    userId: userId,
                    email: email,
                    description: description || 'API Token'
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Validate token is active
 */
var isTokenActive = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    var tokenDoc;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Token.findOne({ token: token, isActive: true })];
            case 1:
                tokenDoc = _a.sent();
                if (!tokenDoc) return [3 /*break*/, 3];
                // Update last used timestamp
                tokenDoc.lastUsedAt = new Date();
                return [4 /*yield*/, tokenDoc.save()];
            case 2:
                _a.sent();
                return [2 /*return*/, true];
            case 3: return [2 /*return*/, false];
        }
    });
}); };
exports.isTokenActive = isTokenActive;
/**
 * Revoke a token
 */
var revokeToken = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Token.updateOne({ token: token }, {
                    isActive: false,
                    revokedAt: new Date()
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.revokeToken = revokeToken;
/**
 * Register a new user
 */
var signup = function (email, password, name) { return __awaiter(void 0, void 0, void 0, function () {
    var existingUser, hashedPassword, newUser, token;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1["default"].findOne({ email: email })];
            case 1:
                existingUser = _a.sent();
                if (existingUser) {
                    throw new Error('Email already in use');
                }
                return [4 /*yield*/, bcryptjs_1["default"].hash(password, 10)];
            case 2:
                hashedPassword = _a.sent();
                return [4 /*yield*/, user_1["default"].create({
                        email: email,
                        password: hashedPassword,
                        name: name
                    })];
            case 3:
                newUser = _a.sent();
                token = (0, exports.generateToken)(newUser.email);
                // Save token to database
                return [4 /*yield*/, saveToken(token, newUser._id.toString(), newUser.email, 'Signup Token')];
            case 4:
                // Save token to database
                _a.sent();
                return [2 /*return*/, {
                        token: token,
                        user: {
                            id: newUser._id.toString(),
                            email: newUser.email,
                            name: newUser.name
                        }
                    }];
        }
    });
}); };
exports.signup = signup;
/**
 * Login user
 */
var login = function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
    var user, isMatch, token;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1["default"].findOne({ email: email })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new Error('Invalid credentials');
                }
                return [4 /*yield*/, bcryptjs_1["default"].compare(password, user.password)];
            case 2:
                isMatch = _a.sent();
                if (!isMatch) {
                    throw new Error('Invalid credentials');
                }
                token = (0, exports.generateToken)(user.email);
                // Save token to database
                return [4 /*yield*/, saveToken(token, user._id.toString(), user.email, 'Login Token')];
            case 3:
                // Save token to database
                _a.sent();
                return [2 /*return*/, {
                        token: token,
                        user: {
                            id: user._id.toString(),
                            email: user.email,
                            name: user.name
                        }
                    }];
        }
    });
}); };
exports.login = login;
/**
 * Get user info
 */
var getUser = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1["default"].findOne({ email: email })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new Error('User not found');
                }
                return [2 /*return*/, {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name
                    }];
        }
    });
}); };
exports.getUser = getUser;
/**
 * Verify token and get user email
 */
var verifyToken = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    var decoded;
    return __generator(this, function (_a) {
        try {
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not configured');
            }
            decoded = jsonwebtoken_1["default"].verify(token, process.env.JWT_SECRET);
            return [2 /*return*/, decoded.email];
        }
        catch (error) {
            throw new Error('Invalid token');
        }
        return [2 /*return*/];
    });
}); };
exports.verifyToken = verifyToken;
/**
 * Update user profile
 */
var updateProfile = function (email, updates) { return __awaiter(void 0, void 0, void 0, function () {
    var user, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, user_1["default"].findOne({ email: email })];
            case 1:
                user = _b.sent();
                if (!user) {
                    throw new Error('User not found');
                }
                // Update allowed fields
                if (updates.name) {
                    user.name = updates.name;
                }
                if (!updates.password) return [3 /*break*/, 3];
                _a = user;
                return [4 /*yield*/, bcryptjs_1["default"].hash(updates.password, 10)];
            case 2:
                _a.password = _b.sent();
                _b.label = 3;
            case 3: return [4 /*yield*/, user.save()];
            case 4:
                _b.sent();
                return [2 /*return*/, {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name
                    }];
        }
    });
}); };
exports.updateProfile = updateProfile;
/**
 * Check if user owns a resource (for public/private functionality)
 */
var checkOwnership = function (userEmail, resourceOwnerId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1["default"].findOne({ email: userEmail })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, user._id.toString() === resourceOwnerId.toString()];
        }
    });
}); };
exports.checkOwnership = checkOwnership;
/**
 * Get user ID from email (for resource ownership)
 */
var getUserId = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1["default"].findOne({ email: email }).select('_id')];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new Error('User not found');
                }
                return [2 /*return*/, user._id.toString()];
        }
    });
}); };
exports.getUserId = getUserId;
/**
 * Rotate token - generate new token and optionally revoke old one
 */
var rotateToken = function (oldToken, revokeOld) {
    if (revokeOld === void 0) { revokeOld = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var email, decoded, tokenDoc, user, newToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    try {
                        if (!process.env.JWT_SECRET) {
                            throw new Error('JWT_SECRET is not configured');
                        }
                        decoded = jsonwebtoken_1["default"].verify(oldToken, process.env.JWT_SECRET);
                        email = decoded.email;
                    }
                    catch (error) {
                        throw new Error('Invalid token');
                    }
                    return [4 /*yield*/, Token.findOne({ token: oldToken, isActive: true })];
                case 1:
                    tokenDoc = _a.sent();
                    if (!tokenDoc) {
                        throw new Error('Token is not active or does not exist');
                    }
                    return [4 /*yield*/, user_1["default"].findOne({ email: email })];
                case 2:
                    user = _a.sent();
                    if (!user) {
                        throw new Error('User not found');
                    }
                    newToken = (0, exports.generateToken)(email);
                    // Save new token
                    return [4 /*yield*/, saveToken(newToken, user._id.toString(), email, 'Rotated Token')];
                case 3:
                    // Save new token
                    _a.sent();
                    if (!revokeOld) return [3 /*break*/, 6];
                    // Revoke old token
                    return [4 /*yield*/, Token.updateOne({ token: oldToken }, {
                            isActive: false,
                            revokedAt: new Date(),
                            rotatedTo: newToken
                        })];
                case 4:
                    // Revoke old token
                    _a.sent();
                    // Update new token with rotation info
                    return [4 /*yield*/, Token.updateOne({ token: newToken }, { rotatedFrom: oldToken })];
                case 5:
                    // Update new token with rotation info
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/, {
                        token: newToken,
                        user: {
                            id: user._id.toString(),
                            email: user.email,
                            name: user.name
                        }
                    }];
            }
        });
    });
};
exports.rotateToken = rotateToken;
/**
 * Get user's active tokens
 */
var getUserTokens = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var user, tokens;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1["default"].findOne({ email: email })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new Error('User not found');
                }
                return [4 /*yield*/, Token.find({
                        userId: user._id,
                        isActive: true
                    }).select('token createdAt lastUsedAt description isActive')];
            case 2:
                tokens = _a.sent();
                return [2 /*return*/, tokens.map(function (t) { return ({
                        token: t.token.substring(0, 20) + '...',
                        createdAt: t.createdAt,
                        lastUsedAt: t.lastUsedAt,
                        description: t.description,
                        isActive: t.isActive
                    }); })];
        }
    });
}); };
exports.getUserTokens = getUserTokens;
/**
 * Revoke all user tokens
 */
var revokeAllUserTokens = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var user, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, user_1["default"].findOne({ email: email })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new Error('User not found');
                }
                return [4 /*yield*/, Token.updateMany({ userId: user._id, isActive: true }, {
                        isActive: false,
                        revokedAt: new Date()
                    })];
            case 2:
                result = _a.sent();
                return [2 /*return*/, result.modifiedCount || 0];
        }
    });
}); };
exports.revokeAllUserTokens = revokeAllUserTokens;
