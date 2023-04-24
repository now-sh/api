const fetch = require('node-fetch');
const cheerio = require('cheerio');
const axios = require('axios');

const covidurl = 'https://www.worldometers.info/coronavirus/#countries';
let cache = null;
let lastCacheTime = null;

async function covid() {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const data = await axios.get('https://www.worldometers.info/coronavirus/').then((res) => res.data);

  const $ = cheerio.load(data);
  const cases = $('#maincounter-wrap > .maincounter-number span').html().trim();
  const deaths = $('#maincounter-wrap + div + #maincounter-wrap > .maincounter-number span').html().trim();
  const recovered = $('#maincounter-wrap + div + #maincounter-wrap + #maincounter-wrap > .maincounter-number span').html().trim();
  return { cases, deaths, recovered };
}

module.exports = covid;
