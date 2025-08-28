"use strict";
exports.__esModule = true;
exports.generateUUID = void 0;
var uuid_1 = require("uuid");
/**
 * Generate UUID v4
 */
var generateUUID = function (options) {
    if (options === void 0) { options = {}; }
    var uuid = (0, uuid_1.v4)();
    return {
        uuid: options.uppercase ? uuid.toUpperCase() : uuid,
        version: 'v4',
        timestamp: new Date().toISOString()
    };
};
exports.generateUUID = generateUUID;
