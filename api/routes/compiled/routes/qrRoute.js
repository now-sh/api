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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var cors_1 = require("cors");
var qrController = require("../controllers/qr");
var validationHelper_1 = require("../utils/validationHelper");
var qrRoute = express_1["default"].Router();
qrRoute.get(['/', '/help'], (0, cors_1["default"])(), function (req, res) {
    var host = "".concat(req.protocol, "://").concat(req.headers.host);
    res.json({
        title: 'QR Code Generator',
        message: 'Generate QR codes in various formats',
        endpoints: {
            generate: "".concat(host, "/api/v1/qr/generate"),
            simple: "".concat(host, "/api/v1/qr/text/:text")
        },
        formats: {
            png: 'Base64 encoded PNG image (default)',
            svg: 'SVG vector format',
            text: 'ASCII art for terminal'
        },
        options: {
            size: 'Image size (50-500)',
            margin: 'Quiet zone margin',
            color: {
                dark: 'Foreground color (hex)',
                light: 'Background color (hex)'
            }
        },
        examples: {
            simple: "GET ".concat(host, "/api/v1/qr/text/Hello%20World"),
            custom: "POST ".concat(host, "/api/v1/qr/generate with options")
        }
    });
});
qrRoute.get('/text/:text', (0, cors_1["default"])(), (0, express_validator_1.param)('text').notEmpty().withMessage('Text is required'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var errors, text, result, error_1;
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
                text = decodeURIComponent(req.params.text);
                return [4 /*yield*/, qrController.generateQRCode(text)];
            case 2:
                result = _a.sent();
                res.json({
                    success: true,
                    data: result
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                res.status(500).json({
                    success: false,
                    error: error_1 instanceof Error ? error_1.message : 'An error occurred'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
qrRoute.post('/generate', (0, cors_1["default"])(), (0, express_validator_1.body)('text').notEmpty().withMessage('Text is required'), (0, express_validator_1.body)('type').optional().isIn(['png', 'svg', 'text']).withMessage('Invalid type'), (0, express_validator_1.body)('size').optional().isInt({ min: 50, max: 500 }).withMessage('Size must be between 50 and 500'), (0, express_validator_1.body)('margin').optional().isInt({ min: 0, max: 10 }).withMessage('Margin must be between 0 and 10'), (0, express_validator_1.body)('color.dark').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Dark color must be hex format'), (0, express_validator_1.body)('color.light').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Light color must be hex format'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var errors, _a, text, options, result, error_2;
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
                _b.trys.push([1, 3, , 4]);
                _a = req.body, text = _a.text, options = __rest(_a, ["text"]);
                return [4 /*yield*/, qrController.generateQRCode(text, options)];
            case 2:
                result = _b.sent();
                res.json({
                    success: true,
                    data: result
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                res.status(500).json({
                    success: false,
                    error: error_2 instanceof Error ? error_2.message : 'An error occurred'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports["default"] = qrRoute;
