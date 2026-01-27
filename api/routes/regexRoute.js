const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');

const regexRoute = express.Router();

/**
 * Validation middleware
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendJSON(res, formatError('Validation failed', {
      details: errors.array().map(err => err.msg)
    }), { status: 400 });
    return;
  }
  next();
}

/**
 * Test regex pattern against text
 */
function testRegex(pattern, text, flags = '') {
  try {
    const regex = new RegExp(pattern, flags);
    const matches = [];
    let match;
    
    if (flags.includes('g')) {
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups || {}
        });
      }
    } else {
      match = regex.exec(text);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups || {}
        });
      }
    }
    
    return {
      pattern,
      flags,
      text,
      matches,
      count: matches.length,
      isMatch: matches.length > 0
    };
  } catch (error) {
    throw new Error(`Invalid regex: ${error.message}`);
  }
}

/**
 * Test regex - JSON response
 */
regexRoute.post('/test',
  cors(),
  body('pattern').notEmpty().withMessage('Pattern is required'),
  body('text').notEmpty().withMessage('Text is required'),
  body('flags').optional().isString(),
  validateRequest,
  (req, res) => {
    try {
      const { pattern, text, flags = '' } = req.body;
      const result = testRegex(pattern, text, flags);
      sendJSON(res, formatSuccess(result));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Test regex - Text response (returns matches only)
 */
regexRoute.post('/test/text',
  cors(),
  body('pattern').notEmpty(),
  body('text').notEmpty(),
  body('flags').optional().isString(),
  validateRequest,
  (req, res) => {
    try {
      const { pattern, text, flags = '' } = req.body;
      const result = testRegex(pattern, text, flags);
      
      if (result.matches.length === 0) {
        sendText(res, 'No matches found');
      } else {
        const matchesText = result.matches.map(m => m.match).join('\n');
        sendText(res, matchesText);
      }
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Replace regex matches
 */
regexRoute.post('/replace',
  cors(),
  body('pattern').notEmpty().withMessage('Pattern is required'),
  body('text').notEmpty().withMessage('Text is required'),
  body('replacement').exists().withMessage('Replacement is required'),
  body('flags').optional().isString(),
  validateRequest,
  (req, res) => {
    try {
      const { pattern, text, replacement, flags = '' } = req.body;
      
      const regex = new RegExp(pattern, flags);
      const result = text.replace(regex, replacement);
      
      // Count replacements
      const testResult = testRegex(pattern, text, flags);
      
      sendJSON(res, formatSuccess({
        pattern,
        flags,
        original: text,
        result,
        replacement,
        replacements: testResult.count
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Replace regex matches - Text response
 */
regexRoute.post('/replace/text',
  cors(),
  body('pattern').notEmpty(),
  body('text').notEmpty(),
  body('replacement').exists(),
  body('flags').optional().isString(),
  validateRequest,
  (req, res) => {
    try {
      const { pattern, text, replacement, flags = '' } = req.body;
      const regex = new RegExp(pattern, flags);
      const result = text.replace(regex, replacement);
      sendText(res, result);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Split text by regex
 */
regexRoute.post('/split',
  cors(),
  body('pattern').notEmpty().withMessage('Pattern is required'),
  body('text').notEmpty().withMessage('Text is required'),
  body('limit').optional().isInt({ min: 1 }),
  validateRequest,
  (req, res) => {
    try {
      const { pattern, text, limit } = req.body;
      
      const regex = new RegExp(pattern);
      const parts = limit ? text.split(regex, limit) : text.split(regex);
      
      sendJSON(res, formatSuccess({
        pattern,
        text,
        parts,
        count: parts.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Extract matches from text
 */
regexRoute.post('/extract',
  cors(),
  body('pattern').notEmpty().withMessage('Pattern is required'),
  body('text').notEmpty().withMessage('Text is required'),
  body('flags').optional().isString(),
  body('group').optional().isInt({ min: 0 }),
  validateRequest,
  (req, res) => {
    try {
      const { pattern, text, flags = 'g', group = 0 } = req.body;
      
      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const extracted = [];
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        if (group === 0) {
          extracted.push(match[0]);
        } else if (match[group]) {
          extracted.push(match[group]);
        }
      }
      
      sendJSON(res, formatSuccess({
        pattern,
        flags,
        extracted,
        count: extracted.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Validate regex pattern
 */
regexRoute.post('/validate',
  cors(),
  body('pattern').notEmpty().withMessage('Pattern is required'),
  body('flags').optional().isString(),
  validateRequest,
  (req, res) => {
    const { pattern, flags = '' } = req.body;
    
    try {
      new RegExp(pattern, flags);
      sendJSON(res, formatSuccess({
        pattern,
        flags,
        valid: true,
        message: 'Valid regular expression'
      }));
    } catch (error) {
      sendJSON(res, formatSuccess({
        pattern,
        flags,
        valid: false,
        error: error.message
      }));
    }
  }
);

/**
 * Common regex patterns
 */
regexRoute.get('/patterns', cors(), (req, res) => {
  const patterns = {
    email: {
      pattern: '^[\\w._%+-]+@[\\w.-]+\\.[A-Za-z]{2,}$',
      description: 'Email address',
      example: 'user@example.com'
    },
    url: {
      pattern: '^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?$',
      description: 'URL',
      example: 'https://example.com'
    },
    ipv4: {
      pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
      description: 'IPv4 address',
      example: '192.168.1.1'
    },
    phone: {
      pattern: '^\\+?1?\\d{9,15}$',
      description: 'Phone number',
      example: '+1234567890'
    },
    date: {
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      description: 'Date (YYYY-MM-DD)',
      example: '2024-01-01'
    },
    time: {
      pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
      description: 'Time (HH:MM)',
      example: '14:30'
    },
    hex_color: {
      pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$',
      description: 'Hex color',
      example: '#FF5733'
    },
    alphanumeric: {
      pattern: '^[a-zA-Z0-9]+$',
      description: 'Alphanumeric only',
      example: 'abc123'
    },
    username: {
      pattern: '^[a-zA-Z0-9_]{3,16}$',
      description: 'Username (3-16 chars)',
      example: 'user_123'
    },
    password_strong: {
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
      description: 'Strong password',
      example: 'Pass123!'
    }
  };
  
  sendJSON(res, formatSuccess({
    patterns,
    count: Object.keys(patterns).length
  }));
});

/**
 * Escape special regex characters
 */
regexRoute.post('/escape',
  cors(),
  body('text').notEmpty().withMessage('Text is required'),
  validateRequest,
  (req, res) => {
    const { text } = req.body;
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    sendJSON(res, formatSuccess({
      original: text,
      escaped
    }));
  }
);

/**
 * Help endpoint
 */
regexRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = formatSuccess({
    title: 'Regular Expression Tester',
    message: 'Test, validate, and work with regular expressions',
    endpoints: {
      test: {
        json: `POST ${host}/api/v1/tools/regex/test`,
        text: `POST ${host}/api/v1/tools/regex/test/text`
      },
      replace: {
        json: `POST ${host}/api/v1/tools/regex/replace`,
        text: `POST ${host}/api/v1/tools/regex/replace/text`
      },
      split: `POST ${host}/api/v1/tools/regex/split`,
      extract: `POST ${host}/api/v1/tools/regex/extract`,
      validate: `POST ${host}/api/v1/tools/regex/validate`,
      escape: `POST ${host}/api/v1/tools/regex/escape`,
      patterns: `${host}/api/v1/tools/regex/patterns`
    },
    parameters: {
      pattern: 'Regular expression pattern',
      text: 'Text to test against',
      flags: 'Regex flags (g, i, m, s, u, y)',
      replacement: 'Replacement text for replace operation',
      group: 'Capture group index for extract (0 = full match)',
      limit: 'Limit for split operation'
    },
    flags: {
      g: 'global - find all matches',
      i: 'case insensitive',
      m: 'multiline - ^ and $ match line breaks',
      s: 'dotall - . matches newlines',
      u: 'unicode',
      y: 'sticky'
    },
    examples: {
      test: {
        pattern: '\\d+',
        text: 'There are 123 numbers',
        flags: 'g'
      },
      replace: {
        pattern: '\\b(\\w+)@(\\w+\\.\\w+)\\b',
        text: 'Contact: john@example.com',
        replacement: '$1 at $2',
        result: 'Contact: john at example.com'
      }
    }
  });
  
  sendJSON(res, data);
});

module.exports = regexRoute;