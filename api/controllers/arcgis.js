const fetch = require('node-fetch');
const cheerio = require('cheerio');

const arcgisurl =
  'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc%2CCountry_Region%20asc%2CProvince_State%20asc&resultOffset=0&resultRecordCount=1000&cacheHint=false%27';
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
