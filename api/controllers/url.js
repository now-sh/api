const crypto = require('crypto');
const Url = require('../models/url');

/**
 * Generate short code for URL
 */
const generateShortCode = (length = 6) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    code += charset[randomBytes[i] % charset.length];
  }
  
  return code;
};

/**
 * Create shortened URL
 */
const createShortUrl = async (originalUrl, options = {}) => {
  // Validate URL
  try {
    new URL(originalUrl);
  } catch (error) {
    throw new Error('Invalid URL format');
  }
  
  // Check if custom alias is requested
  if (options.customAlias) {
    // Validate custom alias
    if (!/^[a-zA-Z0-9-_]+$/.test(options.customAlias)) {
      throw new Error('Custom alias can only contain letters, numbers, hyphens, and underscores');
    }
    
    // Check if alias already exists
    const existing = await Url.findOne({ 
      $or: [
        { shortCode: options.customAlias },
        { customAlias: options.customAlias }
      ]
    });
    
    if (existing) {
      throw new Error('This alias is already taken');
    }
  }
  
  // Generate unique short code
  let shortCode;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    shortCode = options.customAlias || generateShortCode(options.length || 6);
    const exists = await Url.findOne({ shortCode });
    if (!exists) break;
    attempts++;
  } while (attempts < maxAttempts && !options.customAlias);
  
  if (attempts >= maxAttempts) {
    throw new Error('Unable to generate unique short code, please try again');
  }
  
  // Create URL document
  const urlDoc = new Url({
    shortCode,
    originalUrl,
    customAlias: options.customAlias || null,
    owner: options.userId || null,
    expiresAt: options.expiresIn ? new Date(Date.now() + options.expiresIn) : null
  });
  
  // Extract domain for metadata
  try {
    const urlObj = new URL(originalUrl);
    urlDoc.metadata = {
      domain: urlObj.hostname
    };
  } catch (error) {
    // Ignore metadata extraction errors
  }
  
  await urlDoc.save();
  
  return {
    shortCode: urlDoc.shortCode,
    shortUrl: `${options.baseUrl}/s/${urlDoc.shortCode}`,
    originalUrl: urlDoc.originalUrl,
    customAlias: urlDoc.customAlias,
    expiresAt: urlDoc.expiresAt,
    createdAt: urlDoc.createdAt
  };
};

/**
 * Get URL by short code
 */
const getUrlByCode = async (shortCode) => {
  const url = await Url.findOne({
    $or: [
      { shortCode },
      { customAlias: shortCode }
    ],
    isActive: true
  });
  
  if (!url) {
    throw new Error('URL not found');
  }
  
  // Check if expired
  if (url.expiresAt && url.expiresAt < new Date()) {
    throw new Error('This link has expired');
  }
  
  // Increment click count
  url.clicks += 1;
  url.lastAccessed = new Date();
  await url.save();
  
  return url;
};

/**
 * Get URL statistics
 */
const getUrlStats = async (shortCode, userId = null) => {
  const url = await Url.findOne({
    $or: [
      { shortCode },
      { customAlias: shortCode }
    ]
  });
  
  if (!url) {
    throw new Error('URL not found');
  }
  
  // Check ownership if userId provided
  if (userId && url.owner && url.owner.toString() !== userId) {
    throw new Error('You do not have access to these statistics');
  }
  
  return {
    shortCode: url.shortCode,
    originalUrl: url.originalUrl,
    customAlias: url.customAlias,
    clicks: url.clicks,
    createdAt: url.createdAt,
    lastAccessed: url.lastAccessed,
    expiresAt: url.expiresAt,
    isActive: url.isActive,
    metadata: url.metadata
  };
};

/**
 * List user's URLs
 */
const getUserUrls = async (userId, options = {}) => {
  const query = {
    owner: userId,
    isActive: true
  };
  
  const urls = await Url.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(options.limit || 50, 100))
    .select('-__v');
  
  return urls.map(url => ({
    shortCode: url.shortCode,
    originalUrl: url.originalUrl,
    customAlias: url.customAlias,
    clicks: url.clicks,
    createdAt: url.createdAt,
    expiresAt: url.expiresAt
  }));
};

module.exports = {
  createShortUrl,
  getUrlByCode,
  getUrlStats,
  getUserUrls
};