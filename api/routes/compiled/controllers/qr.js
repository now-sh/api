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
exports.generateQRCode = void 0;
var QRCode = require("qrcode");
var DEFAULT_OPTIONS = {
    type: 'png',
    size: 200,
    margin: 1,
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    }
};
/**
 * Generate QR code
 */
var generateQRCode = function (text, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var config, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = __assign(__assign({}, DEFAULT_OPTIONS), options);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    result = void 0;
                    if (!(config.type === 'svg')) return [3 /*break*/, 3];
                    return [4 /*yield*/, QRCode.toString(text, {
                            type: 'svg',
                            width: config.size,
                            margin: config.margin,
                            color: config.color
                        })];
                case 2:
                    result = _a.sent();
                    return [3 /*break*/, 7];
                case 3:
                    if (!(config.type === 'text')) return [3 /*break*/, 5];
                    return [4 /*yield*/, QRCode.toString(text, {
                            type: 'terminal',
                            small: true
                        })];
                case 4:
                    result = _a.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, QRCode.toDataURL(text, {
                        width: config.size,
                        margin: config.margin,
                        color: config.color
                    })];
                case 6:
                    // Default to data URL (png)
                    result = _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/, {
                        type: config.type,
                        data: result,
                        text: text,
                        size: config.size
                    }];
                case 8:
                    error_1 = _a.sent();
                    throw new Error("QR Code generation failed: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                case 9: return [2 /*return*/];
            }
        });
    });
};
exports.generateQRCode = generateQRCode;
