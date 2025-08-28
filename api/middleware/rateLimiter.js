const rateLimit = require('express-rate-limit');

// Default rate limiter for all routes
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      errors: [{
        msg: 'Too many requests from this IP, please try again later.'
      }]
    });
  }
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      errors: [{
        msg: 'Too many authentication attempts, please try again later.'
      }]
    });
  }
});

// Lenient limiter for read-only endpoints
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  handler: (req, res) => {
    res.status(429).json({
      errors: [{
        msg: 'Too many requests from this IP, please try again later.'
      }]
    });
  }
});

module.exports = {
  defaultLimiter,
  authLimiter,
  readLimiter
};