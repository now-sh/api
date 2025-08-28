const JWT = require('jsonwebtoken');
const { isTokenActive } = require('../controllers/auth');

/**
 * Optional authentication middleware
 * Adds user info to req.user if valid token is provided
 * Does NOT block the request if no token is provided
 * Used for routes that can be both public and private
 */
const optionalAuth = async (req, res, next) => {
  let token = req.header('authorization');
  
  // If no token, continue as guest
  if (!token) {
    req.user = undefined;
    req.isAuthenticated = false;
    return next();
  }
  
  // Extract token from Bearer format
  if (token.startsWith('Bearer ')) {
    token = token.substring(7);
  } else {
    const parts = token.split(' ');
    if (parts.length === 2) {
      token = parts[1];
    }
  }
  
  try {
    // Verify JWT signature
    const decoded = await JWT.verify(token, process.env.JWT_SECRET);
    
    // Check if token is active in database
    const isActive = await isTokenActive(token);
    if (!isActive) {
      // Token is revoked, continue as guest
      req.user = undefined;
      req.isAuthenticated = false;
      return next();
    }
    
    // Valid and active token
    req.user = decoded.email;
    req.isAuthenticated = true;
    req.token = token;
    next();
  } catch (error) {
    // Invalid token, continue as guest
    req.user = undefined;
    req.isAuthenticated = false;
    next();
  }
};

module.exports = optionalAuth;