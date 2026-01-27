const crypto = require('crypto');
const Url = require('../models/url');
const { createRepository } = require('../utils/databaseUtils');
const { getExpirationLabel, formatLastUpdated, getRelativeTimeLabel } = require('../utils/dateUtils');
const { formatCompact } = require('../utils/numberUtils');

/**
 * Create URL repository
 */
const urlRepo = createRepository(Url, {
  ownerField: 'owner',
  publicField: 'isActive', // URLs are "public" if active
  defaultSort: { createdAt: -1 },
  defaultLimit: 50
});

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
 * Format URL response with friendly dates and stats
 */
const formatUrlResponse = (url, baseUrl = '') => {
  const obj = url.toObject ? url.toObject() : { ...url };

  const response = {
    id: obj._id?.toString(),
    shortCode: obj.shortCode,
    shortUrl: baseUrl ? `${baseUrl}/s/${obj.shortCode}` : null,
    originalUrl: obj.originalUrl,
    customAlias: obj.customAlias,
    clicks: obj.clicks || 0,
    clicksFormatted: formatCompact(obj.clicks || 0),
    isActive: obj.isActive,
    createdAt: obj.createdAt,
    createdAtFormatted: formatLastUpdated(obj.createdAt),
    lastAccessed: obj.lastAccessed,
    lastAccessedRelative: obj.lastAccessed ? getRelativeTimeLabel(obj.lastAccessed) : null,
    metadata: obj.metadata
  };

  // Add expiration info if present
  if (obj.expiresAt) {
    const expInfo = getExpirationLabel(obj.expiresAt);
    response.expiresAt = obj.expiresAt;
    response.expirationLabel = expInfo.label;
    response.isExpired = expInfo.isExpired;
  }

  return response;
};

/**
 * Create shortened URL
 */
const createShortUrl = async (originalUrl, options = {}) => {
  // Validate URL
  try {
    new URL(originalUrl);
  } catch (_error) {
    throw new Error('Invalid URL format');
  }

  // Check if custom alias is requested
  if (options.customAlias) {
    if (!/^[a-zA-Z0-9-_]+$/.test(options.customAlias)) {
      throw new Error('Custom alias can only contain letters, numbers, hyphens, and underscores');
    }

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
    urlDoc.metadata = { domain: urlObj.hostname };
  } catch (_error) {
    // Ignore metadata extraction errors
  }

  await urlDoc.save();

  return formatUrlResponse(urlDoc, options.baseUrl);
};

/**
 * Get URL by short code (and track click)
 */
const getUrlByCode = async (shortCode, trackClick = true) => {
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
  if (trackClick) {
    url.clicks += 1;
    url.lastAccessed = new Date();
    await url.save();
  }

  return url;
};

/**
 * Get URL statistics
 */
const getUrlStats = async (shortCode, userId = null, baseUrl = '') => {
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

  return formatUrlResponse(url, baseUrl);
};

/**
 * List user's URLs
 */
const getUserUrls = async (userId, options = {}) => {
  const urls = await Url.find({
    owner: userId,
    isActive: true
  })
    .sort({ createdAt: -1 })
    .limit(Math.min(options.limit || 50, 100));

  return urls.map(url => formatUrlResponse(url, options.baseUrl));
};

/**
 * Deactivate a URL
 */
const deactivateUrl = async (shortCode, userId) => {
  const url = await Url.findOne({
    $or: [
      { shortCode },
      { customAlias: shortCode }
    ]
  });

  if (!url) {
    throw new Error('URL not found');
  }

  if (url.owner?.toString() !== userId) {
    throw new Error('You do not have permission to deactivate this URL');
  }

  url.isActive = false;
  await url.save();

  return { message: 'URL deactivated successfully', shortCode };
};

/**
 * Get URL stats summary for user
 */
const getUserUrlStats = async (userId) => {
  const stats = await Url.aggregate([
    { $match: { owner: userId, isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalClicks: { $sum: '$clicks' },
        withCustomAlias: {
          $sum: { $cond: [{ $ne: ['$customAlias', null] }, 1, 0] }
        },
        withExpiration: {
          $sum: { $cond: [{ $ne: ['$expiresAt', null] }, 1, 0] }
        }
      }
    }
  ]);

  const result = stats[0] || {
    total: 0,
    totalClicks: 0,
    withCustomAlias: 0,
    withExpiration: 0
  };

  result.totalClicksFormatted = formatCompact(result.totalClicks);

  return result;
};

/**
 * Get popular/most clicked URLs (public)
 */
const getPopularUrls = async (options = {}) => {
  const urls = await Url.find({ isActive: true })
    .sort({ clicks: -1 })
    .limit(Math.min(options.limit || 10, 50))
    .select('shortCode originalUrl clicks metadata createdAt');

  return urls.map(url => ({
    shortCode: url.shortCode,
    domain: url.metadata?.domain,
    clicks: url.clicks,
    clicksFormatted: formatCompact(url.clicks),
    createdAt: url.createdAt
  }));
};

/**
 * Check if short code is available
 */
const isCodeAvailable = async (code) => {
  const existing = await Url.findOne({
    $or: [
      { shortCode: code },
      { customAlias: code }
    ]
  });

  return !existing;
};

/**
 * Update URL (limited fields)
 */
const updateUrl = async (shortCode, userId, updates) => {
  const url = await Url.findOne({
    $or: [
      { shortCode },
      { customAlias: shortCode }
    ]
  });

  if (!url) {
    throw new Error('URL not found');
  }

  if (url.owner?.toString() !== userId) {
    throw new Error('You do not have permission to update this URL');
  }

  // Only allow updating custom alias and expiration
  if (updates.customAlias !== undefined) {
    if (updates.customAlias && !/^[a-zA-Z0-9-_]+$/.test(updates.customAlias)) {
      throw new Error('Custom alias can only contain letters, numbers, hyphens, and underscores');
    }
    if (updates.customAlias && !(await isCodeAvailable(updates.customAlias))) {
      throw new Error('This alias is already taken');
    }
    url.customAlias = updates.customAlias;
  }

  if (updates.expiresIn !== undefined) {
    url.expiresAt = updates.expiresIn ? new Date(Date.now() + updates.expiresIn) : null;
  }

  await url.save();

  return formatUrlResponse(url, updates.baseUrl);
};

module.exports = {
  createShortUrl,
  getUrlByCode,
  getUrlStats,
  getUserUrls,
  deactivateUrl,
  getUserUrlStats,
  getPopularUrls,
  isCodeAvailable,
  updateUrl,
  generateShortCode,
  urlRepo
};
