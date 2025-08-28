"use strict";
exports.__esModule = true;
exports.decodeJWT = void 0;
var jwt = require("jsonwebtoken");
/**
 * Decode and optionally validate JWT
 */
var decodeJWT = function (token, options) {
    if (options === void 0) { options = {}; }
    try {
        // First decode without verification to get header and payload
        var decoded = jwt.decode(token, { complete: true });
        if (!decoded || typeof decoded === 'string') {
            throw new Error('Invalid JWT format');
        }
        var result = {
            header: decoded.header,
            payload: decoded.payload,
            signature: decoded.signature,
            valid_format: true
        };
        // Check expiration
        if (decoded.payload.exp) {
            var expirationDate = new Date(decoded.payload.exp * 1000);
            result.expired = expirationDate < new Date();
            result.expiration_date = expirationDate.toISOString();
        }
        // Check not before
        if (decoded.payload.nbf) {
            var notBeforeDate = new Date(decoded.payload.nbf * 1000);
            result.not_before = notBeforeDate;
            result.active = notBeforeDate <= new Date();
        }
        // Check issued at
        if (decoded.payload.iat) {
            result.issued_at = new Date(decoded.payload.iat * 1000).toISOString();
        }
        // If secret is provided, verify signature
        if (options.secret) {
            try {
                jwt.verify(token, options.secret);
                result.signature_valid = true;
            }
            catch (verifyError) {
                result.signature_valid = false;
                result.verify_error = verifyError instanceof Error ? verifyError.message : 'Verification failed';
            }
        }
        return result;
    }
    catch (error) {
        throw new Error("JWT decode error: ".concat(error instanceof Error ? error.message : 'Unknown error'));
    }
};
exports.decodeJWT = decodeJWT;
