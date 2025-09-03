require('dotenv').config();
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const cors = require('cors');

// Middleware
const checkAuth = require('../middleware/checkAuth');
const optionalAuth = require('../middleware/optionalAuth');
const { authLimiter } = require('../middleware/rateLimiter');

// Controller
const notesController = require('../controllers/notes');
const { setStandardHeaders } = require('../utils/standardHeaders');

const notesRoute = express.Router();


notesRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  try {
    const data = {
      title: 'Notes API',
      message: `The current api endpoint is ${host}/api/v1/notes`,
      endpoints: {
        list: `${host}/api/v1/notes/list`,
        search: `${host}/api/v1/notes/search`,
        create: `${host}/api/v1/notes/create`,
        get: `${host}/api/v1/notes/:id`,
        update: `${host}/api/v1/notes/:id`,
        delete: `${host}/api/v1/notes/:id`,
        toggle_pin: `${host}/api/v1/notes/:id/pin`,
        collaborators: {
          add: `${host}/api/v1/notes/:id/collaborators`,
          remove: `${host}/api/v1/notes/:id/collaborators/:email`
        },
        public_endpoints: {
          gists: `${host}/api/v1/notes/gists`,
          popular: `${host}/api/v1/notes/popular`
        },
        stats: `${host}/api/v1/notes/stats`
      },
      features: {
        google_keep_style: 'Color coding, pinning, tags',
        opengist_style: 'Code snippets with syntax highlighting',
        collaboration: 'Share notes with view/edit permissions',
        search: 'Full text search across notes',
        visibility: 'Public/private notes and gists'
      }
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (err) {
    const data = { error: err.message };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

notesRoute.get('/list', cors(), optionalAuth, async (req, res) => {
  try {
    const options = {
      isGist: req.query.isGist === 'true' ? true : req.query.isGist === 'false' ? false : undefined,
      tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) : undefined,
      contentType: req.query.contentType,
      language: req.query.language,
      sortBy: req.query.sortBy,
      limit: Math.min(parseInt(req.query.limit) || 50, 100)
    };
    
    const notes = await notesController.getNotes(req.user, options);
    
    const data = {
      success: true,
      data: notes,
      authenticated: req.isAuthenticated
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { 
      success: false,
      error: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

notesRoute.get('/search', cors(), optionalAuth, async (req, res) => {
  try {
    if (!req.query.q) {
      const data = {
        success: false,
        error: 'Search query (q) is required'
      };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }
    
    const options = {
      search: req.query.q,
      limit: Math.min(parseInt(req.query.limit) || 50, 100)
    };
    
    const notes = await notesController.getNotes(req.user, options);
    
    const data = {
      success: true,
      data: notes,
      query: req.query.q
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { 
      success: false,
      error: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

notesRoute.get('/gists', cors(), async (req, res) => {
  try {
    const options = {
      isGist: true,
      language: req.query.language,
      limit: Math.min(parseInt(req.query.limit) || 50, 100)
    };
    
    // Force unauthenticated query for public gists only
    const notes = await notesController.getNotes(null, options);
    
    const data = {
      success: true,
      data: notes
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { 
      success: false,
      error: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

notesRoute.get('/popular', cors(), async (req, res) => {
  try {
    const options = {
      isGist: req.query.isGist === 'true' ? true : req.query.isGist === 'false' ? false : undefined,
      limit: Math.min(parseInt(req.query.limit) || 20, 50)
    };
    
    const notes = await notesController.getPopularNotes(options);
    
    const data = {
      success: true,
      data: notes
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { 
      success: false,
      error: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

notesRoute.get('/stats', cors(), checkAuth, async (req, res) => {
  try {
    const stats = await notesController.getNoteStats(req.user);
    
    const data = {
      success: true,
      data: stats
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const data = { 
      success: false,
      error: error.message 
    };
    setStandardHeaders(res, data);
    res.status(500).json(data);
  }
});

notesRoute.post(
  '/create',
  cors(),
  checkAuth,
  authLimiter,
  body('content').notEmpty().isLength({ max: 50000 }).withMessage('Content is required and must be less than 50000 characters'),
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
  body('contentType').optional().isIn(['text', 'markdown', 'code']).withMessage('Content type must be text, markdown, or code'),
  body('language').optional().trim(),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('isGist').optional().isBoolean().withMessage('isGist must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('color').optional().trim(),
  body('isPinned').optional().isBoolean().withMessage('isPinned must be a boolean'),
  async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const errors = validationErrors.array().map((error) => ({
        msg: error.msg,
        field: error.param
      }));
      const data = { 
        success: false,
        errors 
      };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }

    try {
      const note = await notesController.createNote(req.user, req.body);
      
      const data = {
        success: true,
        data: note
      };
      setStandardHeaders(res, data);
      res.status(201).json(data);
    } catch (error) {
      const data = {
        success: false,
        error: error.message
      };
      setStandardHeaders(res, data);
      res.status(500).json(data);
    }
  }
);

notesRoute.get('/:id', cors(), optionalAuth, async (req, res) => {
  try {
    const note = await notesController.getNoteById(req.params.id, req.user);
    
    const data = {
      success: true,
      data: note
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('permission') ? 403 : 500;
    
    const data = {
      success: false,
      error: error.message
    };
    setStandardHeaders(res, data);
    res.status(statusCode).json(data);
  }
});

notesRoute.put(
  '/:id',
  cors(),
  checkAuth,
  body('content').optional().isLength({ max: 50000 }).withMessage('Content must be less than 50000 characters'),
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
  body('contentType').optional().isIn(['text', 'markdown', 'code']).withMessage('Content type must be text, markdown, or code'),
  body('language').optional().trim(),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('isGist').optional().isBoolean().withMessage('isGist must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('color').optional().trim(),
  body('isPinned').optional().isBoolean().withMessage('isPinned must be a boolean'),
  async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const errors = validationErrors.array().map((error) => ({
        msg: error.msg,
        field: error.param
      }));
      const data = { 
        success: false,
        errors 
      };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }

    try {
      const note = await notesController.updateNote(req.params.id, req.user, req.body);
      
      res.json({
        success: true,
        data: note
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
);

notesRoute.patch('/:id/pin', cors(), checkAuth, async (req, res) => {
  try {
    const result = await notesController.toggleNotePinned(req.params.id, req.user);
    
    const data = {
      success: true,
      data: result
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('permission') ? 403 : 500;
    
    const data = {
      success: false,
      error: error.message
    };
    setStandardHeaders(res, data);
    res.status(statusCode).json(data);
  }
});

notesRoute.post(
  '/:id/collaborators',
  cors(),
  checkAuth,
  body('email').isEmail().withMessage('Valid email is required'),
  body('permission').optional().isIn(['view', 'edit']).withMessage('Permission must be view or edit'),
  async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const errors = validationErrors.array().map((error) => ({
        msg: error.msg,
        field: error.param
      }));
      const data = { 
        success: false,
        errors 
      };
      setStandardHeaders(res, data);
      return res.status(400).json(data);
    }

    try {
      const note = await notesController.addCollaborator(
        req.params.id, 
        req.user, 
        req.body.email, 
        req.body.permission || 'view'
      );
      
      res.json({
        success: true,
        data: note
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('permission') ? 403 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
);

notesRoute.delete('/:id/collaborators/:email', cors(), checkAuth, async (req, res) => {
  try {
    const note = await notesController.removeCollaborator(
      req.params.id, 
      req.user, 
      req.params.email
    );
    
    const data = {
      success: true,
      data: note
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('permission') ? 403 : 500;
    
    const data = {
      success: false,
      error: error.message
    };
    setStandardHeaders(res, data);
    res.status(statusCode).json(data);
  }
});

notesRoute.delete('/:id', cors(), checkAuth, async (req, res) => {
  try {
    const result = await notesController.deleteNote(req.params.id, req.user);
    
    const data = {
      success: true,
      data: result
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('permission') ? 403 : 500;
    
    const data = {
      success: false,
      error: error.message
    };
    setStandardHeaders(res, data);
    res.status(statusCode).json(data);
  }
});

module.exports = notesRoute;