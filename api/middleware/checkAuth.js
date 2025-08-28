const JWT = require('jsonwebtoken');
const { isTokenActive } = require('../controllers/auth');

const checkAuth = async (req, res, next) => {
  let token = req.header('authorization');
  if (!token) {
    return res.status(403).json({
      errors: [
        {
          msg: 'unauthorized - no token provided',
        },
      ],
    });
  }
  
  // Extract token from "Bearer TOKEN"
  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(403).json({
      errors: [
        {
          msg: 'unauthorized - invalid token format',
        },
      ],
    });
  }
  
  token = tokenParts[1];
  
  try {
    // Verify JWT signature
    const decoded = await JWT.verify(token, process.env.JWT_SECRET);
    
    // Check if token is active in database
    const isActive = await isTokenActive(token);
    if (!isActive) {
      return res.status(403).json({
        errors: [
          {
            msg: 'unauthorized - token has been revoked',
          },
        ],
      });
    }
    
    // Set user info on request
    req.user = decoded.email;
    req.token = token;
    
    next();
  } catch (error) {
    return res.status(403).json({
      errors: [
        {
          msg: 'unauthorized - invalid token',
        },
      ],
    });
  }
};

module.exports = checkAuth;