const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { setStandardHeaders } = require('../utils/standardHeaders');

const factsRoute = express.Router();

// Get a random fact
factsRoute.get('/random', cors(), async (req, res) => {
  try {
    const source = req.query.source || 'any';
    let fact = null;
    
    switch (source) {
      case 'useless':
        fact = await getUselessFact();
        break;
      
      case 'cat':
      case 'cats':
        fact = await getCatFact();
        break;
      
      case 'dog':
      case 'dogs':
        fact = await getDogFact();
        break;
      
      case 'numbers':
        fact = await getNumberFact();
        break;
      
      case 'year':
        fact = await getYearFact();
        break;
      
      case 'date':
        fact = await getDateFact();
        break;
      
      case 'any':
      default: {
        // Randomly pick a source
        const sources = [getUselessFact, getCatFact, getDogFact, getNumberFact];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        fact = await randomSource();
        break;
      }
    }
    
    const data = { ...fact, source: fact.source || source };
    setStandardHeaders(res, data, { noCache: true });
    res.json(data);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch fact',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get useless facts
factsRoute.get('/useless', cors(), async (req, res) => {
  try {
    const fact = await getUselessFact();
    setStandardHeaders(res, fact, { noCache: true });
    res.json(fact);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch useless fact',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get cat facts
factsRoute.get('/cats', cors(), async (req, res) => {
  try {
    const fact = await getCatFact();
    setStandardHeaders(res, fact, { noCache: true });
    res.json(fact);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch cat fact',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get dog facts
factsRoute.get('/dogs', cors(), async (req, res) => {
  try {
    const fact = await getDogFact();
    setStandardHeaders(res, fact, { noCache: true });
    res.json(fact);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch dog fact',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get number facts
const numberFactHandler = async (req, res) => {
  try {
    const number = req.params.number || 'random';
    const fact = await getNumberFact(number);
    setStandardHeaders(res, fact, { noCache: true });
    res.json(fact);
  } catch (error) {
    const data = {
      error: 'Failed to fetch number fact',
      message: error.message
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
};
factsRoute.get('/numbers', cors(), numberFactHandler);
factsRoute.get('/numbers/:number', cors(), numberFactHandler);

// Get year facts
const yearFactHandler = async (req, res) => {
  try {
    const year = req.params.year || 'random';
    const fact = await getYearFact(year);
    setStandardHeaders(res, fact, { noCache: true });
    res.json(fact);
  } catch (error) {
    const data = {
      error: 'Failed to fetch year fact',
      message: error.message
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
};
factsRoute.get('/years', cors(), yearFactHandler);
factsRoute.get('/years/:year', cors(), yearFactHandler);

// Get date facts
const dateFactHandler = async (req, res) => {
  try {
    const { month, day } = req.params;
    const fact = await getDateFact(month, day);
    setStandardHeaders(res, fact, { noCache: true });
    res.json(fact);
  } catch (error) {
    const data = {
      error: 'Failed to fetch date fact',
      message: error.message
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
};
factsRoute.get('/dates', cors(), dateFactHandler);
factsRoute.get('/dates/:month', cors(), dateFactHandler);
factsRoute.get('/dates/:month/:day', cors(), dateFactHandler);

// Get today's fact
factsRoute.get('/today', cors(), async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const fact = await getDateFact(month, day);
    setStandardHeaders(res, fact, { noCache: true });
    res.json(fact);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch today\'s fact',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Helper functions
async function getUselessFact() {
  const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
  
  return {
    fact: response.data.text,
    id: response.data.id,
    source: 'uselessfacts.jsph.pl',
    type: 'useless',
    permalink: response.data.permalink
  };
}

async function getCatFact() {
  const response = await axios.get('https://catfact.ninja/fact');
  
  return {
    fact: response.data.fact,
    length: response.data.length,
    source: 'catfact.ninja',
    type: 'cat'
  };
}

async function getDogFact() {
  try {
    // Try dog-facts API
    const response = await axios.get('https://dog-facts-api.herokuapp.com/api/v1/resources/dogs?number=1');
    
    if (response.data && response.data.length > 0) {
      return {
        fact: response.data[0].fact,
        source: 'dog-facts-api',
        type: 'dog'
      };
    }
  } catch (error) {
    // Fallback to dog API
    try {
      const response = await axios.get('https://dog-api.kinduff.com/api/facts');
      
      if (response.data.facts && response.data.facts.length > 0) {
        return {
          fact: response.data.facts[0],
          source: 'dog-api.kinduff.com',
          type: 'dog'
        };
      }
    } catch (e) {
      // If both fail, return a static dog fact
      return {
        fact: "Dogs have been human companions for over 15,000 years.",
        source: 'static',
        type: 'dog'
      };
    }
  }
}

async function getNumberFact(number = 'random') {
  const response = await axios.get(`http://numbersapi.com/${number}/math?json`);
  
  return {
    fact: response.data.text,
    number: response.data.number,
    source: 'numbersapi.com',
    type: 'number',
    found: response.data.found
  };
}

async function getYearFact(year = 'random') {
  const response = await axios.get(`http://numbersapi.com/${year}/year?json`);
  
  return {
    fact: response.data.text,
    year: response.data.number,
    source: 'numbersapi.com',
    type: 'year',
    found: response.data.found
  };
}

async function getDateFact(month, day) {
  let dateStr = 'random';
  
  if (month && day) {
    dateStr = `${month}/${day}`;
  } else if (month) {
    // Random day in the given month
    const daysInMonth = new Date(2024, parseInt(month), 0).getDate();
    const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
    dateStr = `${month}/${randomDay}`;
  }
  
  const response = await axios.get(`http://numbersapi.com/${dateStr}/date?json`);
  
  return {
    fact: response.data.text,
    date: dateStr === 'random' ? response.data.text.match(/\w+ \d+/)[0] : dateStr,
    source: 'numbersapi.com',
    type: 'date',
    found: response.data.found
  };
}

// Base route - returns a random fact
factsRoute.get('/', cors(), async (req, res) => {
  try {
    const source = req.query.source || 'any';
    let fact = null;
    
    switch (source) {
      case 'useless':
        fact = await getUselessFact();
        break;
      
      case 'cat':
      case 'cats':
        fact = await getCatFact();
        break;
      
      case 'dog':
      case 'dogs':
        fact = await getDogFact();
        break;
      
      case 'numbers':
        fact = await getNumberFact();
        break;
      
      case 'year':
        fact = await getYearFact();
        break;
      
      case 'date':
        fact = await getDateFact();
        break;
      
      case 'any':
      default: {
        // Randomly pick a source
        const sources = [getUselessFact, getCatFact, getDogFact, getNumberFact];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        fact = await randomSource();
        break;
      }
    }
    
    const data = { ...fact, source: fact.source || source };
    setStandardHeaders(res, data, { noCache: true });
    res.json(data);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch fact',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Help endpoint
factsRoute.get('/help', cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = {
    title: 'Facts API',
    message: 'Get random facts from various sources',
    endpoints: {
      random: `${host}/api/v1/fun/facts/random`,
      useless: `${host}/api/v1/fun/facts/useless`,
      cats: `${host}/api/v1/fun/facts/cats`,
      dogs: `${host}/api/v1/fun/facts/dogs`,
      numbers: `${host}/api/v1/fun/facts/numbers/:number`,
      years: `${host}/api/v1/fun/facts/years/:year`,
      dates: `${host}/api/v1/fun/facts/dates/:month/:day`,
      today: `${host}/api/v1/fun/facts/today`
    },
    sources: {
      useless: 'uselessfacts.jsph.pl - Random useless facts',
      cats: 'catfact.ninja - Cat facts',
      dogs: 'dog-facts-api - Dog facts',
      numbers: 'numbersapi.com - Number, year, and date facts'
    },
    parameters: {
      source: 'Specify source for random fact: useless, cat, dog, numbers, year, date, or any',
      number: 'Specific number or "random" for number facts',
      year: 'Specific year or "random" for year facts',
      month: 'Month (1-12) for date facts',
      day: 'Day (1-31) for date facts'
    }
  };
  setStandardHeaders(res, data);
  res.json(data);
});

module.exports = factsRoute;