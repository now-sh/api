/**
 * Error handling utilities
 * Provides consistent error handling across the application
 */

/**
 * Extract error message from any error type
 * @param {any} error - Error object or any value
 * @param {string} fallback - Fallback message (default: 'Unknown error')
 * @returns {string} Error message
 */
function getErrorMessage(error, fallback = 'Unknown error') {
  if (!error) return fallback;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.error) return getErrorMessage(error.error, fallback);
  return fallback;
}

/**
 * Create a standardized error response object
 * @param {any} error - Error object or message
 * @param {string} context - Context where error occurred (e.g., 'fetchData')
 * @returns {object} Standardized error object
 */
function createErrorResponse(error, context = null) {
  const message = getErrorMessage(error);
  const response = {
    error: true,
    message: message
  };

  if (context) {
    response.context = context;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    response.stack = error.stack;
  }

  return response;
}

/**
 * Log error with consistent formatting
 * @param {string} context - Context/location of the error
 * @param {any} error - Error object or message
 */
function logError(context, error) {
  const message = getErrorMessage(error);
  console.error(`[${context}] ${message}`);

  // Log stack trace in development
  if (process.env.NODE_ENV === 'development' && error instanceof Error && error.stack) {
    console.error(error.stack);
  }
}

/**
 * Wrap async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for error logging
 * @returns {Function} Wrapped function that catches errors
 */
function withErrorHandling(fn, context) {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      logError(context, error);
      throw error;
    }
  };
}

/**
 * Try to execute function, return fallback on error
 * @param {Function} fn - Function to execute
 * @param {any} fallback - Fallback value on error
 * @param {string} context - Optional context for logging
 * @returns {any} Result or fallback
 */
function tryOr(fn, fallback, context = null) {
  try {
    return fn();
  } catch (error) {
    if (context) {
      logError(context, error);
    }
    return fallback;
  }
}

/**
 * Async version of tryOr
 * @param {Function} fn - Async function to execute
 * @param {any} fallback - Fallback value on error
 * @param {string} context - Optional context for logging
 * @returns {Promise<any>} Result or fallback
 */
async function tryOrAsync(fn, fallback, context = null) {
  try {
    return await fn();
  } catch (error) {
    if (context) {
      logError(context, error);
    }
    return fallback;
  }
}

/**
 * Create custom error classes
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_REQUIRED');
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Permission denied') {
    super(message, 403, 'PERMISSION_DENIED');
    this.name = 'AuthorizationError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMITED');
    this.name = 'RateLimitError';
  }
}

module.exports = {
  getErrorMessage,
  createErrorResponse,
  logError,
  withErrorHandling,
  tryOr,
  tryOrAsync,
  AppError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError
};
