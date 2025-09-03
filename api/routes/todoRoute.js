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
todoRoute.get('/public', cors(), async (req, res) => {
  try {
    const filters = {
      limit: Math.min(parseInt(req.query.limit) || 50, 100)
    };
    
    const todos = await todoController.getTodos(null, filters);
    
    sendJSON(res, formatSuccess({
      todos,
      count: todos.length,
      type: 'public',
      limit: filters.limit
    }));
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 500 });
  }
});

/**
 * Get todo statistics - JSON response
 */
todoRoute.get('/stats', cors(), checkAuth, async (req, res) => {
  try {
    const stats = await todoController.getTodoStats(req.user);
    
    sendJSON(res, formatSuccess({
      totalTodos: stats.total,
      completedTodos: stats.completed,
      pendingTodos: stats.pending,
      completionRate: stats.completionRate,
      priorityBreakdown: stats.priorityBreakdown,
      tagBreakdown: stats.tagBreakdown
    }));
  } catch (error) {
    sendJSON(res, formatError(error.message), { status: 500 });
  }
});

/**
 * Create todo - JSON response
 */
todoRoute.post('/create',
  cors(),
  checkAuth,
  authLimiter,
  body('title').notEmpty().trim().isLength({ max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  validateRequest,
  async (req, res) => {
    try {
      const todoData = {
        title: req.body.title,
        description: req.body.description,
        isPublic: req.body.isPublic || false,
        tags: req.body.tags || [],
        priority: req.body.priority || 'medium',
        dueDate: req.body.dueDate
      };
      
      const newTodo = await todoController.createTodo(req.user, todoData);
      
      sendJSON(res, formatSuccess({
        message: 'Todo created successfully',
        todo: newTodo
      }), { status: 201 });
    } catch (error) {
      sendJSON(res, formatError(error.message), { status: 500 });
    }
  }
);

/**
 * Get specific todo - JSON response
 */
todoRoute.get('/:id',
  cors(),
  optionalAuth,
  param('id').notEmpty().withMessage('Todo ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      const todo = await todoController.getTodoById(req.params.id, req.user);
      
      sendJSON(res, formatSuccess({
        todo
      }));
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('access denied') ? 403 : 500;
      sendJSON(res, formatError(error.message), { status: statusCode });
    }
  }
);

/**
 * Update todo - JSON response
 */
todoRoute.put('/:id',
  cors(),
  checkAuth,
  param('id').notEmpty().withMessage('Todo ID is required'),
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  validateRequest,
  async (req, res) => {
    try {
      const updatedTodo = await todoController.updateTodo(req.params.id, req.user, req.body);
      
      sendJSON(res, formatSuccess({
        message: 'Todo updated successfully',
        todo: updatedTodo
      }));
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('access denied') ? 403 : 500;
      sendJSON(res, formatError(error.message), { status: statusCode });
    }
  }
);

/**
 * Toggle todo completion - JSON response
 */
todoRoute.patch('/:id/toggle',
  cors(),
  checkAuth,
  param('id').notEmpty().withMessage('Todo ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      const updatedTodo = await todoController.toggleTodo(req.params.id, req.user);
      
      sendJSON(res, formatSuccess({
        message: 'Todo toggled successfully',
        todo: updatedTodo,
        completed: updatedTodo.completed
      }));
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('access denied') ? 403 : 500;
      sendJSON(res, formatError(error.message), { status: statusCode });
    }
  }
);

/**
 * Delete todo - JSON response
 */
todoRoute.delete('/:id',
  cors(),
  checkAuth,
  param('id').notEmpty().withMessage('Todo ID is required'),
  validateRequest,
  async (req, res) => {
    try {
      await todoController.deleteTodo(req.params.id, req.user);
      
      sendJSON(res, formatSuccess({
        message: 'Todo deleted successfully',
        todoId: req.params.id,
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
todoRoute.get(['/', '/help'], cors(), (req, res) => {
  const host = `${req.protocol}://${req.headers.host}`;
  
  const data = formatSuccess({
    title: 'Todo API',
    message: 'Create and manage todos with public/private visibility',
    endpoints: {
      list: `GET ${host}/api/v1/data/todos/list`,
      public: `GET ${host}/api/v1/data/todos/public`,
      stats: `GET ${host}/api/v1/data/todos/stats`,
      create: `POST ${host}/api/v1/data/todos/create`,
      get: `GET ${host}/api/v1/data/todos/:id`,
      update: `PUT ${host}/api/v1/data/todos/:id`,
      toggle: `PATCH ${host}/api/v1/data/todos/:id/toggle`,
      delete: `DELETE ${host}/api/v1/data/todos/:id`
    },
    authentication: {
      required: ['create', 'update', 'toggle', 'delete', 'stats'],
      optional: ['list', 'get'],
      header: 'Authorization: Bearer YOUR_TOKEN'
    },
    parameters: {
      title: 'Todo title (required for create, max 200 chars)',
      description: 'Todo description (optional, max 1000 chars)',
      isPublic: 'Make todo visible to everyone (boolean)',
      tags: 'Array of tags for categorization',
      priority: 'Priority level (low, medium, high)',
      dueDate: 'Due date in ISO 8601 format',
      completed: 'Completion status (boolean)'
    },
    queryParams: {
      completed: 'Filter by completion status (true/false)',
      priority: 'Filter by priority (low/medium/high)',
      tags: 'Filter by tags (array or single tag)',
      limit: 'Number of todos to return (max 100)'
    },
    examples: {
      list: `GET ${host}/api/v1/data/todos/list?completed=false&limit=20`,
      public: `GET ${host}/api/v1/data/todos/public?limit=10`,
      create: `POST ${host}/api/v1/data/todos/create {"title": "Learn Node.js", "priority": "high", "isPublic": true}`,
      update: `PUT ${host}/api/v1/data/todos/123 {"title": "Updated title", "completed": true}`,
      toggle: `PATCH ${host}/api/v1/data/todos/123/toggle`,
      delete: `DELETE ${host}/api/v1/data/todos/123`
    },
    visibility: {
      public: 'Visible to everyone, included in public endpoint',
      private: 'Visible only to the owner when authenticated'
    }
  });
  
  sendJSON(res, data);
});

module.exports = todoRoute;