const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  },
  rotatedFrom: {
    type: String,
    default: null
  },
  rotatedTo: {
    type: String,
    default: null
  },
  revokedAt: {
    type: Date,
    default: null
  },
  description: {
    type: String,
    default: 'API Token'
  }
}, {
  timestamps: true
});

// Index for faster queries
tokenSchema.index({ userId: 1, isActive: 1 });
tokenSchema.index({ email: 1, isActive: 1 });

module.exports = mongoose.model('Token', tokenSchema);