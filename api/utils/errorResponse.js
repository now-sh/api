/**
 * Standardized error response utility
 */

/**
 * Send standardized error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} errors - Additional error details
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = []) => {
  res.status(statusCode).json({
    success: false,
    error: message,
    errors: errors.length > 0 ? errors : undefined
  });
};

/**
 * Send standardized success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data = {}, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * Handle async route errors
 * @param {Function} fn - Async route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Format validation errors
 * @param {Array} errors - Express validator errors
 */
const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.param,
    message: error.msg
  }));
};

module.exports = {
  sendError,
  sendSuccess,
  asyncHandler,
  formatValidationErrors
};