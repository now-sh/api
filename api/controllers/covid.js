const { axiosWithTimeout } = require('../utils/axiosWithTimeout');

let cache = null;
let lastCacheTime = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache

async function covid() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cache && lastCacheTime && (now - lastCacheTime) < CACHE_TTL) {
    return cache;
  }
  
  try {
    // Use disease.sh API instead of worldometers (no bot protection)
    const response = await axiosWithTimeout({
      method: 'GET',
      url: 'https://disease.sh/v3/covid-19/all',
      timeout: 10000,
      headers: {
        'User-Agent': 'Node.js API Client'
      }
    });
    
    const data = response.data;
    const result = {
      cases: data.cases?.toLocaleString() || 'N/A',
      deaths: data.deaths?.toLocaleString() || 'N/A',
      recovered: data.recovered?.toLocaleString() || 'N/A',
      active: data.active?.toLocaleString() || 'N/A',
      todayDeaths: data.todayDeaths?.toLocaleString() || 'N/A',
      todayCases: data.todayCases?.toLocaleString() || 'N/A'
    };
    
    // Update cache
    cache = result;
    lastCacheTime = now;
    
    return result;
  } catch (error) {
    // Return cached data if available
    if (cache) {
      console.error('Failed to fetch fresh COVID data, using cache:', error.message);
      return cache;
    }
    
    // Return fallback data
    return {
      cases: 'Data unavailable',
      deaths: 'Data unavailable', 
      recovered: 'Data unavailable',
      error: 'Unable to fetch current data'
    };
  }
}

module.exports = covid;