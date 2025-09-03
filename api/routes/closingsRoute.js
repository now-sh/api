const express = require('express'); const { Request, Response } = require('express');
const cors = require('cors');
const { setStandardHeaders } = require('../utils/standardHeaders');

const closingsRoute = express.Router();
const closings = require('../controllers/closings');

closingsRoute.get('/', cors(), async (req, res) => {
  try {
    const closingsData = await closings();
    setStandardHeaders(res, closingsData);
    res.json(closingsData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch closings',
      message: error instanceof Error ? error.message : 'An error occurred'
    });
  }
});

closingsRoute.get('/albany', cors(), async (req, res) => {
  try {
    const closingsData = await closings();
    const data = closingsData.regions.albany;
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch Albany closings',
      message: error instanceof Error ? error.message : 'An error occurred'
    });
  }
});

closingsRoute.get('/utica', cors(), async (req, res) => {
  try {
    const closingsData = await closings();
    const data = closingsData.regions.utica;
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch Utica closings',
      message: error instanceof Error ? error.message : 'An error occurred'
    });
  }
});

closingsRoute.get('/list', cors(), async (req, res) => {
  try {
    const closingsData = await closings();
    const allClosings = [
      ...(closingsData.regions.albany.closings || []),
      ...(closingsData.regions.utica.closings || [])
    ];
    
    res.setHeader('Content-Type', 'application/json');
    res.json(allClosings);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch closings list',
      message: error instanceof Error ? error.message : 'An error occurred'
    });
  }
});

closingsRoute.get('/help', cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    title: 'School & Business Closings API',
    description: 'Get real-time school and business closings for Albany and Utica regions',
    endpoints: {
      all: `${host}/api/v1/closings`,
      albany: `${host}/api/v1/closings/albany`,
      utica: `${host}/api/v1/closings/utica`,
      list: `${host}/api/v1/closings/list`
    },
    regions: {
      albany: {
        source: 'WNYT NewsChannel 13',
        coverage: 'Capital Region, Albany area'
      },
      utica: {
        source: 'WKTV News Channel 2',
        coverage: 'Mohawk Valley, Utica area'
      }
    },
    cli_examples: {
      all: `curl ${host}/api/v1/closings`,
      check_closings: `curl -s ${host}/api/v1/closings | jq '.hasClosings'`,
      list_only: `curl -s ${host}/api/v1/closings/list | jq '.[] | .name'`,
      albany_count: `curl -s ${host}/api/v1/closings/albany | jq '.count'`
    },
    note: 'Closings are cached for 5 minutes. Data is fetched from official news sources.'
  });
});

module.exports = closingsRoute;