const datetime = require('node-datetime');
const { getJson } = require('../utils/httpClient');

const dttoday = datetime.create();
const dtyester = datetime.create();
dtyester.offsetInHours(-48);
const yesterday = dtyester.format('Y-m-d');

const nysurl = `https://disease.sh/v3/covid-19/states/New%20York`;
const cache = null;
const lastCacheTime = null;

async function nys() {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  try {
    return await getJson(nysurl);
  } catch (error) {
    throw new Error(error + `error accessing ${nysurl} `);
  }
}

module.exports = nys;
