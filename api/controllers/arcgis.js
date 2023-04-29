const fetch = require('node-fetch');
const cheerio = require('cheerio');

const arcgisurl = process.env.ARGIS_URL || '';
const cache = null;
const lastCacheTime = null;

async function arcgisData() {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  return fetch(arcgisurl)
    .then((response) => response.json())
    .catch((error) => response.status(500).send(error));
}

module.exports = arcgisData;
