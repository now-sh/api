const { v4: uuidv4 } = require('uuid');

/**
 * Generate UUID v4
 */
const generateUUID = (options = {}) => {
  const uuid = uuidv4();
  
  return {
    uuid: options.uppercase ? uuid.toUpperCase() : uuid,
    version: 'v4',
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  generateUUID
};