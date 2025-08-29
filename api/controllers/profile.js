const { getJson } = require('../utils/httpClient');

const PROFILE_URL = process.env.PROFILE_URL || 'https://raw.githubusercontent.com/casjay/casjay/main/profile.json';
let cache = null;
let lastCacheTime = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function profileData() {
  const now = Date.now();
  
  if (cache && lastCacheTime && (now - lastCacheTime) < CACHE_TTL) {
    return cache;
  }
  
  try {
    const data = await getJson(PROFILE_URL);
    cache = data;
    lastCacheTime = now;
    return data;
  } catch (error) {
    throw error;
  }
}

module.exports = profileData;
