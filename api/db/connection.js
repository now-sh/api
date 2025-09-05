const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Single MongoDB URI
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_API;

let connection = null;

const connectToDatabase = async () => {
  if (connection && connection.readyState === 1) {
    return connection;
  }

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI not set in environment variables');
    console.error('Please set MONGO_URI in your .env file');
    console.warn('⚠️  Server continuing without MongoDB connection');
    return null;
  }

  try {
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      bufferCommands: false,
      maxPoolSize: 10,
    };

    // Set strictQuery to false to prepare for Mongoose 7
    mongoose.set('strictQuery', false);
    
    connection = await mongoose.connect(MONGO_URI, options);
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️  Server continuing without MongoDB connection');
    return null;
  }
};

// Export the connection function and mongoose instance
module.exports = {
  connectToDatabase,
  mongoose
};