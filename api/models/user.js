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

// Export a function that returns the model using the correct connection
module.exports = (() => {
  // If connections are available, use the api connection
  if (global.mongoConnections && global.mongoConnections.api) {
    return global.mongoConnections.api.model('User', userSchema);
  }
  // Fallback to default mongoose connection
  return mongoose.model('User', userSchema);
})();