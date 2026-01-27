const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { setStandardHeaders } = require('../utils/standardHeaders');

const triviaRoute = express.Router();

// Category mapping for Open Trivia Database
const CATEGORIES = {
  'general': 9,
  'books': 10,
  'film': 11,
  'music': 12,
  'musicals': 13,
  'television': 14,
  'video-games': 15,
  'board-games': 16,
  'science-nature': 17,
  'computers': 18,
  'mathematics': 19,
  'mythology': 20,
  'sports': 21,
  'geography': 22,
  'history': 23,
  'politics': 24,
  'art': 25,
  'celebrities': 26,
  'animals': 27,
  'vehicles': 28,
  'comics': 29,
  'gadgets': 30,
  'anime': 31,
  'cartoons': 32
};

// Decode HTML entities
function decodeHTML(html) {
  const entities = {
    '&quot;': '"',
    '&#039;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&mdash;': '—',
    '&ndash;': '–',
    '&nbsp;': ' '
  };
  
  return html.replace(/&[#\w]+;/g, match => entities[match] || match);
}

// Get trivia questions
triviaRoute.get('/questions', cors(), async (req, res) => {
  try {
    const {
      amount = 10,
      category = '',
      difficulty = '',
      type = ''
    } = req.query;
    
    const params = {
      amount: Math.min(parseInt(amount) || 10, 50) // Max 50 questions
    };
    
    if (category && CATEGORIES[category]) {
      params.category = CATEGORIES[category];
    }
    
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      params.difficulty = difficulty;
    }
    
    if (type && ['multiple', 'boolean'].includes(type)) {
      params.type = type;
    }
    
    const response = await axios.get('https://opentdb.com/api.php', { params });
    
    if (response.data.response_code !== 0) {
      const errorMessages = {
        1: 'No results found for the specified query',
        2: 'Invalid parameter in request',
        3: 'Token not found',
        4: 'Token empty, resetting needed'
      };
      
      const data = { 
        error: errorMessages[response.data.response_code] || 'Unknown error',
        code: response.data.response_code 
      };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }
    
    // Clean up the questions
    const questions = response.data.results.map(q => ({
      category: decodeHTML(q.category),
      type: q.type,
      difficulty: q.difficulty,
      question: decodeHTML(q.question),
      correct_answer: decodeHTML(q.correct_answer),
      incorrect_answers: q.incorrect_answers.map(a => decodeHTML(a)),
      all_answers: shuffleArray([
        decodeHTML(q.correct_answer),
        ...q.incorrect_answers.map(a => decodeHTML(a))
      ])
    }));
    
    const data = {
      questions,
      count: questions.length,
      parameters: { amount, category, difficulty, type }
    };
    
    setStandardHeaders(res, data, { noCache: true });
    res.json(data);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch trivia questions',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get single question
triviaRoute.get('/question', cors(), async (req, res) => {
  try {
    const { category = '', difficulty = '', type = '' } = req.query;
    
    const params = { amount: 1 };
    
    if (category && CATEGORIES[category]) {
      params.category = CATEGORIES[category];
    }
    
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      params.difficulty = difficulty;
    }
    
    if (type && ['multiple', 'boolean'].includes(type)) {
      params.type = type;
    }
    
    const response = await axios.get('https://opentdb.com/api.php', { params });
    
    if (response.data.response_code !== 0 || response.data.results.length === 0) {
      const data = { error: 'No questions found' };
      setStandardHeaders(res, data);
      return res.status(404).json(data);
    }
    
    const q = response.data.results[0];
    const question = {
      category: decodeHTML(q.category),
      type: q.type,
      difficulty: q.difficulty,
      question: decodeHTML(q.question),
      correct_answer: decodeHTML(q.correct_answer),
      incorrect_answers: q.incorrect_answers.map(a => decodeHTML(a)),
      all_answers: shuffleArray([
        decodeHTML(q.correct_answer),
        ...q.incorrect_answers.map(a => decodeHTML(a))
      ])
    };
    
    setStandardHeaders(res, question, { noCache: true });
    res.json(question);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch trivia question',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get categories
triviaRoute.get('/categories', cors(), (req, res) => {
  const data = {
    categories: Object.keys(CATEGORIES).map(key => ({
      slug: key,
      id: CATEGORIES[key],
      name: key.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }))
  };
  
  setStandardHeaders(res, data);
  res.json(data);
});

// Get question count for category
const countHandler = async (req, res) => {
  try {
    const { category } = req.params;

    let url = 'https://opentdb.com/api_count_global.php';

    if (category && CATEGORIES[category]) {
      url = `https://opentdb.com/api_count.php?category=${CATEGORIES[category]}`;
    }

    const response = await axios.get(url);

    const data = {
      ...response.data,
      category: category || 'all'
    };

    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = {
      error: 'Failed to fetch question count',
      message: error.message
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
};
triviaRoute.get('/count', cors(), countHandler);
triviaRoute.get('/count/:category', cors(), countHandler);

// Shuffle array helper
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Base route - returns a single random question
triviaRoute.get('/', cors(), async (req, res) => {
  try {
    const { category = '', difficulty = '', type = '' } = req.query;
    
    const params = { amount: 1 };
    
    if (category && CATEGORIES[category]) {
      params.category = CATEGORIES[category];
    }
    
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      params.difficulty = difficulty;
    }
    
    if (type && ['multiple', 'boolean'].includes(type)) {
      params.type = type;
    }
    
    const response = await axios.get('https://opentdb.com/api.php', { params });
    
    if (response.data.response_code !== 0 || response.data.results.length === 0) {
      const data = { error: 'No questions found' };
      setStandardHeaders(res, data);
      return res.status(404).json(data);
    }
    
    const q = response.data.results[0];
    const question = {
      category: decodeHTML(q.category),
      type: q.type,
      difficulty: q.difficulty,
      question: decodeHTML(q.question),
      correct_answer: decodeHTML(q.correct_answer),
      incorrect_answers: q.incorrect_answers.map(a => decodeHTML(a)),
      all_answers: shuffleArray([
        decodeHTML(q.correct_answer),
        ...q.incorrect_answers.map(a => decodeHTML(a))
      ])
    };
    
    setStandardHeaders(res, question, { noCache: true });
    res.json(question);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch trivia question',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Random alias for base route
triviaRoute.get('/random', cors(), async (req, res) => {
  // Just redirect to base route with same query parameters
  req.url = '/';
  return triviaRoute.handle(req, res);
});

// Help endpoint
triviaRoute.get('/help', cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = {
    title: 'Trivia API',
    message: 'Get trivia questions from Open Trivia Database',
    endpoints: {
      questions: `${host}/api/v1/fun/trivia/questions`,
      single: `${host}/api/v1/fun/trivia/question`,
      categories: `${host}/api/v1/fun/trivia/categories`,
      count: `${host}/api/v1/fun/trivia/count/:category`
    },
    parameters: {
      amount: 'Number of questions (1-50, default: 10)',
      category: 'Category slug (see /categories endpoint)',
      difficulty: 'easy, medium, or hard',
      type: 'multiple (multiple choice) or boolean (true/false)'
    },
    categories: Object.keys(CATEGORIES).slice(0, 5).join(', ') + '... (see /categories for full list)',
    examples: {
      questions: `GET ${host}/api/v1/fun/trivia/questions?amount=5&category=science-nature&difficulty=easy`,
      single: `GET ${host}/api/v1/fun/trivia/question?category=history&difficulty=medium`
    }
  };
  setStandardHeaders(res, data);
  res.json(data);
});

module.exports = triviaRoute;