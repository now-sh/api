const fetch = require('node-fetch');
const datetime = require('node-datetime');

const dtyester = datetime.create();
dtyester.offsetInHours(-48);
const yesterday = dtyester.format('Y-m-d');

const nysurl = `https://health.data.ny.gov/resource/xdss-u53e.json?test_date=${yesterday}T00:00:00.000`;
const cache = null;
const lastCacheTime = null;

async function nys() {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  return fetch(nysurl)
    .then((response) => response.json())
    .catch((error) => response.status(500).send(error));
}

module.exports = nys;
