const { getJson } = require('../utils/httpClient');

const arcgisUrl = process.env.ARCGIS_URL || process.env.ARGIS_URL || '';

async function arcgisData() {
  if (!arcgisUrl) {
    throw new Error('ARCGIS_URL not configured');
  }
  
  return await getJson(arcgisUrl);
}

module.exports = arcgisData;
