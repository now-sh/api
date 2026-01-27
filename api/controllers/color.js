


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
  
  // Generate all formats
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  
  // Convert RGB to target format
  let result;
  switch (toFormat.toLowerCase()) {
    case 'hex':
      result = hex;
      break;
    case 'rgb':
      result = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      break;
    case 'hsl':
      result = hslString;
      break;
    default:
      throw new Error('Unsupported output format. Supported: hex, rgb, hsl');
  }
  
  return {
    input: color,
    inputFormat: fromFormat,
    output: result,
    outputFormat: toFormat,
    converted: result,
    rgb: rgb,
    hex: hex,
    hsl: hslString
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

/**
 * Generate a color palette based on a base color
 */
const generatePalette = (baseColor, type = 'monochromatic', count = 5) => {
  // First convert base color to RGB
  let rgb;
  if (baseColor.startsWith('#')) {
    rgb = hexToRgb(baseColor);
  } else if (baseColor.startsWith('rgb')) {
    rgb = parseRgb(baseColor);
  } else if (baseColor.startsWith('hsl')) {
    rgb = hslToRgb(baseColor);
  } else {
    throw new Error('Invalid color format');
  }
  
  if (!rgb) {
    throw new Error('Invalid color value');
  }
  
  const colors = [];
  const baseHex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  switch (type) {
    case 'monochromatic':
      // Generate different lightness values
      for (let i = 0; i < count; i++) {
        const lightness = Math.round((i + 1) * (100 / (count + 1)));
        const newRgb = hslToRgb(`hsl(${hsl.h}, ${hsl.s}%, ${lightness}%)`);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
      }
      break;
      
    case 'complementary': {
      colors.push(baseHex);
      const compHue = (hsl.h + 180) % 360;
      const compRgb = hslToRgb(`hsl(${compHue}, ${hsl.s}%, ${hsl.l}%)`);
      colors.push(rgbToHex(compRgb.r, compRgb.g, compRgb.b));

      // Fill remaining with variations
      for (let i = 2; i < count; i++) {
        const variation = i % 2 === 0 ? hsl.h : compHue;
        const lightness = 50 + (i - 2) * 10;
        const varRgb = hslToRgb(`hsl(${variation}, ${hsl.s}%, ${lightness}%)`);
        colors.push(rgbToHex(varRgb.r, varRgb.g, varRgb.b));
      }
      break;
    }

    case 'analogous': {
      const step = 30;
      for (let i = 0; i < count; i++) {
        const hue = (hsl.h + (i - Math.floor(count / 2)) * step + 360) % 360;
        const analogRgb = hslToRgb(`hsl(${hue}, ${hsl.s}%, ${hsl.l}%)`);
        colors.push(rgbToHex(analogRgb.r, analogRgb.g, analogRgb.b));
      }
      break;
    }
      
    case 'triadic':
      for (let i = 0; i < Math.min(count, 3); i++) {
        const hue = (hsl.h + i * 120) % 360;
        const triadRgb = hslToRgb(`hsl(${hue}, ${hsl.s}%, ${hsl.l}%)`);
        colors.push(rgbToHex(triadRgb.r, triadRgb.g, triadRgb.b));
      }
      // Fill remaining with variations
      for (let i = 3; i < count; i++) {
        const baseHue = (hsl.h + ((i - 3) % 3) * 120) % 360;
        const lightness = 50 + (Math.floor((i - 3) / 3) * 10);
        const varRgb = hslToRgb(`hsl(${baseHue}, ${hsl.s}%, ${lightness}%)`);
        colors.push(rgbToHex(varRgb.r, varRgb.g, varRgb.b));
      }
      break;
      
    case 'tetradic':
      for (let i = 0; i < Math.min(count, 4); i++) {
        const hue = (hsl.h + i * 90) % 360;
        const tetRgb = hslToRgb(`hsl(${hue}, ${hsl.s}%, ${hsl.l}%)`);
        colors.push(rgbToHex(tetRgb.r, tetRgb.g, tetRgb.b));
      }
      // Fill remaining with variations
      for (let i = 4; i < count; i++) {
        const baseHue = (hsl.h + ((i - 4) % 4) * 90) % 360;
        const lightness = 50 + (Math.floor((i - 4) / 4) * 10);
        const varRgb = hslToRgb(`hsl(${baseHue}, ${hsl.s}%, ${lightness}%)`);
        colors.push(rgbToHex(varRgb.r, varRgb.g, varRgb.b));
      }
      break;
      
    default:
      // Default to monochromatic
      return generatePalette(baseColor, 'monochromatic', count);
  }
  
  return {
    baseColor: baseHex,
    type: type,
    colors: colors
  };
};

/**
 * Get detailed color information
 */
const getColorInfo = (color) => {
  // Convert color to RGB
  let rgb;
  if (color.startsWith('#')) {
    rgb = hexToRgb(color);
  } else if (color.startsWith('rgb')) {
    rgb = parseRgb(color);
  } else if (color.startsWith('hsl')) {
    rgb = hslToRgb(color);
  } else {
    throw new Error('Invalid color format');
  }
  
  if (!rgb) {
    throw new Error('Invalid color value');
  }
  
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Calculate relative luminance
  const rSrgb = rgb.r / 255;
  const gSrgb = rgb.g / 255;
  const bSrgb = rgb.b / 255;
  
  const r = rSrgb <= 0.03928 ? rSrgb / 12.92 : Math.pow((rSrgb + 0.055) / 1.055, 2.4);
  const g = gSrgb <= 0.03928 ? gSrgb / 12.92 : Math.pow((gSrgb + 0.055) / 1.055, 2.4);
  const b = bSrgb <= 0.03928 ? bSrgb / 12.92 : Math.pow((bSrgb + 0.055) / 1.055, 2.4);
  
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const brightness = Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000);
  
  return {
    hex: hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    brightness: brightness,
    luminance: luminance.toFixed(4),
    isLight: luminance > 0.5,
    isDark: luminance <= 0.5
  };
};

module.exports = {
  convertColor,
  generatePalette,
  getColorInfo
};