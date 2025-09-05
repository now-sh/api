const QRCode = require('qrcode');



const DEFAULT_OPTIONS = {
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
const generateQRCode = async (text, options = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
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
      format: config.type,
      qrCode: result,
      text: text,
      size: config.size
    };
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

module.exports = {
  generateQRCode
};