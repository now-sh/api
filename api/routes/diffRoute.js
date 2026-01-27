const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const diffLib = require('diff');

const diffRoute = express.Router();

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
 * Format diff output
 */
function formatDiff(diff, format = 'json') {
  if (format === 'text') {
    return diff.map(part => {
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      return part.value.split('\n').map(line => prefix + line).join('\n');
    }).join('');
  }
  
  if (format === 'html') {
    return diff.map(part => {
      const color = part.added ? 'green' : part.removed ? 'red' : 'gray';
      const prefix = part.added ? '+' : part.removed ? '-' : '';
      return `<span style="color: ${color}">${prefix}${escapeHtml(part.value)}</span>`;
    }).join('');
  }
  
  return diff;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Calculate diff statistics
 */
function getDiffStats(diff) {
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;
  
  diff.forEach(part => {
    const lines = part.value.split('\n').length - 1;
    if (part.added) additions += lines;
    else if (part.removed) deletions += lines;
    else unchanged += lines;
  });
  
  return { additions, deletions, unchanged, total: additions + deletions + unchanged };
}

/**
 * Compare two texts character by character
 */
diffRoute.post('/chars',
  cors(),
  body('text1').notEmpty().withMessage('Text1 is required'),
  body('text2').notEmpty().withMessage('Text2 is required'),
  body('ignoreCase').optional().isBoolean(),
  validateRequest,
  (req, res) => {
    const { text1, text2, ignoreCase = false } = req.body;
    
    const options = { ignoreCase };
    const diff = diffLib.diffChars(text1, text2, options);
    const stats = getDiffStats(diff);
    
    sendJSON(res, formatSuccess({
      diff,
      stats,
      type: 'chars'
    }));
  }
);

/**
 * Compare two texts character by character - Text response
 */
diffRoute.post('/chars/text',
  cors(),
  body('text1').notEmpty(),
  body('text2').notEmpty(),
  validateRequest,
  (req, res) => {
    const { text1, text2 } = req.body;
    const diff = diffLib.diffChars(text1, text2);
    sendText(res, formatDiff(diff, 'text'));
  }
);

/**
 * Compare two texts word by word
 */
diffRoute.post('/words',
  cors(),
  body('text1').notEmpty().withMessage('Text1 is required'),
  body('text2').notEmpty().withMessage('Text2 is required'),
  body('ignoreCase').optional().isBoolean(),
  validateRequest,
  (req, res) => {
    const { text1, text2, ignoreCase = false } = req.body;
    
    const options = { ignoreCase };
    const diff = diffLib.diffWords(text1, text2, options);
    const stats = getDiffStats(diff);
    
    sendJSON(res, formatSuccess({
      diff,
      stats,
      type: 'words'
    }));
  }
);

/**
 * Compare two texts line by line
 */
diffRoute.post('/lines',
  cors(),
  body('text1').notEmpty().withMessage('Text1 is required'),
  body('text2').notEmpty().withMessage('Text2 is required'),
  body('ignoreWhitespace').optional().isBoolean(),
  body('newlineIsToken').optional().isBoolean(),
  validateRequest,
  (req, res) => {
    const { text1, text2, ignoreWhitespace = false, newlineIsToken = true } = req.body;
    
    const options = { ignoreWhitespace, newlineIsToken };
    const diff = diffLib.diffLines(text1, text2, options);
    const stats = getDiffStats(diff);
    
    sendJSON(res, formatSuccess({
      diff,
      stats,
      type: 'lines'
    }));
  }
);

/**
 * Compare two texts line by line - Text response
 */
diffRoute.post('/lines/text',
  cors(),
  body('text1').notEmpty(),
  body('text2').notEmpty(),
  validateRequest,
  (req, res) => {
    const { text1, text2 } = req.body;
    const diff = diffLib.diffLines(text1, text2);
    sendText(res, formatDiff(diff, 'text'));
  }
);

/**
 * Compare two texts sentence by sentence
 */
diffRoute.post('/sentences',
  cors(),
  body('text1').notEmpty().withMessage('Text1 is required'),
  body('text2').notEmpty().withMessage('Text2 is required'),
  validateRequest,
  (req, res) => {
    const { text1, text2 } = req.body;
    
    const diff = diffLib.diffSentences(text1, text2);
    const stats = getDiffStats(diff);
    
    sendJSON(res, formatSuccess({
      diff,
      stats,
      type: 'sentences'
    }));
  }
);

/**
 * Compare two JSON objects
 */
diffRoute.post('/json',
  cors(),
  body('json1').notEmpty().withMessage('JSON1 is required'),
  body('json2').notEmpty().withMessage('JSON2 is required'),
  validateRequest,
  (req, res) => {
    try {
      const { json1, json2 } = req.body;
      
      // Parse if strings
      const obj1 = typeof json1 === 'string' ? JSON.parse(json1) : json1;
      const obj2 = typeof json2 === 'string' ? JSON.parse(json2) : json2;
      
      // Convert to formatted strings for comparison
      const str1 = JSON.stringify(obj1, null, 2);
      const str2 = JSON.stringify(obj2, null, 2);
      
      const diff = diffLib.diffLines(str1, str2);
      const stats = getDiffStats(diff);
      
      sendJSON(res, formatSuccess({
        diff,
        stats,
        type: 'json'
      }));
    } catch (error) {
      sendJSON(res, formatError('Invalid JSON: ' + error.message), { status: 400 });
    }
  }
);

/**
 * Create unified diff patch
 */
diffRoute.post('/patch',
  cors(),
  body('oldText').notEmpty().withMessage('Old text is required'),
  body('newText').notEmpty().withMessage('New text is required'),
  body('oldFileName').optional().isString(),
  body('newFileName').optional().isString(),
  body('context').optional().isInt({ min: 0, max: 100 }),
  validateRequest,
  (req, res) => {
    const { 
      oldText, 
      newText, 
      oldFileName = 'old.txt', 
      newFileName = 'new.txt',
      context = 3
    } = req.body;
    
    const patch = diffLib.createPatch(
      oldFileName,
      oldText,
      newText,
      'Original',
      'Modified',
      { context }
    );
    
    sendJSON(res, formatSuccess({
      patch,
      oldFileName,
      newFileName,
      context
    }));
  }
);

/**
 * Create unified diff patch - Text response
 */
diffRoute.post('/patch/text',
  cors(),
  body('oldText').notEmpty(),
  body('newText').notEmpty(),
  validateRequest,
  (req, res) => {
    const { oldText, newText } = req.body;
    
    const patch = diffLib.createPatch(
      'original.txt',
      oldText,
      newText,
      'Original',
      'Modified'
    );
    
    sendText(res, patch);
  }
);

/**
 * Apply a patch
 */
diffRoute.post('/apply-patch',
  cors(),
  body('text').notEmpty().withMessage('Text is required'),
  body('patch').notEmpty().withMessage('Patch is required'),
  validateRequest,
  (req, res) => {
    try {
      const { text, patch } = req.body;
      const result = diffLib.applyPatch(text, patch);
      
      if (result === false) {
        sendJSON(res, formatError('Failed to apply patch'), { status: 400 });
      } else {
        sendJSON(res, formatSuccess({
          result,
          applied: true
        }));
      }
    } catch (error) {
      sendJSON(res, formatError('Error applying patch: ' + error.message), { status: 400 });
    }
  }
);

/**
 * Get diff summary
 */
diffRoute.post('/summary',
  cors(),
  body('text1').notEmpty().withMessage('Text1 is required'),
  body('text2').notEmpty().withMessage('Text2 is required'),
  body('type').optional().isIn(['chars', 'words', 'lines']),
  validateRequest,
  (req, res) => {
    const { text1, text2, type = 'lines' } = req.body;
    
    let diff;
    switch (type) {
      case 'chars':
        diff = diffLib.diffChars(text1, text2);
        break;
      case 'words':
        diff = diffLib.diffWords(text1, text2);
        break;
      default:
        diff = diffLib.diffLines(text1, text2);
    }
    
    const stats = getDiffStats(diff);
    const similarity = (stats.unchanged / stats.total * 100).toFixed(2);
    
    sendJSON(res, formatSuccess({
      stats,
      similarity: parseFloat(similarity),
      type,
      summary: {
        identical: text1 === text2,
        hasChanges: stats.additions > 0 || stats.deletions > 0,
        changeRatio: ((stats.additions + stats.deletions) / stats.total).toFixed(2)
      }
    }));
  }
);

/**
 * Help endpoint
 */
diffRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = formatSuccess({
    title: 'Text Diff Tool',
    message: 'Compare and analyze differences between texts',
    endpoints: {
      chars: {
        json: `POST ${host}/api/v1/tools/diff/chars`,
        text: `POST ${host}/api/v1/tools/diff/chars/text`
      },
      words: `POST ${host}/api/v1/tools/diff/words`,
      lines: {
        json: `POST ${host}/api/v1/tools/diff/lines`,
        text: `POST ${host}/api/v1/tools/diff/lines/text`
      },
      sentences: `POST ${host}/api/v1/tools/diff/sentences`,
      json: `POST ${host}/api/v1/tools/diff/json`,
      patch: {
        json: `POST ${host}/api/v1/tools/diff/patch`,
        text: `POST ${host}/api/v1/tools/diff/patch/text`
      },
      applyPatch: `POST ${host}/api/v1/tools/diff/apply-patch`,
      summary: `POST ${host}/api/v1/tools/diff/summary`
    },
    parameters: {
      text1: 'First text to compare',
      text2: 'Second text to compare',
      json1: 'First JSON object',
      json2: 'Second JSON object',
      ignoreCase: 'Ignore case differences (chars/words)',
      ignoreWhitespace: 'Ignore whitespace differences (lines)',
      type: 'Diff type: chars, words, or lines',
      context: 'Context lines for patch (default: 3)'
    },
    diffTypes: {
      chars: 'Character by character comparison',
      words: 'Word by word comparison',
      lines: 'Line by line comparison',
      sentences: 'Sentence by sentence comparison',
      json: 'JSON structure comparison'
    }
  });
  
  sendJSON(res, data);
});

module.exports = diffRoute;