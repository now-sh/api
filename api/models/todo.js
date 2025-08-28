const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  completed: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
todoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
todoSchema.index({ owner: 1, createdAt: -1 });
todoSchema.index({ isPublic: 1, createdAt: -1 });
todoSchema.index({ tags: 1 });

// Export a function that returns the model using the correct connection
module.exports = (() => {
  // If connections are available, use the todos connection
  if (global.mongoConnections && global.mongoConnections.todos) {
    return global.mongoConnections.todos.model('Todo', todoSchema);
  }
  // Fallback to default mongoose connection
  return mongoose.model('Todo', todoSchema);
})();