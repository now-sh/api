const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 5,
  },
  name: {
    type: String,
    required: true,
    min: 2,
  },
});

// Function that returns the model using the correct connection
const getUserModel = () => {
  // Register User model on all connections to avoid cross-database issues
  if (global.mongoConnections) {
    // Register on all available connections
    Object.keys(global.mongoConnections).forEach(connName => {
      const conn = global.mongoConnections[connName];
      if (conn) {
        try {
          conn.model('User');
        } catch (e) {
          conn.model('User', userSchema);
        }
      }
    });
    
    // Return the api connection model
    if (global.mongoConnections.api) {
      try {
        return global.mongoConnections.api.model('User');
      } catch (e) {
        return global.mongoConnections.api.model('User', userSchema);
      }
    }
  }
  
  // Fallback to default mongoose connection
  try {
    return mongoose.model('User');
  } catch (e) {
    return mongoose.model('User', userSchema);
  }
};

module.exports = getUserModel;