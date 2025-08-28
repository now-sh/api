const myHeaders = {
  'User-Agent': process.env.HEADER_AGENT || 'API-Server/1.0 (+https://github.com/now-sh/api)',
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