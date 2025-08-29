const datetime = require('node-datetime');
const { getJson } = require('../utils/httpClient');

const dttoday = datetime.create();
const dtyester = datetime.create();
dtyester.offsetInHours(-48);
const yesterday = dtyester.format('Y-m-d');

const nysurl = `https://disease.sh/v3/covid-19/states/New%20York`;
let cache = null;
let lastCacheTime = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function nys() {
  const now = Date.now();
  
  if (cache && lastCacheTime && (now - lastCacheTime) < CACHE_TTL) {
    return cache;
  }
  
  try {
    const data = await getJson(nysurl);
    cache = data;
    lastCacheTime = now;
    return data;
  } catch (error) {
    throw new Error(error + ` error accessing ${nysurl} `);
  }
}

module.exports = nys;
