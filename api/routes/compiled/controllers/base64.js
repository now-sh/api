"use strict";
exports.__esModule = true;
exports.decode = exports.encode = void 0;
/**
 * Base64 encode text
 */
var encode = function (text) {
    var encoded = Buffer.from(text).toString('base64');
    return {
        input: text,
        result: encoded,
        length: {
            input: text.length,
            output: encoded.length
        }
    };
};
exports.encode = encode;
/**
 * Base64 decode text
 */
var decode = function (text) {
    try {
        var decoded = Buffer.from(text, 'base64').toString('utf-8');
        return {
            input: text,
            result: decoded,
            length: {
                input: text.length,
                output: decoded.length
            }
        };
    }
    catch (error) {
        throw new Error('Invalid base64 string');
    }
};
exports.decode = decode;
