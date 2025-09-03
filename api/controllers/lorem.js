// Lorem ipsum word lists and templates
const sentenceTemplates = [
  'the {{ noun }} is {{ a_noun }}',
  '{{ a_noun }} is {{ an_adjective }} {{ noun }}',
  'the first {{ adjective }} {{ noun }} is, in its own way, {{ a_noun }}',
  'their {{ noun }} was, in this moment, {{ an_adjective }} {{ noun }}',
  '{{ a_noun }} is {{ a_noun }} from the right perspective',
  'the literature would have us believe that {{ an_adjective }} {{ noun }} is not but {{ a_noun }}',
  '{{ an_adjective }} {{ noun }} is {{ a_noun }} of the mind',
  'the {{ adjective }} {{ noun }} reveals itself as {{ an_adjective }} {{ noun }} to those who look',
  'authors often misinterpret the {{ noun }} as {{ an_adjective }} {{ noun }}, when in actuality it feels more like {{ an_adjective}} {{ noun }}',
  'we can assume that any instance of {{ a_noun }} can be construed as {{ an_adjective }} {{ noun }}',
  'they were lost without the {{ adjective }} {{ noun }} that composed their {{ noun }}',
  'the {{ adjective }} {{ noun }} comes from {{ an_adjective }} {{ noun }}',
  '{{ a_noun }} can hardly be considered {{ an_adjective }} {{ noun }} without also being {{ a_noun }}',
  "few can name {{ an_adjective }} {{ noun }} that isn't {{ an_adjective }} {{ noun }}",
  'some posit the {{ adjective }} {{ noun }} to be less than {{ adjective }}'
];

const phrases = [
  'To be more specific, ',
  'In recent years, ',
  'However, ',
  'Some assert that ',
  'If this was somewhat unclear, ',
  'Unfortunately, that is wrong; on the contrary, ',
  'This could be, or perhaps ',
  'This is not to discredit the idea that ',
  'We know that ',
  "It's an undeniable fact, really; ",
  'Framed in a different way, ',
  "What we don't know for sure is whether or not ",
  'As far as we can estimate, ',
  'The zeitgeist contends that ',
  'Though we assume the latter, ',
  'Far from the truth, ',
  'Extending this logic, ',
  'Nowhere is it disputed that ',
  'In modern times ',
  'In ancient times ',
  'Recent controversy aside, '
];

const nouns = ['watermelon', 'chair', 'sandwich', 'bottle', 'paper', 'keyboard', 'phone', 'lamp', 'desk', 'window'];
const adjectives = ['quick', 'lazy', 'beautiful', 'intelligent', 'sunny', 'cloudy', 'bright', 'dark', 'silent', 'loud'];

// Types




// Helper functions
function getRandomWord(type) {
  const words = type === 'noun' ? nouns : adjectives;
  return words[Math.floor(Math.random() * words.length)];
}

function makeSentenceFromTemplate() {
  const template = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
  return template
    .replace(/{{ noun }}/g, getRandomWord('noun'))
    .replace(/{{ a_noun }}/g, getAn(getRandomWord('noun')))
    .replace(/{{ adjective }}/g, getRandomWord('adjective'))
    .replace(/{{ an_adjective }}/g, getAn(getRandomWord('adjective')))
    .replace(/{{ nouns }}/g, getRandomWord('noun') + 's');
}

function getAn(word) {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  return vowels.includes(word.charAt(0).toLowerCase()) ? 'an ' + word : 'a ' + word;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function randomStartingPhrase() {
  if (Math.random() < 0.33) {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  return '';
}

function generateSentence() {
  const phrase = randomStartingPhrase();
  const sentence = capitalizeFirstLetter(phrase + makeSentenceFromTemplate()) + '.';
  return sentence;
}

/**
 * Generate sentences
 */
const generateSentences = (count) => {
  const sentences = [];
  
  for (let i = 0; i < count; i++) {
    sentences.push(generateSentence());
  }
  
  return {
    text: sentences.join(' '),
    sentences: sentences,
    count: count
  };
};

/**
 * Generate paragraphs
 */
const generateParagraphs = (paragraphCount, sentencesPerParagraph = null) => {
  const paragraphs = [];

  for (let p = 0; p < paragraphCount; p++) {
    const sentences = [];
    // If sentences not specified, random between 3-6
    const sentenceCount = sentencesPerParagraph || (3 + Math.floor(Math.random() * 4));
    
    for (let s = 0; s < sentenceCount; s++) {
      sentences.push(generateSentence());
    }
    paragraphs.push(sentences.join(' '));
  }

  return {
    text: paragraphs.join('\n\n'),
    paragraphs: paragraphs,
    count: {
      paragraphs: paragraphCount,
      sentencesPerParagraph
    }
  };
};

/**
 * Generate custom lorem ipsum
 */
const generateCustom = (options) => {
  const { sentences, paragraphs, sentencesPerParagraph = 5 } = options;
  
  if (sentences) {
    return {
      ...generateSentences(sentences),
      type: 'sentences'
    };
  }
  
  if (paragraphs) {
    return {
      ...generateParagraphs(paragraphs, sentencesPerParagraph),
      type: 'paragraphs'
    };
  }
  
  throw new Error('Must specify either sentences or paragraphs');
};

module.exports = {
  generateSentences,
  generateParagraphs,
  generateCustom
};