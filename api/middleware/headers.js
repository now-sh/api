const myHeaders = {
  'User-Agent': process.env.HEADER_AGENT || 'Mozilla/5.0',
};

// Helper function to merge headers properly
const getHeaders = (additionalHeaders = {}) => {
  return {
    ...myHeaders,
    ...additionalHeaders
  };
};

module.exports = {
  myHeaders,
  getHeaders
};