const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const User = require('../models/user');
const Token = require('../models/token');



/**
 * Generate JWT token (no expiration)
 */
const generateToken = (email) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  // Sign without expiresIn option - token will never expire
  return JWT.sign(
    { email },
    process.env.JWT_SECRET
  );
};

/**
 * Save token to database
 */
const saveToken = async (token, userId, email, description) => {
    await Token.create({
    token,
    userId,
    email,
    description: description || 'API Token'
  });
};

/**
 * Validate token is active
 */
const isTokenActive = async (token) => {
    const tokenDoc = await Token.findOne({ token, isActive: true });
  
  if (tokenDoc) {
    // Update last used timestamp
    tokenDoc.lastUsedAt = new Date();
    await tokenDoc.save();
    return true;
  }
  
  return false;
};

/**
 * Revoke a token
 */
const revokeToken = async (token) => {
    await Token.updateOne(
    { token },
    { 
      isActive: false,
      revokedAt: new Date()
    }
  );
};

/**
 * Register a new user
 */
const signup = async (email, password, name) => {
  // Check if user already exists
  console.log('Checking for existing user:', email);
    const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    throw new Error('Email already in use');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create new user
  const newUser = await User.create({
    email,
    password: hashedPassword,
    name
  });
  
  // Generate token
  const token = generateToken(newUser.email);
  
  // Save token to database
  await saveToken(token, newUser._id.toString(), newUser.email, 'Signup Token');
  
  return {
    token,
    user: {
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name
    }
  };
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Find user
    const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  // Generate token
  const token = generateToken(user.email);
  
  // Save token to database
  await saveToken(token, user._id.toString(), user.email, 'Login Token');
  
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    }
  };
};

/**
 * Get user info
 */
const getUser = async (email) => {
    const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name
  };
};

/**
 * Verify token and get user email
 */
const verifyToken = async (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    return decoded.email;
  } catch (_error) {
    throw new Error('Invalid token');
  }
};

/**
 * Update user profile
 */
const updateProfile = async (email, updates) => {
    const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update allowed fields
  if (updates.name) {
    user.name = updates.name;
  }
  
  // If password is being updated
  if (updates.password) {
    user.password = await bcrypt.hash(updates.password, 10);
  }
  
  await user.save();
  
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name
  };
};

/**
 * Check if user owns a resource (for public/private functionality)
 */
const checkOwnership = async (userEmail, resourceOwnerId) => {
    const user = await User.findOne({ email: userEmail });
  
  if (!user) {
    return false;
  }
  
  return user._id.toString() === resourceOwnerId.toString();
};

/**
 * Get user ID from email (for resource ownership)
 */
const getUserId = async (email) => {
    const user = await User.findOne({ email }).select('_id');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user._id.toString();
};

/**
 * Rotate token - generate new token and optionally revoke old one
 */
const rotateToken = async (oldToken, revokeOld = true) => {
  // Verify the old token
  let email;
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    const decoded = JWT.verify(oldToken, process.env.JWT_SECRET);
    email = decoded.email;
  } catch (_error) {
    throw new Error('Invalid token');
  }

  // Check if token is active
    const tokenDoc = await Token.findOne({ token: oldToken, isActive: true });
  if (!tokenDoc) {
    throw new Error('Token is not active or does not exist');
  }
  
  // Get user info
    const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }
  
  // Generate new token
  const newToken = generateToken(email);
  
  // Save new token
  await saveToken(newToken, user._id.toString(), email, 'Rotated Token');
  
  // Update token relationships
  if (revokeOld) {
        
    // Revoke old token
    await Token.updateOne(
      { token: oldToken },
      { 
        isActive: false,
        revokedAt: new Date(),
        rotatedTo: newToken
      }
    );
    
    // Update new token with rotation info
    await Token.updateOne(
      { token: newToken },
      { rotatedFrom: oldToken }
    );
  }
  
  return {
    token: newToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    }
  };
};

/**
 * Get user's active tokens
 */
const getUserTokens = async (email) => {
    const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('User not found');
  }
  
    const tokens = await Token.find({ 
    userId: user._id,
    isActive: true 
  }).select('token createdAt lastUsedAt description isActive');
  
  return tokens.map(t => ({
    token: t.token.substring(0, 20) + '...',  // Show only first 20 chars for security
    createdAt: t.createdAt,
    lastUsedAt: t.lastUsedAt,
    description: t.description,
    isActive: t.isActive
  }));
};

/**
 * Revoke all user tokens
 */
const revokeAllUserTokens = async (email) => {
    const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('User not found');
  }
  
    const result = await Token.updateMany(
    { userId: user._id, isActive: true },
    { 
      isActive: false,
      revokedAt: new Date()
    }
  );
  
  return result.modifiedCount || 0;
};

module.exports = {
  generateToken,
  saveToken,
  isTokenActive,
  revokeToken,
  signup,
  login,
  getUser,
  verifyToken,
  updateProfile,
  checkOwnership,
  getUserId,
  rotateToken,
  getUserTokens,
  revokeAllUserTokens
};