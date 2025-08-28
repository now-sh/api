"use strict";
exports.__esModule = true;
exports.getSupportedAlgorithms = exports.hashText = void 0;
var crypto = require("crypto");
var SUPPORTED_ALGORITHMS = ['md5', 'sha1', 'sha256', 'sha512'];
/**
 * Hash text with various algorithms
 */
var hashText = function (text, algorithm) {
    if (algorithm === void 0) { algorithm = 'sha256'; }
    if (!SUPPORTED_ALGORITHMS.includes(algorithm.toLowerCase())) {
        throw new Error("Unsupported algorithm. Supported: ".concat(SUPPORTED_ALGORITHMS.join(', ')));
    }
    var hash = crypto.createHash(algorithm.toLowerCase());
    hash.update(text);
    var hashValue = hash.digest('hex');
    return {
        algorithm: algorithm.toLowerCase(),
        hash: hashValue,
        input: text,
        length: hashValue.length
    };
};
exports.hashText = hashText;
/**
 * Get supported algorithms
 */
var getSupportedAlgorithms = function () {
    return SUPPORTED_ALGORITHMS;
};
exports.getSupportedAlgorithms = getSupportedAlgorithms;
