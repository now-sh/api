"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.generateCustom = exports.generateParagraphs = exports.generateSentences = void 0;
// Lorem ipsum word lists and templates
var sentenceTemplates = [
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
var phrases = [
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
var nouns = ['watermelon', 'chair', 'sandwich', 'bottle', 'paper', 'keyboard', 'phone', 'lamp', 'desk', 'window'];
var adjectives = ['quick', 'lazy', 'beautiful', 'intelligent', 'sunny', 'cloudy', 'bright', 'dark', 'silent', 'loud'];
// Helper functions
function getRandomWord(type) {
    var words = type === 'noun' ? nouns : adjectives;
    return words[Math.floor(Math.random() * words.length)];
}
function makeSentenceFromTemplate() {
    var template = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
    return template
        .replace(/{{ noun }}/g, getRandomWord('noun'))
        .replace(/{{ a_noun }}/g, getAn(getRandomWord('noun')))
        .replace(/{{ adjective }}/g, getRandomWord('adjective'))
        .replace(/{{ an_adjective }}/g, getAn(getRandomWord('adjective')))
        .replace(/{{ nouns }}/g, getRandomWord('noun') + 's');
}
function getAn(word) {
    var vowels = ['a', 'e', 'i', 'o', 'u'];
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
    var phrase = randomStartingPhrase();
    var sentence = capitalizeFirstLetter(phrase + makeSentenceFromTemplate()) + '.';
    return sentence;
}
/**
 * Generate sentences
 */
var generateSentences = function (count) {
    var sentences = [];
    for (var i = 0; i < count; i++) {
        sentences.push(generateSentence());
    }
    return {
        text: sentences.join(' '),
        sentences: sentences,
        count: count
    };
};
exports.generateSentences = generateSentences;
/**
 * Generate paragraphs
 */
var generateParagraphs = function (paragraphCount, sentencesPerParagraph) {
    var paragraphs = [];
    for (var p = 0; p < paragraphCount; p++) {
        var sentences = [];
        for (var s = 0; s < sentencesPerParagraph; s++) {
            sentences.push(generateSentence());
        }
        paragraphs.push({
            text: sentences.join(' '),
            sentences: sentences
        });
    }
    return {
        text: paragraphs.map(function (p) { return p.text; }).join('\n\n'),
        paragraphs: paragraphs,
        count: {
            paragraphs: paragraphCount,
            sentencesPerParagraph: sentencesPerParagraph
        }
    };
};
exports.generateParagraphs = generateParagraphs;
/**
 * Generate custom lorem ipsum
 */
var generateCustom = function (options) {
    var sentences = options.sentences, paragraphs = options.paragraphs, _a = options.sentencesPerParagraph, sentencesPerParagraph = _a === void 0 ? 5 : _a;
    if (sentences) {
        return __assign(__assign({}, (0, exports.generateSentences)(sentences)), { type: 'sentences' });
    }
    if (paragraphs) {
        return __assign(__assign({}, (0, exports.generateParagraphs)(paragraphs, sentencesPerParagraph)), { type: 'paragraphs' });
    }
    throw new Error('Must specify either sentences or paragraphs');
};
exports.generateCustom = generateCustom;
