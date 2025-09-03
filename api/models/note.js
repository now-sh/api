const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxLength: 200
  },
  content: {
    type: String,
    required: true,
    maxLength: 50000 // Support long content
  },
  contentType: {
    type: String,
    enum: ['text', 'markdown', 'code'],
    default: 'text'
  },
  language: {
    type: String, // For code syntax highlighting (e.g., 'javascript', 'python')
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isGist: {
    type: Boolean,
    default: false // True for code snippets/gists
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxLength: 50
  }],
  color: {
    type: String,
    default: null // For Google Keep-like color coding
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
noteSchema.index({ owner: 1, createdAt: -1 });
noteSchema.index({ isPublic: 1, createdAt: -1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ 'collaborators.user': 1 });
noteSchema.index({ title: 'text', content: 'text' }); // Full text search

// Virtual for snippet preview
noteSchema.virtual('snippet').get(function() {
  if (this.content.length <= 200) return this.content;
  return this.content.substring(0, 200) + '...';
});

module.exports = mongoose.model('Note', noteSchema);