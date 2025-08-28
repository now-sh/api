const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Get all MongoDB URIs
const MONGO_URIS = {
  api: process.env.MONGO_URI_API,
  todos: process.env.MONGO_URI_TODOS,
  notes: process.env.MONGO_URI_NOTES,
  shrtnr: process.env.MONGO_URI_SHRTNR
};

// Create connections object
const connections = {};

const connectToDatabase = async (name, uri) => {
  if (!uri) {
    console.warn(`⚠️  MONGO_URI_${name.toUpperCase()} not set, skipping ${name} database`);
    return null;
  }

  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
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
  for (const [name, uri] of Object.entries(MONGO_URIS)) {
    if (uri) {
      connections[name] = await connectToDatabase(name, uri);
    }
  }
  
  // Check if at least one connection was successful
  const activeConnections = Object.values(connections).filter(conn => conn !== null);
  if (activeConnections.length === 0) {
    console.error('❌ No database connections established!');
    console.error('Please set at least one MONGO_URI_* environment variable in your .env file');
    console.error('Available options: MONGO_URI_API, MONGO_URI_TODOS, MONGO_URI_NOTES, MONGO_URI_SHRTNR');
    process.exit(1);
  }
  
  console.log(`\n✅ Successfully connected to ${activeConnections.length} database(s)\n`);
  
  // Export connections for models to use
  global.mongoConnections = connections;
};

module.exports = initializeDatabases;