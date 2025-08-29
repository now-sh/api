const { getJson } = require('../utils/httpClient');

const arcgisurl = process.env.ARGIS_URL || '';

async function arcgisData() {
  if (!arcgisurl) {
    throw new Error('ARGIS_URL not configured');
  }
  
  return await getJson(arcgisurl);
}

module.exports = arcgisData;
