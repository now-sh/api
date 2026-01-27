/**
 * String manipulation utilities
 * Provides consistent string handling across the application
 */

/**
 * Convert string to URL-friendly slug
 * @param {string} str - String to slugify
 * @returns {string} URL-friendly slug
 */
function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_]+/g, '-')       // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}

/**
 * Convert slug back to title case
 * @param {string} slug - Slug to convert
 * @returns {string} Title case string
 */
function unslugify(slug) {
  if (!slug) return '';
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Normalize string for comparison (lowercase, remove special chars, collapse whitespace)
 * @param {string} str - String to normalize
 * @param {object} options - Normalization options
 * @returns {string} Normalized string
 */
function normalize(str, options = {}) {
  if (!str) return '';

  let result = str.toLowerCase();

  if (options.removeSpecialChars !== false) {
    result = result.replace(/[^a-z0-9\s]/g, '');
  }

  if (options.collapseWhitespace !== false) {
    result = result.replace(/\s+/g, ' ').trim();
  }

  if (options.removeWhitespace) {
    result = result.replace(/\s+/g, '');
  }

  return result;
}

/**
 * Truncate string to specified length with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length (default: 100)
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
function truncate(str, maxLength = 100, suffix = '...') {
  if (!str || str.length <= maxLength) return str || '';
  return str.substring(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
function titleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert string to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
function camelCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

/**
 * Convert string to PascalCase
 * @param {string} str - String to convert
 * @returns {string} PascalCase string
 */
function pascalCase(str) {
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Convert string to snake_case
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 */
function snakeCase(str) {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convert string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} kebab-case string
 */
function kebabCase(str) {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Sanitize string for safe HTML display (escape HTML entities)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function escapeHtml(str) {
  if (!str) return '';
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, char => htmlEntities[char]);
}

/**
 * Strip HTML tags from string
 * @param {string} str - String with HTML
 * @returns {string} Plain text string
 */
function stripHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Pad string to specified length
 * @param {string} str - String to pad
 * @param {number} length - Target length
 * @param {string} char - Padding character (default: ' ')
 * @param {string} direction - 'left', 'right', or 'both' (default: 'left')
 * @returns {string} Padded string
 */
function pad(str, length, char = ' ', direction = 'left') {
  str = String(str || '');
  if (str.length >= length) return str;

  const padding = char.repeat(length - str.length);

  switch (direction) {
    case 'right':
      return str + padding;
    case 'both': {
      const leftPad = char.repeat(Math.floor((length - str.length) / 2));
      const rightPad = char.repeat(Math.ceil((length - str.length) / 2));
      return leftPad + str + rightPad;
    }
    default:
      return padding + str;
  }
}

/**
 * Check if string is empty or only whitespace
 * @param {string} str - String to check
 * @returns {boolean} True if empty or whitespace only
 */
function isEmpty(str) {
  return !str || str.trim().length === 0;
}

/**
 * Remove extra whitespace (multiple spaces, tabs, newlines)
 * @param {string} str - String to clean
 * @returns {string} Cleaned string
 */
function collapseWhitespace(str) {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Extract words from string
 * @param {string} str - String to extract words from
 * @returns {string[]} Array of words
 */
function words(str) {
  if (!str) return [];
  return str.match(/\b\w+\b/g) || [];
}

/**
 * Count words in string
 * @param {string} str - String to count words in
 * @returns {number} Word count
 */
function wordCount(str) {
  return words(str).length;
}

module.exports = {
  slugify,
  unslugify,
  normalize,
  truncate,
  capitalize,
  titleCase,
  camelCase,
  pascalCase,
  snakeCase,
  kebabCase,
  escapeHtml,
  stripHtml,
  pad,
  isEmpty,
  collapseWhitespace,
  words,
  wordCount
};
