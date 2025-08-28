const crypto = require('crypto');



const DEFAULT_OPTIONS = {
  length: 16,
  numbers: true,
  symbols: true,
  uppercase: true,
  lowercase: true,
  excludeSimilar: false,
  exclude: ''
};

/**
 * Generate secure password
 */
const generatePassword = (options = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
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
      charset = charset.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
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

module.exports = {
  generatePassword
};