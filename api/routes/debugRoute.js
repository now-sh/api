const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { connectToDatabase, getDatabaseStatus } = require('../db/connection');

// Debug endpoint to test database connection
router.get('/db-test', async (req, res) => {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      vercel: !!process.env.VERCEL,
      now_region: process.env.NOW_REGION,
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
    },
    mongodb: {
      uri_configured: !!process.env.MONGODB_URI,
      uri_prefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'not set',
      mongoose_ready_state: mongoose.connection.readyState,
      connection_states: {
        0: 'disconnected',
        1: 'connected', 
        2: 'connecting',
        3: 'disconnecting'
      }
    },
    connection_test: null,
    error: null
  };

  // Test connection
  try {
    console.log('🔍 Debug: Testing database connection...');
    const connection = await connectToDatabase();
    
    if (connection) {
      debug.connection_test = {
        success: true,
        ready_state: mongoose.connection.readyState,
        db_name: mongoose.connection.db?.databaseName || 'unknown',
        host: mongoose.connection.host || 'unknown'
      };
    } else {
      debug.connection_test = {
        success: false,
        message: 'Connection returned null'
      };
    }
  } catch (error) {
    console.error('🔍 Debug: Connection test failed:', error);
    debug.error = {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5)
    };
    debug.connection_test = {
      success: false,
      message: 'Connection threw error'
    };
  }

  debug.final_status = getDatabaseStatus();

  res.json({
    success: true,
    debug
  });
});

// Simple test endpoint
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Debug route working',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel' : 'local'
  });
});

module.exports = router;