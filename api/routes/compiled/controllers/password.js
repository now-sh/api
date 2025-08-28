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
exports.generatePassword = void 0;
var crypto = require("crypto");
var DEFAULT_OPTIONS = {
    length: 16,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
    excludeSimilar: false,
    exclude: ''
};
/**
 * Generate secure password
 */
var generatePassword = function (options) {
    if (options === void 0) { options = {}; }
    var config = __assign(__assign({}, DEFAULT_OPTIONS), options);
    if (config.length < 4 || config.length > 128) {
        throw new Error('Password length must be between 4 and 128 characters');
    }
    var charset = '';
    if (config.lowercase)
        charset += 'abcdefghijklmnopqrstuvwxyz';
    if (config.uppercase)
        charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (config.numbers)
        charset += '0123456789';
    if (config.symbols)
        charset += '!@#$%^&*()_+-={}[]|:";\'<>?,./';
    // Remove excluded characters
    if (config.excludeSimilar) {
        charset = charset.replace(/[ilLI1oO0]/g, '');
    }
    if (config.exclude) {
        var excludeChars = config.exclude.split('');
        excludeChars.forEach(function (char) {
            charset = charset.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
        });
    }
    if (charset.length === 0) {
        throw new Error('No characters available for password generation');
    }
    var password = '';
    var randomBytes = crypto.randomBytes(config.length);
    for (var i = 0; i < config.length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }
    // Calculate entropy
    var entropy = Math.log2(Math.pow(charset.length, config.length));
    return {
        password: password,
        length: config.length,
        entropy: Math.round(entropy * 100) / 100,
        strength: entropy < 30 ? 'weak' : entropy < 50 ? 'fair' : entropy < 70 ? 'good' : 'strong',
        charset_size: charset.length
    };
};
exports.generatePassword = generatePassword;
