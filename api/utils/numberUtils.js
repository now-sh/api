/**
 * Number formatting utilities
 * Provides consistent number formatting across the application
 */

/**
 * Format number with locale-specific thousand separators
 * @param {number} num - Number to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted number string
 */
function formatNumber(num, locale = 'en-US') {
  if (num === null || num === undefined) return 'N/A';
  if (typeof num !== 'number') {
    num = parseFloat(num);
    if (isNaN(num)) return 'N/A';
  }
  return num.toLocaleString(locale);
}

/**
 * Format number with abbreviation (1.2k, 1.5M, etc.)
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Abbreviated number string
 */
function formatCompact(num, decimals = 1) {
  if (num === null || num === undefined) return 'N/A';
  if (typeof num !== 'number') {
    num = parseFloat(num);
    if (isNaN(num)) return 'N/A';
  }

  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(decimals).replace(/\.0+$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals).replace(/\.0+$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals).replace(/\.0+$/, '') + 'k';
  }
  return num.toString();
}

/**
 * Format bytes to human readable string (KB, MB, GB, etc.)
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted byte string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  if (bytes === null || bytes === undefined) return 'N/A';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Format percentage
 * @param {number} value - Value (0-1 or 0-100)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {boolean} isDecimal - If true, value is 0-1; if false, value is 0-100 (default: false)
 * @returns {string} Formatted percentage string
 */
function formatPercent(value, decimals = 2, isDecimal = false) {
  if (value === null || value === undefined) return 'N/A';
  const percent = isDecimal ? value * 100 : value;
  return percent.toFixed(decimals) + '%';
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
 * @param {number} num - Number to format
 * @returns {string} Number with ordinal suffix
 */
function formatOrdinal(num) {
  if (num === null || num === undefined) return 'N/A';
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Parse formatted number string back to number
 * @param {string} str - Formatted number string (e.g., "1,234,567" or "1.2M")
 * @returns {number} Parsed number
 */
function parseFormattedNumber(str) {
  if (!str || typeof str !== 'string') return NaN;

  // Handle abbreviated numbers
  const abbrevMatch = str.match(/^([\d.]+)\s*([kKmMbBtT])?$/);
  if (abbrevMatch) {
    const num = parseFloat(abbrevMatch[1]);
    const suffix = (abbrevMatch[2] || '').toLowerCase();
    const multipliers = { k: 1000, m: 1000000, b: 1000000000, t: 1000000000000 };
    return num * (multipliers[suffix] || 1);
  }

  // Handle comma-separated numbers
  return parseFloat(str.replace(/,/g, ''));
}

/**
 * Clamp a number between min and max
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped number
 */
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Round to specified decimal places
 * @param {number} num - Number to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded number
 */
function roundTo(num, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

module.exports = {
  formatNumber,
  formatCompact,
  formatBytes,
  formatPercent,
  formatCurrency,
  formatOrdinal,
  parseFormattedNumber,
  clamp,
  roundTo
};
