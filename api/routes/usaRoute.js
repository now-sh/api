require('dotenv').config();
const express = require('express');
const usaRoute = express.Router();
const cors = require('cors');
const usa = require('../controllers/usa');
const { getHeaders } = require('../middleware/headers');
const { getJson } = require('../utils/httpClient');
const { setStandardHeaders } = require('../utils/standardHeaders');
const default_route = ['/', '/help'];
const states = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

usaRoute.get(default_route, cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  try {
    const data = {
      title: 'USA COVID-19 Data API by State',
      endpoint: `${host}/api/v1/usa`,
      description: 'Get COVID-19 statistics by US state from disease.sh API',
      data_source: 'https://disease.sh/v3/covid-19/states/',
      endpoints: {
        all_states_help: `${host}/api/v1/usa`,
        by_state: `${host}/api/v1/usa/{state}`,
        example_state: `${host}/api/v1/usa/Alabama`,
        nys_specific: `${host}/api/v1/usa/nys`
      },
      cli_example: `curl ${host}/api/v1/usa/California`,
      bash_function: `usa_covid() { state="\${1:-California}"; curl -s "${host}/api/v1/usa/\$state" | jq -r '\"\\(.state): Cases: \\(.cases) Deaths: \\(.deaths) Recovered: \\(.recovered)\"'; }`,
      available_states: states
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { error: 'An error has occurred' };
    setStandardHeaders(res, data);
    res.json(data);
  }
});

usaRoute.get('/nys', cors(), async (req, res) => {
  const hostname = req.headers.host;
  const proto = req.protocol + '://';
  try {
    const json = await getJson(proto + hostname + '/api/v1/nys', {
      headers: getHeaders(),
    });
    setStandardHeaders(res, json);
    res.json(json);
  } catch (error) {
    const data = { error: error.message };
    setStandardHeaders(res, data);
    res.json(data);
  }
});

usaRoute.get('/:id', cors(), async (req, res) => {
  try {
    const json = await getJson(`https://disease.sh/v3/covid-19/states/${req.params.id}`, {
      headers: getHeaders(),
    });
    setStandardHeaders(res, json);
    res.json(json);
  } catch (error) {
    const data = { error: error.message };
    setStandardHeaders(res, data);
    res.json(data);
  }
});

module.exports = usaRoute;
