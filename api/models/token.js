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
  createdAt: {
    type: Date,
    default: Date.now
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
});

// Index for faster queries
tokenSchema.index({ userId: 1, isActive: 1 });
tokenSchema.index({ email: 1, isActive: 1 });

// Export a function that returns the model using the correct connection
module.exports = (() => {
  // If connections are available, use the api connection (tokens are auth-related)
  if (global.mongoConnections && global.mongoConnections.api) {
    return global.mongoConnections.api.model('Token', tokenSchema);
  }
  // Fallback to default mongoose connection
  return mongoose.model('Token', tokenSchema);
})();