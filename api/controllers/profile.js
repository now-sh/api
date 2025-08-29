const { getJson } = require('../utils/httpClient');

const PROFILE_URL = process.env.PROFILE_URL || 'https://raw.githubusercontent.com/casjay/casjay/main/profile.json';
const cache = null;
const lastCacheTime = null;

async function profileData() {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  try {
    return await getJson(PROFILE_URL);
  } catch (error) {
    throw error;
  }
}

module.exports = profileData;
