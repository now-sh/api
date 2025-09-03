require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body, query, param, validationResult } = require('express-validator');

// Middleware
const checkAuth = require('../middleware/checkAuth');
const optionalAuth = require('../middleware/optionalAuth');
const { authLimiter } = require('../middleware/rateLimiter');

// Controllers
const todoController = require('../controllers/todo');
const authController = require('../controllers/auth');
const { formatSuccess, formatError, sendJSON, sendText } = require('../controllers/responseFormatter');
const { formatValidationErrors } = require('../utils/validationHelper');

const todoRoute = express.Router();

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
 * List todos - JSON response
 */
todoRoute.get('/list', cors(), optionalAuth, async (req, res) => {
  try {
    const filters = {
      completed: req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined,
      tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) : undefined,
      priority: req.query.priority,
      limit: Math.min(parseInt(req.query.limit) || 50, 100)
    };
    
    const todos = await todoController.getTodos(req.user, filters);
    
    sendJSON(res, formatSuccess({
      todos,
      count: todos.length,
      filters,
      authenticated: req.isAuthenticated
    }));
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 500 });
  }
});

/**
 * List public todos - JSON response
 */
todoRoute.get('/public', cors(), async (req, res) => {\n  try {\n    const filters = {\n      limit: Math.min(parseInt(req.query.limit) || 50, 100)\n    };\n    \n    // Force unauthenticated query to get only public todos\n    const todos = await todoController.getTodos(null, filters);\n    \n    sendJSON(res, formatSuccess({\n      todos,\n      count: todos.length,\n      type: 'public',\n      limit: filters.limit\n    }));\n  } catch (error) {\n    sendJSON(res, formatError(error.message), { status: 500 });\n  }\n});

todoRoute.get('/stats', cors(), checkAuth, async (req, res) => {
  try {
    const stats = await todoController.getTodoStats(req.user);
    
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

todoRoute.post(
  '/create',
  cors(),
  checkAuth,
  authLimiter,
  body('title').notEmpty().trim().isLength({ max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
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
      const todo = await todoController.createTodo(req.user, req.body);
      
      const data = {
        success: true,
        data: todo
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

todoRoute.get('/:id', cors(), optionalAuth, async (req, res) => {
  try {
    const todo = await todoController.getTodoById(req.params.id, req.user);
    
    const data = {
      success: true,
      data: todo
    };
    setStandardHeaders(res, data);
    res.json(data);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('Authentication required') ? 401 :
                      error.message.includes('permission') ? 403 : 500;
    
    const data = {
      success: false,
      error: error.message
    };
    setStandardHeaders(res, data);
    res.status(statusCode).json(data);
  }
});

todoRoute.put(
  '/:id',
  cors(),
  checkAuth,
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('completed').optional().isBoolean().withMessage('completed must be a boolean'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
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
      const todo = await todoController.updateTodo(req.params.id, req.user, req.body);
      
      res.json({
        success: true,
        data: todo
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

todoRoute.patch('/:id/toggle', cors(), checkAuth, async (req, res) => {
  try {
    const result = await todoController.toggleTodoComplete(req.params.id, req.user);
    
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

todoRoute.delete('/:id', cors(), checkAuth, async (req, res) => {
  try {
    const result = await todoController.deleteTodo(req.params.id, req.user);
    
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

module.exports = todoRoute;