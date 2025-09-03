const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { setStandardHeaders } = require('../utils/standardHeaders');

const jokesRoute = express.Router();

// Get a random joke from multiple sources
jokesRoute.get('/random', cors(), async (req, res) => {
  try {
    const source = req.query.source || 'any';
    let joke = null;
    
    switch (source) {
      case 'dad':
      case 'icanhazdadjoke':
        joke = await getDadJoke();
        break;
      
      case 'chuck':
      case 'chucknorris':
        joke = await getChuckNorrisJoke();
        break;
      
      case 'programming':
        joke = await getProgrammingJoke();
        break;
      
      case 'any':
      default:
        // Randomly pick a source
        const sources = [getDadJoke, getChuckNorrisJoke, getProgrammingJoke];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        joke = await randomSource();
        break;
    }
    
    const data = { ...joke, source: joke.source || source };
    setStandardHeaders(res, data, { noCache: true });
    res.json(data);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch joke',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get dad jokes
jokesRoute.get('/dad', cors(), async (req, res) => {
  try {
    const joke = await getDadJoke();
    setStandardHeaders(res, joke, { noCache: true });
    res.json(joke);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch dad joke',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get Chuck Norris jokes
jokesRoute.get('/chuck', cors(), async (req, res) => {
  try {
    const joke = await getChuckNorrisJoke();
    setStandardHeaders(res, joke, { noCache: true });
    res.json(joke);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch Chuck Norris joke',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get programming jokes
jokesRoute.get('/programming', cors(), async (req, res) => {
  try {
    const joke = await getProgrammingJoke();
    setStandardHeaders(res, joke, { noCache: true });
    res.json(joke);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch programming joke',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Search jokes
jokesRoute.get('/search', cors(), async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      const data = { error: 'Search term is required' };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }
    
    // Search dad jokes
    const response = await axios.get('https://icanhazdadjoke.com/search', {
      headers: { 'Accept': 'application/json' },
      params: { term, limit: 20 }
    });
    
    const jokes = response.data.results.map(joke => ({
      joke: joke.joke,
      id: joke.id,
      source: 'icanhazdadjoke'
    }));
    
    const data = { 
      jokes,
      count: jokes.length,
      term 
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { 
      error: 'Failed to search jokes',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Helper functions
async function getDadJoke() {
  const response = await axios.get('https://icanhazdadjoke.com/', {
    headers: { 'Accept': 'application/json' }
  });
  
  return {
    joke: response.data.joke,
    id: response.data.id,
    source: 'icanhazdadjoke',
    type: 'dad'
  };
}

async function getChuckNorrisJoke() {
  const response = await axios.get('https://api.chucknorris.io/jokes/random');
  
  return {
    joke: response.data.value,
    id: response.data.id,
    source: 'chucknorris.io',
    type: 'chuck',
    categories: response.data.categories
  };
}

async function getProgrammingJoke() {
  try {
    // Try JokeAPI first
    const response = await axios.get('https://v2.jokeapi.dev/joke/Programming', {
      params: {
        blacklistFlags: 'nsfw,religious,political,racist,sexist',
        type: 'single'
      }
    });
    
    if (response.data.type === 'single') {
      return {
        joke: response.data.joke,
        id: response.data.id,
        source: 'jokeapi.dev',
        type: 'programming',
        category: response.data.category
      };
    } else {
      return {
        setup: response.data.setup,
        delivery: response.data.delivery,
        joke: `${response.data.setup} ... ${response.data.delivery}`,
        id: response.data.id,
        source: 'jokeapi.dev',
        type: 'programming',
        category: response.data.category
      };
    }
  } catch (error) {
    // Fallback to dad joke with programming search
    const response = await axios.get('https://icanhazdadjoke.com/search', {
      headers: { 'Accept': 'application/json' },
      params: { term: 'programming', limit: 30 }
    });
    
    if (response.data.results.length > 0) {
      const randomJoke = response.data.results[Math.floor(Math.random() * response.data.results.length)];
      return {
        joke: randomJoke.joke,
        id: randomJoke.id,
        source: 'icanhazdadjoke',
        type: 'programming'
      };
    }
    
    throw new Error('No programming jokes found');
  }
}

// Help endpoint
jokesRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = {
    title: 'Jokes API',
    message: 'Get random jokes from various sources',
    endpoints: {
      random: `${host}/api/v1/fun/jokes/random`,
      dad: `${host}/api/v1/fun/jokes/dad`,
      chuck: `${host}/api/v1/fun/jokes/chuck`,
      programming: `${host}/api/v1/fun/jokes/programming`,
      search: `${host}/api/v1/fun/jokes/search?term=keyword`
    },
    sources: {
      dad: 'icanhazdadjoke.com - Dad jokes',
      chuck: 'chucknorris.io - Chuck Norris facts',
      programming: 'jokeapi.dev - Programming jokes'
    },
    parameters: {
      source: 'Specify source for random joke: dad, chuck, programming, or any',
      term: 'Search term for joke search'
    }
  };
  setStandardHeaders(res, data);
  res.json(data);
});

module.exports = jokesRoute;