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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var express_1 = require("express");
var cors_1 = require("cors");
var closingsRoute = express_1["default"].Router();
var closings = require('../controllers/closings');
closingsRoute.get('/', (0, cors_1["default"])(), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var closingsData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, closings()];
            case 1:
                closingsData = _a.sent();
                res.setHeader('Content-Type', 'application/json');
                res.json(closingsData);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(500).json({
                    error: 'Failed to fetch closings',
                    message: error_1 instanceof Error ? error_1.message : 'An error occurred'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
closingsRoute.get('/albany', (0, cors_1["default"])(), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var closingsData, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, closings()];
            case 1:
                closingsData = _a.sent();
                res.setHeader('Content-Type', 'application/json');
                res.json(closingsData.regions.albany);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(500).json({
                    error: 'Failed to fetch Albany closings',
                    message: error_2 instanceof Error ? error_2.message : 'An error occurred'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
closingsRoute.get('/utica', (0, cors_1["default"])(), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var closingsData, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, closings()];
            case 1:
                closingsData = _a.sent();
                res.setHeader('Content-Type', 'application/json');
                res.json(closingsData.regions.utica);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(500).json({
                    error: 'Failed to fetch Utica closings',
                    message: error_3 instanceof Error ? error_3.message : 'An error occurred'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
closingsRoute.get('/list', (0, cors_1["default"])(), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var closingsData, allClosings, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, closings()];
            case 1:
                closingsData = _a.sent();
                allClosings = __spreadArray(__spreadArray([], (closingsData.regions.albany.closings || []), true), (closingsData.regions.utica.closings || []), true);
                res.setHeader('Content-Type', 'application/json');
                res.json(allClosings);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                res.status(500).json({
                    error: 'Failed to fetch closings list',
                    message: error_4 instanceof Error ? error_4.message : 'An error occurred'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
closingsRoute.get('/help', (0, cors_1["default"])(), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var host;
    return __generator(this, function (_a) {
        host = "".concat(req.protocol, "://").concat(req.headers.host);
        res.setHeader('Content-Type', 'application/json');
        res.json({
            title: 'School & Business Closings API',
            description: 'Get real-time school and business closings for Albany and Utica regions',
            endpoints: {
                all: "".concat(host, "/api/v1/closings"),
                albany: "".concat(host, "/api/v1/closings/albany"),
                utica: "".concat(host, "/api/v1/closings/utica"),
                list: "".concat(host, "/api/v1/closings/list")
            },
            regions: {
                albany: {
                    source: 'WNYT NewsChannel 13',
                    coverage: 'Capital Region, Albany area'
                },
                utica: {
                    source: 'WKTV News Channel 2',
                    coverage: 'Mohawk Valley, Utica area'
                }
            },
            cli_examples: {
                all: "curl ".concat(host, "/api/v1/closings"),
                check_closings: "curl -s ".concat(host, "/api/v1/closings | jq '.hasClosings'"),
                list_only: "curl -s ".concat(host, "/api/v1/closings/list | jq '.[] | .name'"),
                albany_count: "curl -s ".concat(host, "/api/v1/closings/albany | jq '.count'")
            },
            note: 'Closings are cached for 5 minutes. Data is fetched from official news sources.'
        });
        return [2 /*return*/];
    });
}); });
exports["default"] = closingsRoute;
