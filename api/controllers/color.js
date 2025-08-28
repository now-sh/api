


/**
 * Convert colors between formats
 */
const convertColor = (color, fromFormat, toFormat) => {
  let rgb;
  
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
  convertColor
};