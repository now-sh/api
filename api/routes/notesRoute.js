// dotenv loaded in index.js
const express = require('express');
const cors = require('cors');
const { body, query, param, validationResult } = require('express-validator');

// Middleware
const checkAuth = require('../middleware/checkAuth');
const optionalAuth = require('../middleware/optionalAuth');
const { authLimiter } = require('../middleware/rateLimiter');

// Controllers
const notesController = require('../controllers/notes');
const { formatSuccess, formatError, sendJSON } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const notesRoute = express.Router();

/**
 * Validation middleware
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendJSON(res, formatError('Validation failed', {
      details: formatValidationErrors(errors.array())
    }), { status: 400 });
    return;
  }
  next();
}

/**
 * List notes - JSON response
 */
notesRoute.get('/list', cors(), optionalAuth, async (req, res) => {
  try {
    const filters = {
      tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) : undefined,
      pinned: req.query.pinned === 'true' ? true : req.query.pinned === 'false' ? false : undefined,
      limit: Math.min(parseInt(req.query.limit) || 50, 100)
    };
    
    const notes = await notesController.getNotes(req.user, filters);
    
    sendJSON(res, formatSuccess({
      notes,
      count: notes.length,
      filters,
      authenticated: req.isAuthenticated
    }));
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 500 });
  }
});

/**
 * Search notes - JSON response
 */
notesRoute.get('/search',
  cors(),
  optionalAuth,
  query('q').notEmpty().withMessage('Search query is required'),
  validateRequest,
  async (req, res) => {
    try {
      const results = await notesController.searchNotes(req.query.q, req.user, {
        limit: Math.min(parseInt(req.query.limit) || 20, 50)
      });
      
      sendJSON(res, formatSuccess({
        query: req.query.q,
        results,
        count: results.length,
        authenticated: req.isAuthenticated
      }));
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Get note statistics - JSON response
 */
notesRoute.get('/stats', cors(), checkAuth, async (req, res) => {
  try {
    const stats = await notesController.getNoteStats(req.user);
    
    sendJSON(res, formatSuccess({
      totalNotes: stats.total,
      publicNotes: stats.public,
      privateNotes: stats.private,
      pinnedNotes: stats.pinned,
      tagBreakdown: stats.tagBreakdown,
      collaborationStats: stats.collaborationStats
    }));
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 500 });
  }
});

/**
 * Create note - JSON response
 */
notesRoute.post('/create',
  cors(),
  checkAuth,
  authLimiter,
  body('title').notEmpty().trim().isLength({ max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('content').notEmpty().trim().isLength({ max: 50000 }).withMessage('Content is required and must be less than 50000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color'),
  body('type').optional().isIn(['note', 'gist']).withMessage('Type must be note or gist'),
  validateRequest,
  async (req, res) => {
    try {
      const noteData = {
        title: req.body.title,
        content: req.body.content,
        isPublic: req.body.isPublic || false,
        tags: req.body.tags || [],
        color: req.body.color,
        type: req.body.type || 'note'
      };
      
      const newNote = await notesController.createNote(req.user, noteData);
      
      sendJSON(res, formatSuccess({
        message: 'Note created successfully',
        note: newNote
      }), { status: 201 });
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Get specific note - JSON response
 */
notesRoute.get('/:id',
  cors(),
  optionalAuth,
  param('id').notEmpty().withMessage('Note ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      const note = await notesController.getNoteById(req.params.id, req.user);
      
      sendJSON(res, formatSuccess({
        note
      }));
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('access denied') ? 403 : 500;
      sendJSON(res, formatError(error.message), { status: statusCode });
    }
  }
);

/**
 * Update note - JSON response
 */
notesRoute.put('/:id',
  cors(),
  checkAuth,
  param('id').notEmpty().withMessage('Note ID is required'),
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
  body('content').optional().trim().isLength({ max: 50000 }).withMessage('Content must be less than 50000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color'),
  validateRequest,
  async (req, res) => {
    try {
      const updatedNote = await notesController.updateNote(req.params.id, req.user, req.body);
      
      sendJSON(res, formatSuccess({
        message: 'Note updated successfully',
        note: updatedNote
      }));
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('access denied') ? 403 : 500;
      sendJSON(res, formatError(error.message), { status: statusCode });
    }
  }
);

/**
 * Delete note - JSON response
 */
notesRoute.delete('/:id',
  cors(),
  checkAuth,
  param('id').notEmpty().withMessage('Note ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      await notesController.deleteNote(req.params.id, req.user);
      
      sendJSON(res, formatSuccess({
        message: 'Note deleted successfully',
        noteId: req.params.id,
        deleted: true
      }));
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('access denied') ? 403 : 500;
      sendJSON(res, formatError(error.message), { status: statusCode });
    }
  }
);

/**
 * Help endpoint
 */
notesRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'Notes API',
    message: 'Create and manage notes with Google Keep and Gist-like features',
    endpoints: {
      list: `GET ${host}/api/v1/data/notes/list`,
      search: `GET ${host}/api/v1/data/notes/search?q=query`,
      stats: `GET ${host}/api/v1/data/notes/stats`,
      create: `POST ${host}/api/v1/data/notes/create`,
      get: `GET ${host}/api/v1/data/notes/:id`,
      update: `PUT ${host}/api/v1/data/notes/:id`,
      delete: `DELETE ${host}/api/v1/data/notes/:id`
    },
    authentication: {
      required: ['create', 'update', 'delete', 'stats'],
      optional: ['list', 'get', 'search'],
      header: 'Authorization: Bearer YOUR_TOKEN'
    },
    parameters: {
      title: 'Note title (required for create, max 200 chars)',
      content: 'Note content (required for create, max 50000 chars)',
      isPublic: 'Make note visible to everyone (boolean)',
      tags: 'Array of tags for categorization',
      color: 'Color code for note (hex format)',
      type: 'Note type (note or gist)'
    },
    queryParams: {
      tags: 'Filter by tags (array or single tag)',
      pinned: 'Filter by pinned status (true/false)',
      limit: 'Number of notes to return (max 100)',
      q: 'Search query for content search'
    },
    examples: {
      list: `GET ${host}/api/v1/data/notes/list?tags=work&limit=20`,
      search: `GET ${host}/api/v1/data/notes/search?q=javascript`,
      create: `POST ${host}/api/v1/data/notes/create {"title": "My Note", "content": "Note content", "tags": ["work"], "isPublic": true}`,
      update: `PUT ${host}/api/v1/data/notes/123 {"title": "Updated title", "color": "#ff0000"}`,
      delete: `DELETE ${host}/api/v1/data/notes/123`
    },
    features: {
      google_keep_style: 'Color coding, pinning, tags',
      opengist_style: 'Code snippets with syntax highlighting',
      collaboration: 'Share notes with view/edit permissions',
      search: 'Full text search across notes',
      visibility: 'Public/private notes and gists'
    }
  });
  
  sendJSON(res, data);
});

module.exports = notesRoute;