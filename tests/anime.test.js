const test = require('node:test');
const assert = require('node:assert/strict');

const { parseQuoteResponse } = require('../api/controllers/anime');

test('parses quotes from the moved anime dataset', () => {
  const quote = parseQuoteResponse(
    [
      {
        anime: 'Example Anime',
        character: 'Example Character',
        quote: 'Example quote'
      }
    ],
    'https://raw.githubusercontent.com/apimgr/anime/main/src/data/dataset.json'
  );

  assert.deepEqual(quote, {
    anime: 'Example Anime',
    character: 'Example Character',
    quote: 'Example quote'
  });
});

test('returns null when the anime dataset has no quotes', () => {
  assert.equal(
    parseQuoteResponse([], 'https://raw.githubusercontent.com/apimgr/anime/main/src/data/dataset.json'),
    null
  );
});
