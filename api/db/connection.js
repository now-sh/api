const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Single MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI_API;

let connection = null;

// Global connection cache for serverless environments
if (typeof global !== 'undefined') {
  global._mongoConnection = global._mongoConnection || null;
}
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

const connectToDatabase = async (retryOnFail = true) => {
  // Check global connection cache for serverless environments
  const isVercel = process.env.VERCEL || process.env.NOW_REGION;
  
  if (isVercel && global._mongoConnection && mongoose.connection.readyState === 1) {
    return global._mongoConnection;
  }
  
  if (connection && connection.readyState === 1) {
    return connection;
  }

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in environment variables');
    console.error('Please set MONGODB_URI in your .env file');
    console.warn('⚠️  Server continuing without MongoDB connection');
    return null;
  }

  try {
    connectionAttempts++;
    
    // Detect if running on Vercel serverless
    const isVercel = process.env.VERCEL || process.env.NOW_REGION;
    
    const options = {
      serverSelectionTimeoutMS: isVercel ? 5000 : 10000,
      socketTimeoutMS: isVercel ? 20000 : 45000,
      connectTimeoutMS: isVercel ? 5000 : 10000,
      bufferCommands: true, // Allow buffering until connection is established
      maxPoolSize: isVercel ? 1 : 10,
      maxIdleTimeMS: isVercel ? 10000 : 30000,
      // Serverless-specific optimizations
      ...(isVercel && {
        maxConnecting: 1,
        heartbeatFrequencyMS: 30000,
        serverSelectionTimeoutMS: 3000,
      }),
    };

    // Set strictQuery to false to prepare for Mongoose 7
    mongoose.set('strictQuery', false);
    
    console.log(`🔄 Attempting to connect to MongoDB (attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS})...`);
    
    connection = await mongoose.connect(MONGODB_URI, options);
    
    // Cache connection globally for serverless environments
    if (isVercel) {
      global._mongoConnection = connection;
    }
    
    console.log(`✅ MongoDB connected successfully${isVercel ? ' (serverless)' : ''}`);
    connectionAttempts = 0; // Reset attempts on success
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
      // Don't crash the server, just log the error
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      connection = null;
      // Attempt to reconnect
      if (retryOnFail) {
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect to MongoDB...');
          connectToDatabase(false).catch(() => {
            console.warn('⚠️  MongoDB reconnection failed');
          });
        }, RETRY_DELAY);
      }
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
    return connection;
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    console.error(`❌ MongoDB connection error: ${errorMessage}`);
    
    if (retryOnFail && connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`⏳ Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectToDatabase(retryOnFail);
    } else {
      console.warn('⚠️  Maximum retry attempts reached. Server continuing without MongoDB connection');
      console.warn('⚠️  Database-dependent features will be unavailable');
      connectionAttempts = 0; // Reset for future attempts
      return null;
    }
  }
};

// Check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Get database status details
const getDatabaseStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const readyState = mongoose.connection ? mongoose.connection.readyState : 0;
  
  return {
    connected: readyState === 1,
    status: states[readyState] || 'unknown',
    uri: MONGODB_URI ? 'configured' : 'not configured',
    attempts: connectionAttempts
  };
};

// Helper function to ensure database connection before operations
const ensureConnection = async () => {
  if (!isDatabaseConnected()) {
    console.log('🔄 Database not connected, attempting connection...');
    await connectToDatabase();
  }
  return mongoose.connection;
};

// Export the connection function and mongoose instance
module.exports = {
  connectToDatabase,
  ensureConnection,
  mongoose,
  isDatabaseConnected,
  getDatabaseStatus
};