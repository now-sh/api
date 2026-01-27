const express = require('express');
const cors = require('cors');
const cronParser = require('cron-parser');
const cronstrue = require('cronstrue');
const { body, query, validationResult } = require('express-validator');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');

const cronRoute = express.Router();

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
 * Parse cron expression and get details
 */
function parseCronExpression(expression, options = {}) {
  try {
    const interval = cronParser.parseExpression(expression, {
      currentDate: options.currentDate || new Date(),
      tz: options.timezone || 'UTC'
    });
    
    const fields = interval.fields;
    const next = [];
    const prev = [];
    
    // Get next occurrences
    for (let i = 0; i < (options.occurrences || 5); i++) {
      if (interval.hasNext()) {
        next.push(interval.next().toISOString());
      }
    }
    
    // Reset and get previous occurrences
    interval.reset();
    for (let i = 0; i < (options.occurrences || 5); i++) {
      if (interval.hasPrev()) {
        prev.unshift(interval.prev().toISOString());
      }
    }
    
    return {
      expression,
      description: cronstrue.toString(expression),
      fields: {
        second: fields.second || null,
        minute: fields.minute,
        hour: fields.hour,
        dayOfMonth: fields.dayOfMonth,
        month: fields.month,
        dayOfWeek: fields.dayOfWeek
      },
      next,
      prev
    };
  } catch (error) {
    throw new Error(`Invalid cron expression: ${error.message}`);
  }
}

/**
 * Parse cron expression - JSON response
 */
cronRoute.get('/parse',
  cors(),
  query('expression').notEmpty().withMessage('Expression is required'),
  query('occurrences').optional().isInt({ min: 1, max: 100 }),
  query('timezone').optional().isString(),
  validateRequest,
  (req, res) => {
    try {
      const { expression, occurrences, timezone } = req.query;
      const result = parseCronExpression(expression, { 
        occurrences: parseInt(occurrences) || 5,
        timezone 
      });
      
      sendJSON(res, formatSuccess(result));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Parse cron expression - Text response
 */
cronRoute.get('/parse/text',
  cors(),
  query('expression').notEmpty().withMessage('Expression is required'),
  validateRequest,
  (req, res) => {
    try {
      const { expression } = req.query;
      const result = parseCronExpression(expression);
      sendText(res, result.description);
    } catch (error) {
      sendText(res, `Error: ${error.message}`);
    }
  }
);

/**
 * Describe cron expression in human readable format
 */
cronRoute.get('/describe',
  cors(),
  query('expression').notEmpty().withMessage('Expression is required'),
  query('verbose').optional().isBoolean(),
  validateRequest,
  (req, res) => {
    try {
      const { expression, verbose } = req.query;
      
      const options = {
        verbose: verbose === 'true',
        use24HourTimeFormat: false,
        throwExceptionOnParseError: true
      };
      
      const description = cronstrue.toString(expression, options);
      
      sendJSON(res, formatSuccess({
        expression,
        description,
        verbose: options.verbose
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Get next run times
 */
cronRoute.get('/next',
  cors(),
  query('expression').notEmpty().withMessage('Expression is required'),
  query('count').optional().isInt({ min: 1, max: 100 }),
  query('timezone').optional().isString(),
  validateRequest,
  (req, res) => {
    try {
      const { expression, count = 10, timezone } = req.query;
      
      const interval = cronParser.parseExpression(expression, {
        tz: timezone || 'UTC'
      });
      
      const occurrences = [];
      for (let i = 0; i < parseInt(count); i++) {
        if (interval.hasNext()) {
          const next = interval.next();
          occurrences.push({
            date: next.toISOString(),
            timestamp: next.getTime(),
            formatted: next.toString()
          });
        }
      }
      
      sendJSON(res, formatSuccess({
        expression,
        timezone: timezone || 'UTC',
        occurrences,
        count: occurrences.length
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 400 });
    }
  }
);

/**
 * Validate cron expression
 */
cronRoute.post('/validate',
  cors(),
  body('expression').notEmpty().withMessage('Expression is required'),
  validateRequest,
  (req, res) => {
    const { expression } = req.body;
    try {
      cronParser.parseExpression(expression);

      sendJSON(res, formatSuccess({
        expression,
        valid: true,
        description: cronstrue.toString(expression)
      }));
    } catch (error) {
      sendJSON(res, formatSuccess({
        expression,
        valid: false,
        error: error.message
      }));
    }
  }
);

/**
 * Generate cron expression from components
 */
cronRoute.post('/generate',
  cors(),
  body('minute').optional().isString(),
  body('hour').optional().isString(),
  body('dayOfMonth').optional().isString(),
  body('month').optional().isString(),
  body('dayOfWeek').optional().isString(),
  body('second').optional().isString(),
  validateRequest,
  (req, res) => {
    try {
      const {
        minute = '*',
        hour = '*',
        dayOfMonth = '*',
        month = '*',
        dayOfWeek = '*',
        second
      } = req.body;
      
      let expression;
      if (second !== undefined) {
        expression = `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
      } else {
        expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
      }
      
      // Validate the generated expression
      const result = parseCronExpression(expression);
      
      sendJSON(res, formatSuccess({
        expression,
        description: result.description,
        next: result.next.slice(0, 3)
      }));
    } catch (error) {
      sendJSON(res, formatError(`Invalid cron expression: ${error.message}`), { status: 400 });
    }
  }
);

/**
 * Common cron expressions
 */
cronRoute.get('/common', cors(), (req, res) => {
  const common = [
    { expression: '0 0 * * *', description: 'Daily at midnight', alias: 'daily' },
    { expression: '0 0 * * 0', description: 'Weekly on Sunday at midnight', alias: 'weekly' },
    { expression: '0 0 1 * *', description: 'Monthly on the 1st at midnight', alias: 'monthly' },
    { expression: '0 0 1 1 *', description: 'Yearly on January 1st at midnight', alias: 'yearly' },
    { expression: '*/5 * * * *', description: 'Every 5 minutes', alias: 'every-5-minutes' },
    { expression: '*/15 * * * *', description: 'Every 15 minutes', alias: 'every-15-minutes' },
    { expression: '0 * * * *', description: 'Every hour', alias: 'hourly' },
    { expression: '0 9-17 * * 1-5', description: 'Every hour from 9 AM to 5 PM on weekdays', alias: 'business-hours' },
    { expression: '0 0 * * 1-5', description: 'Every weekday at midnight', alias: 'weekdays' },
    { expression: '0 0 * * 6,0', description: 'Every weekend at midnight', alias: 'weekends' }
  ];
  
  sendJSON(res, formatSuccess({
    expressions: common,
    count: common.length
  }));
});

/**
 * Help endpoint
 */
cronRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  const data = formatSuccess({
    title: 'Cron Expression Parser',
    message: 'Parse, validate, and describe cron expressions',
    endpoints: {
      parse: {
        json: `${host}/api/v1/tools/cron/parse?expression=*/5 * * * *`,
        text: `${host}/api/v1/tools/cron/parse/text?expression=*/5 * * * *`
      },
      describe: `${host}/api/v1/tools/cron/describe?expression=0 0 * * *`,
      next: `${host}/api/v1/tools/cron/next?expression=0 0 * * *&count=10`,
      validate: `POST ${host}/api/v1/tools/cron/validate`,
      generate: `POST ${host}/api/v1/tools/cron/generate`,
      common: `${host}/api/v1/tools/cron/common`
    },
    parameters: {
      expression: 'Cron expression (e.g., "0 0 * * *")',
      occurrences: 'Number of occurrences to show (default: 5)',
      count: 'Number of next run times (default: 10)',
      timezone: 'Timezone for calculations (default: UTC)',
      verbose: 'Verbose descriptions (true/false)'
    },
    format: {
      standard: 'minute hour dayOfMonth month dayOfWeek',
      extended: 'second minute hour dayOfMonth month dayOfWeek'
    },
    examples: {
      daily: '0 0 * * * (Daily at midnight)',
      hourly: '0 * * * * (Every hour)',
      everyFiveMinutes: '*/5 * * * * (Every 5 minutes)',
      weekdays: '0 9 * * 1-5 (Every weekday at 9 AM)'
    }
  });
  
  sendJSON(res, data);
});

module.exports = cronRoute;