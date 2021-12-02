const fetch = require('node-fetch');
const cheerio = require('cheerio');

const url =
  'https://511ny.org/list/events/traffic?start=0&length=100&order%5Bi%5D=1&order%5Bdir%5D=asc';
let cache = null;
let lastCacheTime = null;

async function traffic() {
  // if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
  //   return cache;
  // }
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const title = $('traffic').text();
  const table = $('table');
  const header = table.find('thead tr');
  const headers = [];
  header.find('th').each((i, element) => {
    headers.push($(element).text().trim().replace(/\W/g, '_'));
  });
  const rows = [];
  $(table.find('tfoot tr')[0])
    .find('th')
    .each((i, element) => {
      const row = {};
      $(element)
        .find('td')
        .each((i, column) => {
          row[headers[i]] = $(column).text().trim();
          if (i !== 0) {
            row[headers[i]] = Number(row[headers[i]].replace(/\+|,/g, '') || 0);
          }
        });
      rows.push(row);
    });
  cache = rows;
  lastCacheTime = Date.now();
  return rows;
}
module.exports = traffic;
