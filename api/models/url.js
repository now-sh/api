const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  customAlias: {
    type: String,
    sparse: true,
    unique: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  expiresAt: {
    type: Date,
    default: null,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    title: String,
    description: String,
    domain: String
  },
  lastAccessed: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// TTL index for automatic deletion of expired URLs
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for owner queries
urlSchema.index({ owner: 1, createdAt: -1 });

// Function that returns the model using the correct connection
const getUrlModel = () => {
  // If connections are available, use the shrtnr connection
  if (global.mongoConnections && global.mongoConnections.shrtnr) {
    try {
      return global.mongoConnections.shrtnr.model('Url');
    } catch (e) {
      return global.mongoConnections.shrtnr.model('Url', urlSchema);
    }
  }
  // Fallback to default mongoose connection
  try {
    return mongoose.model('Url');
  } catch (e) {
    return mongoose.model('Url', urlSchema);
  }
};

module.exports = getUrlModel;