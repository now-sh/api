const fetch = require('node-fetch');

const cache = null;
const lastCacheTime = null;

async function profileData() {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  return fetch('https://raw.githubusercontent.com/casjay/casjay/main/profile.json')
    .then((response) => response.json())
    .catch((error) => response.status(500).send(error));
}

module.exports = profileData;
