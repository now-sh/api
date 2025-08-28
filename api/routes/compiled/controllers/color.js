"use strict";
exports.__esModule = true;
exports.convertColor = void 0;
/**
 * Convert colors between formats
 */
var convertColor = function (color, fromFormat, toFormat) {
    var rgb;
    // Convert input to RGB first
    switch (fromFormat.toLowerCase()) {
        case 'hex':
            rgb = hexToRgb(color);
            break;
        case 'rgb':
            rgb = parseRgb(color);
            break;
        case 'hsl':
            rgb = hslToRgb(color);
            break;
        default:
            throw new Error('Unsupported input format. Supported: hex, rgb, hsl');
    }
    if (!rgb) {
        throw new Error('Invalid color value');
    }
    // Convert RGB to target format
    var result;
    switch (toFormat.toLowerCase()) {
        case 'hex':
            result = rgbToHex(rgb.r, rgb.g, rgb.b);
            break;
        case 'rgb':
            result = "rgb(".concat(rgb.r, ", ").concat(rgb.g, ", ").concat(rgb.b, ")");
            break;
        case 'hsl':
            var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            result = "hsl(".concat(hsl.h, ", ").concat(hsl.s, "%, ").concat(hsl.l, "%)");
            break;
        default:
            throw new Error('Unsupported output format. Supported: hex, rgb, hsl');
    }
    return {
        input: color,
        inputFormat: fromFormat,
        output: result,
        outputFormat: toFormat,
        rgb: rgb
    };
};
exports.convertColor = convertColor;
// Color conversion helpers
var hexToRgb = function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
var rgbToHex = function (r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
var parseRgb = function (rgb) {
    var match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match)
        return null;
    return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
    };
};
var rgbToHsl = function (r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
};
var hslToRgb = function (hslStr) {
    var match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match)
        return null;
    var h = parseInt(match[1]) / 360;
    var s = parseInt(match[2]) / 100;
    var l = parseInt(match[3]) / 100;
    var r, g, b;
    if (s === 0) {
        r = g = b = l;
    }
    else {
        var hue2rgb = function (p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
};
