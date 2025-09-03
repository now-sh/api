const getTodoModel = require('../models/todo');
const authController = require('./auth');

/**
 * Create a new todo
 */
const createTodo = async (userEmail, todoData) => {
  const userId = await authController.getUserId(userEmail);
  
  const Todo = getTodoModel();
  const todo = new Todo({
    ...todoData,
    owner: userId
  });
  
  await todo.save();
  
  return {
    id: todo._id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    isPublic: todo.isPublic,
    tags: todo.tags,
    dueDate: todo.dueDate,
    priority: todo.priority,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt
  };
};

/**
 * Get todos with public/private filtering
 */
const getTodos = async (userEmail = null, filters = {}) => {
  try {
    const Todo = getTodoModel();
    
    // Simple query for public todos only
    const todos = await Todo.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(50);
    
    return todos.map(todo => ({
      id: todo._id.toString(),
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      isPublic: todo.isPublic,
      tags: todo.tags || [],
      dueDate: todo.dueDate,
      priority: todo.priority,
      owner: 'anonymous',
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    }));
  } catch (error) {
    console.error('Error in getTodos:', error);
    return [];
  }
};

/**
 * Get a single todo by ID
 */
const getTodoById = async (todoId, userEmail = null) => {
  const Todo = getTodoModel();
  const todo = await Todo.findById(todoId);
  
  if (!todo) {
    throw new Error('Todo not found');
  }
  
  // Check access permissions
  if (!todo.isPublic) {
    if (!userEmail) {
      throw new Error('Authentication required to view private todos');
    }
    
    const canAccess = await authController.checkOwnership(userEmail, todo.owner);
    if (!canAccess) {
      throw new Error('You do not have permission to view this todo');
    }
  }
  
  const userId = userEmail ? await authController.getUserId(userEmail).catch(() => null) : null;
  
  return {
    id: todo._id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    isPublic: todo.isPublic,
    tags: todo.tags,
    dueDate: todo.dueDate,
    priority: todo.priority,
    owner: 'anonymous',
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt
  };
};

/**
 * Update a todo
 */
const updateTodo = async (todoId, userEmail, updates) => {
  const Todo = getTodoModel();
  const todo = await Todo.findById(todoId);
  
  if (!todo) {
    throw new Error('Todo not found');
  }
  
  // Check ownership
  const isOwner = await authController.checkOwnership(userEmail, todo.owner);
  if (!isOwner) {
    throw new Error('You do not have permission to update this todo');
  }
  
  // Update allowed fields
  const allowedUpdates = ['title', 'description', 'completed', 'isPublic', 'tags', 'dueDate', 'priority'];
  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      todo[field] = updates[field];
    }
  });
  
  await todo.save();
  
  return {
    id: todo._id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    isPublic: todo.isPublic,
    tags: todo.tags,
    dueDate: todo.dueDate,
    priority: todo.priority,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt
  };
};

/**
 * Delete a todo
 */
const deleteTodo = async (todoId, userEmail) => {
  const Todo = getTodoModel();
  const todo = await Todo.findById(todoId);
  
  if (!todo) {
    throw new Error('Todo not found');
  }
  
  // Check ownership
  const isOwner = await authController.checkOwnership(userEmail, todo.owner);
  if (!isOwner) {
    throw new Error('You do not have permission to delete this todo');
  }
  
  await todo.deleteOne();
  
  return { message: 'Todo deleted successfully' };
};

/**
 * Toggle todo completion
 */
const toggleTodoComplete = async (todoId, userEmail) => {
  const Todo = getTodoModel();
  const todo = await Todo.findById(todoId);
  
  if (!todo) {
    throw new Error('Todo not found');
  }
  
  // Check ownership
  const isOwner = await authController.checkOwnership(userEmail, todo.owner);
  if (!isOwner) {
    throw new Error('You do not have permission to update this todo');
  }
  
  todo.completed = !todo.completed;
  await todo.save();
  
  return {
    id: todo._id,
    completed: todo.completed,
    updatedAt: todo.updatedAt
  };
};

/**
 * Get todo statistics
 */
const getTodoStats = async (userEmail) => {
  const userId = await authController.getUserId(userEmail);
  
  const Todo = getTodoModel();
  const stats = await Todo.aggregate([
    {
      $match: { owner: userId }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
        },
        public: {
          $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$dueDate', null] },
                  { $lt: ['$dueDate', new Date()] },
                  { $eq: ['$completed', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    completed: 0,
    public: 0,
    highPriority: 0,
    overdue: 0
  };
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  getTodoStats
};