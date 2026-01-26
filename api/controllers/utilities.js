const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { getExpirationLabel, formatLastUpdated } = require('../utils/dateUtils');








/**
 * Base64 encode text
 */
const base64Encode = (text) => {
  const encoded = Buffer.from(text).toString('base64');
  return {
    input: text,
    result: encoded,
    length: {
      input: text.length,
      output: encoded.length
    }
  };
};

/**
 * Base64 decode text
 */
const base64Decode = (text) => {
  try {
    const decoded = Buffer.from(text, 'base64').toString('utf-8');
    return {
      input: text,
      result: decoded,
      length: {
        input: text.length,
        output: decoded.length
      }
    };
  } catch (error) {
    throw new Error('Invalid base64 string');
  }
};

/**
 * Hash text with various algorithms
 */
const hashText = (text, algorithm = 'sha256') => {
  const supportedAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];
  
  if (!supportedAlgorithms.includes(algorithm.toLowerCase())) {
    throw new Error(`Unsupported algorithm. Supported: ${supportedAlgorithms.join(', ')}`);
  }
  
  const hash = crypto.createHash(algorithm.toLowerCase());
  hash.update(text);
  
  return {
    algorithm: algorithm.toLowerCase(),
    hash: hash.digest('hex'),
    input: text,
    length: hash.digest('hex').length
  };
};

/**
 * Generate UUID
 */
const generateUUID = (version = 'v4', options = {}) => {
  if (version !== 'v4') {
    throw new Error('Currently only UUID v4 is supported');
  }
  
  const uuid = uuidv4();
  
  return {
    uuid: options.uppercase ? uuid.toUpperCase() : uuid,
    version: version,
    timestamp: new Date().toISOString()
  };
};

/**
 * Generate secure password
 */
const generatePassword = (options = {}) => {
  const defaults = {
    length: 16,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
    excludeSimilar: false,
    exclude: ''
  };
  
  const config = { ...defaults, ...options };
  
  if (config.length < 4 || config.length > 128) {
    throw new Error('Password length must be between 4 and 128 characters');
  }
  
  let charset = '';
  
  if (config.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (config.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (config.numbers) charset += '0123456789';
  if (config.symbols) charset += '!@#$%^&*()_+-={}[]|:";\'<>?,./';
  
  // Remove excluded characters
  if (config.excludeSimilar) {
    charset = charset.replace(/[ilLI1oO0]/g, '');
  }
  
  if (config.exclude) {
    const excludeChars = config.exclude.split('');
    excludeChars.forEach(char => {
      charset = charset.replace(new RegExp(char, 'g'), '');
    });
  }
  
  if (charset.length === 0) {
    throw new Error('No characters available for password generation');
  }
  
  let password = '';
  const randomBytes = crypto.randomBytes(config.length);
  
  for (let i = 0; i < config.length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  // Calculate entropy
  const entropy = Math.log2(Math.pow(charset.length, config.length));
  
  return {
    password: password,
    length: config.length,
    entropy: Math.round(entropy * 100) / 100,
    strength: entropy < 30 ? 'weak' : entropy < 50 ? 'fair' : entropy < 70 ? 'good' : 'strong',
    charset_size: charset.length
  };
};

/**
 * Decode and validate JWT
 */
const decodeJWT = (token, options = {}) => {
  try {
    // First decode without verification to get header and payload
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid JWT format');
    }
    
    const result = {
      header: decoded.header,
      payload: decoded.payload,
      signature: decoded.signature,
      valid_format: true
    };
    
    // Check expiration
    if (decoded.payload.exp) {
      const expirationDate = new Date(decoded.payload.exp * 1000);
      const expInfo = getExpirationLabel(expirationDate);
      result.expired = expInfo.isExpired;
      result.expiration_date = expirationDate.toISOString();
      result.expiration_formatted = formatLastUpdated(expirationDate);
      result.expiration_label = expInfo.label;
    }

    // Check not before
    if (decoded.payload.nbf) {
      const notBeforeDate = new Date(decoded.payload.nbf * 1000);
      result.not_before = notBeforeDate.toISOString();
      result.not_before_formatted = formatLastUpdated(notBeforeDate);
      result.active = notBeforeDate <= new Date();
    }

    // Check issued at
    if (decoded.payload.iat) {
      const issuedAtDate = new Date(decoded.payload.iat * 1000);
      result.issued_at = issuedAtDate.toISOString();
      result.issued_at_formatted = formatLastUpdated(issuedAtDate);
    }
    
    // If secret is provided, verify signature
    if (options.secret) {
      try {
        jwt.verify(token, options.secret);
        result.signature_valid = true;
      } catch (verifyError) {
        result.signature_valid = false;
        result.verify_error = verifyError instanceof Error ? verifyError.message : 'Verification failed';
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`JWT decode error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate QR code
 */
const generateQRCode = async (text, options = {}) => {
  const defaults = {
    type: 'png',
    size: 200,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };
  
  const config = { ...defaults, ...options };
  
  try {
    let result;
    
    if (config.type === 'svg') {
      result = await QRCode.toString(text, {
        type: 'svg',
        width: config.size,
        margin: config.margin,
        color: config.color
      });
    } else if (config.type === 'text') {
      result = await QRCode.toString(text, {
        type: 'terminal',
        small: true
      });
    } else {
      // Default to data URL (png)
      result = await QRCode.toDataURL(text, {
        width: config.size,
        margin: config.margin,
        color: config.color
      });
    }
    
    return {
      type: config.type,
      data: result,
      text: text,
      size: config.size
    };
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Convert colors between formats
 */
const convertColor = (color, fromFormat, toFormat) => {
  let rgb = null;
  
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
  let result;
  switch (toFormat.toLowerCase()) {
    case 'hex':
      result = rgbToHex(rgb.r, rgb.g, rgb.b);
      break;
    case 'rgb':
      result = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      break;
    case 'hsl':
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      result = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
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

// Color conversion helpers
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const parseRgb = (rgb) => {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  };
};

const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const hslToRgb = (hslStr) => {
  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return null;
  
  let h = parseInt(match[1]) / 360;
  let s = parseInt(match[2]) / 100;
  let l = parseInt(match[3]) / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

module.exports = {
  base64Encode,
  base64Decode,
  hashText,
  generateUUID,
  generatePassword,
  decodeJWT,
  generateQRCode,
  convertColor
};