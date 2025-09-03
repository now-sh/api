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
  }
}, {
  timestamps: true
});

// TTL index for automatic deletion of expired URLs
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for owner queries
urlSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Url', urlSchema);