const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Get all MongoDB URIs
const MONGODB_URIS = {
  api: process.env.MONGODB_URI_API,
  todos: process.env.MONGODB_URI_TODOS,
  notes: process.env.MONGODB_URI_NOTES,
  shrtnr: process.env.MONGODB_URI_SHRTNR
};

// Create connections object
const connections = {};

const connectToDatabase = async (name, uri) => {
  if (!uri) {
    console.warn(`⚠️  MONGODB_URI_${name.toUpperCase()} not set, skipping ${name} database`);
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

    // Mask connection string for security
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@');
    console.log(`🔄 Connecting to ${name} database...`);
    console.log(`📍 URI: ${maskedUri}`);
    
    const connection = await mongoose.createConnection(uri, options).asPromise();
    console.log(`✅ ${name} database connected successfully`);
    
    // Handle connection events
    connection.on('error', (err) => {
      console.error(`❌ ${name} database error:`, err);
    });
    
    connection.on('disconnected', () => {
      console.warn(`⚠️  ${name} database disconnected`);
    });
    
    connection.on('reconnected', () => {
      console.log(`✅ ${name} database reconnected`);
    });
    
    return connection;
  } catch (error) {
    console.error(`❌ ${name} database connection error:`, error.message);
    return null;
  }
};

const initializeDatabases = async () => {
  console.log('🚀 Initializing MongoDB connections...\n');
  
  // Connect to each database
  for (const [name, uri] of Object.entries(MONGODB_URIS)) {
    if (uri) {
      connections[name] = await connectToDatabase(name, uri);
    }
  }
  
  // Check if at least one connection was successful
  const activeConnections = Object.values(connections).filter(conn => conn !== null);
  if (activeConnections.length === 0) {
    console.warn('⚠️  WARNING: No database connections established!');
    console.warn('Most personal features (todos, notes, auth) will not work without MongoDB.');
    console.warn('To enable these features, set MONGODB_URI_* environment variables in your .env file');
    console.warn('Available options: MONGODB_URI_API, MONGODB_URI_TODOS, MONGODB_URI_NOTES, MONGODB_URI_SHRTNR');
    console.warn('\n🚀 Starting server with limited functionality (utilities only)...\n');
  }
  
  console.log(`\n✅ Successfully connected to ${activeConnections.length} database(s)\n`);
  
  // Export connections for models to use
  global.mongoConnections = connections;
};

module.exports = initializeDatabases;