const fetch = require('node-fetch');
const cheerio = require('cheerio');

const closingsurl = 'https://wnyt.com/closings/';
let headers = [];
let rows = [];
let row = {};
let cache = null;
let lastCacheTime = null;

async function closings() {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const response = await fetch(closingsurl);
  const html = await response.text();
  const $ = cheerio.load(html);
  const title = $('Closed').text();
  const table = $('table');
  const header = table.find('tbody tr');
  cache = rows;
  lastCacheTime = Date.now();
  return rows;
}

module.exports = closings;
