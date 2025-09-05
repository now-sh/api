const { isDatabaseConnected } = require('../db/connection');

/**
 * Middleware to check if database is connected
 * Use this for routes that require database access
 */
const requireDatabase = (req, res, next) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      success: false,
      error: 'Service Temporarily Unavailable',
      message: 'Database connection is required for this operation',
      details: 'The server is currently unable to connect to the database. Please try again later.'
    });
  }
  next();
};

/**
 * Middleware to check database but continue anyway
 * Use this for routes that can work without database but with reduced functionality
 */
const checkDatabase = (req, res, next) => {
  req.dbConnected = isDatabaseConnected();
  if (!req.dbConnected) {
    console.warn(`⚠️  Database not connected for request: ${req.method} ${req.path}`);
  }
  next();
};

module.exports = {
  requireDatabase,
  checkDatabase
};