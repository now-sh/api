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

module.exports = mongoose.model('User', userSchema);
