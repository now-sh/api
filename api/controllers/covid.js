const { getJson } = require('../utils/httpClient');
const { getHeaders } = require('../middleware/headers');

let cache = null;
let lastCacheTime = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

async function covid() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cache && lastCacheTime && (now - lastCacheTime) < CACHE_TTL) {
    return cache;
  }
  
  const data = await getJson('https://disease.sh/v3/covid-19/all', { 
    timeout: 10000,
    headers: getHeaders() 
  });
  
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
}

module.exports = covid;