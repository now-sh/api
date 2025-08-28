require('dotenv').config();
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const cors = require('cors');

// Middleware
const checkAuth = require('../middleware/checkAuth');
const optionalAuth = require('../middleware/optionalAuth');
const { authLimiter } = require('../middleware/rateLimiter');

// Controllers
const todoController = require('../controllers/todo');
const authController = require('../controllers/auth');

const todoRoute = express.Router();


todoRoute.get(['/', '/help'], cors(), async (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  res.setHeader('Content-Type', 'application/json');
  try {
    res.json({
      title: 'Todo API',
      message: `The current api endpoint is ${host}/api/v1/todos`,
      endpoints: {
        list: `${host}/api/v1/todos/list`,
        create: `${host}/api/v1/todos/create`,
        get: `${host}/api/v1/todos/:id`,
        update: `${host}/api/v1/todos/:id`,
        delete: `${host}/api/v1/todos/:id`,
        toggle: `${host}/api/v1/todos/:id/toggle`,
        stats: `${host}/api/v1/todos/stats`,
        public: `${host}/api/v1/todos/public`
      },
      authentication: {
        required_for: ['create', 'update', 'delete', 'toggle', 'stats'],
        optional_for: ['list', 'get'],
        header: 'Authorization: Bearer YOUR_TOKEN'
      },
      visibility: {
        public_todos: 'Visible to everyone',
        private_todos: 'Visible only to owner'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

todoRoute.get('/list', cors(), optionalAuth, async (req, res) => {
  try {
    const filters = {
      completed: req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined,
      tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) : undefined,
      priority: req.query.priority,
      limit: Math.min(parseInt(req.query.limit) || 50, 100),
      userId: req.user ? await authController.getUserId(req.user).catch(() => null) : null
    };
    
    const todos = await todoController.getTodos(req.user, filters);
    
    res.json({
      success: true,
      data: todos,
      authenticated: req.isAuthenticated
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

todoRoute.get('/public', cors(), async (req, res) => {
  try {
    const filters = {
      limit: Math.min(parseInt(req.query.limit) || 50, 100)
    };
    
    // Force unauthenticated query to get only public todos
    const todos = await todoController.getTodos(null, filters);
    
    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

todoRoute.get('/stats', cors(), checkAuth, async (req, res) => {
  try {
    const stats = await todoController.getTodoStats(req.user);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
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
      return res.status(400).json({ 
        success: false,
        errors 
      });
    }

    try {
      const todo = await todoController.createTodo(req.user, req.body);
      
      res.status(201).json({
        success: true,
        data: todo
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

todoRoute.get('/:id', cors(), optionalAuth, async (req, res) => {
  try {
    const todo = await todoController.getTodoById(req.params.id, req.user);
    
    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('Authentication required') ? 401 :
                      error.message.includes('permission') ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
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
      return res.status(400).json({ 
        success: false,
        errors 
      });
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
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('permission') ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

todoRoute.delete('/:id', cors(), checkAuth, async (req, res) => {
  try {
    const result = await todoController.deleteTodo(req.params.id, req.user);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('permission') ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = todoRoute;