const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { setStandardHeaders } = require('../utils/standardHeaders');

const dictionaryRoute = express.Router();

/**
 * Fetch word definition from Free Dictionary API
 */
async function getWordDefinition(word) {
  const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  return response.data;
}

/**
 * Format phonetics data
 */
function formatPhonetics(phonetics) {
  return phonetics.map(p => ({
    text: p.text,
    audio: p.audio || null,
    sourceUrl: p.sourceUrl,
    license: p.license
  })).filter(p => p.text || p.audio);
}

/**
 * Format meanings data
 */
function formatMeanings(meanings) {
  return meanings.map(meaning => ({
    partOfSpeech: meaning.partOfSpeech,
    definitions: meaning.definitions.map(def => ({
      definition: def.definition,
      example: def.example || null,
      synonyms: def.synonyms || [],
      antonyms: def.antonyms || []
    })),
    synonyms: meaning.synonyms || [],
    antonyms: meaning.antonyms || []
  }));
}

/**
 * Format word data response
 */
function formatWordData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No definitions found');
  }
  
  const wordData = data[0];
  
  return {
    word: wordData.word,
    phonetics: formatPhonetics(wordData.phonetics || []),
    meanings: formatMeanings(wordData.meanings || []),
    sourceUrls: wordData.sourceUrls || [],
    license: wordData.license || null
  };
}

/**
 * Get random word from a word list
 */
async function getRandomWord() {
  try {
    // Use a simple word list API or fallback to common words
    const commonWords = [
      'time', 'person', 'year', 'way', 'day', 'thing', 'world', 'life',
      'hand', 'part', 'child', 'eye', 'woman', 'place', 'work', 'week',
      'case', 'point', 'government', 'company', 'number', 'group', 'problem',
      'fact', 'serendipity', 'eloquent', 'ephemeral', 'quintessential'
    ];
    
    return commonWords[Math.floor(Math.random() * commonWords.length)];
  } catch (error) {
    throw new Error('Failed to get random word');
  }
}

// Get word definition
dictionaryRoute.get('/word/:word', cors(), async (req, res) => {
  try {
    const { word } = req.params;
    
    if (!word || word.length < 1) {
      const data = { error: 'Word parameter is required' };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }
    
    const rawData = await getWordDefinition(word);
    const data = formatWordData(rawData);
    
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    if (error.response?.status === 404) {
      const data = { 
        error: 'Word not found',
        word: req.params.word,
        suggestions: []
      };
      setStandardHeaders(res, data);
      return res.status(404).json(data);
    }
    
    const data = { 
      error: 'Failed to fetch word definition',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get random word definition
dictionaryRoute.get('/random', cors(), async (req, res) => {
  try {
    const word = await getRandomWord();
    const rawData = await getWordDefinition(word);
    const data = {
      ...formatWordData(rawData),
      random: true
    };
    
    setStandardHeaders(res, data, { noCache: true });
    res.json(data);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch random word',
      message: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get synonyms
dictionaryRoute.get('/synonyms/:word', cors(), async (req, res) => {
  try {
    const { word } = req.params;
    const rawData = await getWordDefinition(word);
    const wordData = formatWordData(rawData);
    
    const synonyms = new Set();
    wordData.meanings.forEach(meaning => {
      meaning.synonyms.forEach(syn => synonyms.add(syn));
      meaning.definitions.forEach(def => {
        def.synonyms.forEach(syn => synonyms.add(syn));
      });
    });
    
    const data = {
      word: wordData.word,
      synonyms: Array.from(synonyms).sort()
    };
    
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const status = error.response?.status === 404 ? 404 : 500;
    const data = { 
      error: status === 404 ? 'Word not found' : 'Failed to fetch synonyms',
      word: req.params.word 
    };
    setStandardHeaders(res, data);
    res.status(status).json(data);
  }
});

// Get antonyms
dictionaryRoute.get('/antonyms/:word', cors(), async (req, res) => {
  try {
    const { word } = req.params;
    const rawData = await getWordDefinition(word);
    const wordData = formatWordData(rawData);
    
    const antonyms = new Set();
    wordData.meanings.forEach(meaning => {
      meaning.antonyms.forEach(ant => antonyms.add(ant));
      meaning.definitions.forEach(def => {
        def.antonyms.forEach(ant => antonyms.add(ant));
      });
    });
    
    const data = {
      word: wordData.word,
      antonyms: Array.from(antonyms).sort()
    };
    
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const status = error.response?.status === 404 ? 404 : 500;
    const data = { 
      error: status === 404 ? 'Word not found' : 'Failed to fetch antonyms',
      word: req.params.word 
    };
    setStandardHeaders(res, data);
    res.status(status).json(data);
  }
});

// Get rhymes
dictionaryRoute.get('/rhymes/:word', cors(), async (req, res) => {
  try {
    const { word } = req.params;
    
    // Using Datamuse API for rhymes
    const response = await axios.get(`https://api.datamuse.com/words`, {
      params: {
        rel_rhy: word,
        max: 50
      }
    });
    
    const rhymes = response.data.map(item => ({
      word: item.word,
      score: item.score,
      syllables: item.numSyllables
    }));
    
    const data = {
      word,
      rhymes,
      count: rhymes.length
    };
    
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { 
      error: 'Failed to fetch rhymes',
      word: req.params.word 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

// Get word audio pronunciation
dictionaryRoute.get('/audio/:word', cors(), async (req, res) => {
  try {
    const { word } = req.params;
    const rawData = await getWordDefinition(word);
    const wordData = formatWordData(rawData);
    
    const audioUrls = wordData.phonetics
      .filter(p => p.audio)
      .map(p => p.audio);
    
    const data = {
      word: wordData.word,
      audio: audioUrls,
      phonetics: wordData.phonetics
    };
    
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const status = error.response?.status === 404 ? 404 : 500;
    const data = { 
      error: status === 404 ? 'Word not found' : 'Failed to fetch audio',
      word: req.params.word 
    };
    setStandardHeaders(res, data);
    res.status(status).json(data);
  }
});

// Help endpoint
dictionaryRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = {
    title: 'Dictionary API',
    message: 'English dictionary with definitions, synonyms, antonyms, and more',
    endpoints: {
      definition: `${host}/api/v1/tools/dictionary/word/:word`,
      random: `${host}/api/v1/tools/dictionary/random`,
      synonyms: `${host}/api/v1/tools/dictionary/synonyms/:word`,
      antonyms: `${host}/api/v1/tools/dictionary/antonyms/:word`,
      rhymes: `${host}/api/v1/tools/dictionary/rhymes/:word`,
      audio: `${host}/api/v1/tools/dictionary/audio/:word`
    },
    examples: {
      definition: `GET ${host}/api/v1/tools/dictionary/word/hello`,
      synonyms: `GET ${host}/api/v1/tools/dictionary/synonyms/happy`,
      rhymes: `GET ${host}/api/v1/tools/dictionary/rhymes/cat`
    },
    sources: {
      definitions: 'dictionaryapi.dev',
      rhymes: 'datamuse.com'
    }
  };
  setStandardHeaders(res, data);
  res.json(data);
});

module.exports = dictionaryRoute;