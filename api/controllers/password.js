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

/**
 * Check password strength
 */
const checkPasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password');
  }
  
  const length = password.length;
  let charset = 0;
  let score = 0;
  
  // Check character types
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);
  
  // Calculate charset size
  if (hasLowercase) charset += 26;
  if (hasUppercase) charset += 26;
  if (hasNumbers) charset += 10;
  if (hasSymbols) charset += 32;
  
  // Calculate score based on complexity
  if (hasLowercase) score += 1;
  if (hasUppercase) score += 1;
  if (hasNumbers) score += 1;
  if (hasSymbols) score += 2;
  
  // Length bonus
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (length >= 20) score += 1;
  
  // Calculate entropy
  const entropy = charset > 0 ? Math.log2(Math.pow(charset, length)) : 0;
  
  // Determine strength
  let strength;
  if (score <= 2 || length < 8) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'fair';
  } else if (score <= 6) {
    strength = 'good';
  } else {
    strength = 'strong';
  }
  
  return {
    strength,
    score: Math.min(score, 10), // Cap at 10
    entropy: Math.round(entropy * 100) / 100,
    length,
    complexity: {
      hasLowercase,
      hasUppercase,
      hasNumbers,
      hasSymbols
    },
    suggestions: getPasswordSuggestions(password, score)
  };
};

/**
 * Get password improvement suggestions
 */
const getPasswordSuggestions = (password, score) => {
  const suggestions = [];
  
  if (password.length < 8) {
    suggestions.push('Use at least 8 characters');
  }
  if (password.length < 12) {
    suggestions.push('Consider using 12+ characters for better security');
  }
  if (!/[a-z]/.test(password)) {
    suggestions.push('Add lowercase letters');
  }
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Add uppercase letters');
  }
  if (!/[0-9]/.test(password)) {
    suggestions.push('Add numbers');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    suggestions.push('Add special characters');
  }
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Avoid repeating characters');
  }
  if (/^(123|abc|qwe)/i.test(password) || /(123|abc|qwe)$/i.test(password)) {
    suggestions.push('Avoid common patterns');
  }
  
  return suggestions;
};

module.exports = {
  generatePassword,
  checkPasswordStrength
};