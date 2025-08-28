const axios = require('axios');

/**
 * Create axios instance with default timeout
 */
const axiosInstance = axios.create({
  timeout: 5000 // 5 seconds default timeout
});

/**
 * Axios with custom timeout
 * @param {object} config - Axios configuration
 * @returns {Promise} - Axios response
 */
async function axiosWithTimeout(config) {
  return axiosInstance.request({
    timeout: 5000,
    ...config
  });
}

module.exports = {
  axiosWithTimeout,
  axiosInstance
};