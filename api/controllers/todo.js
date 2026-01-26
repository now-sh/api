const Todo = require('../models/todo');
const authController = require('./auth');
const { createRepository, toObjectId } = require('../utils/databaseUtils');
const { getDueDateLabel } = require('../utils/dateUtils');
const { logError } = require('../utils/errorUtils');

/**
 * Create todo repository with standardized CRUD operations
 */
const todoRepo = createRepository(Todo, {
  ownerField: 'owner',
  publicField: 'isPublic',
  defaultSort: { createdAt: -1 },
  defaultLimit: 50,
  allowedUpdates: ['title', 'description', 'completed', 'isPublic', 'tags', 'dueDate', 'priority'],
  formatResponse: (todo) => {
    // Add friendly due date label if dueDate exists
    if (todo.dueDate) {
      const dueDateInfo = getDueDateLabel(todo.dueDate);
      todo.dueDateLabel = dueDateInfo.label;
      todo.isOverdue = dueDateInfo.isOverdue;
    }
    return todo;
  }
});

/**
 * Helper to get userId from email (returns null on failure)
 */
const getUserIdSafe = async (userEmail) => {
  if (!userEmail) return null;
  try {
    return await authController.getUserId(userEmail);
  } catch {
    return null;
  }
};

/**
 * Create a new todo
 */
const createTodo = async (userEmail, todoData) => {
  const userId = await authController.getUserId(userEmail);
  return todoRepo.create(todoData, userId);
};

/**
 * Get todos with public/private filtering
 */
const getTodos = async (userEmail = null, filters = {}) => {
  try {
    const userId = await getUserIdSafe(userEmail);
    return todoRepo.find(filters, { userId });
  } catch (error) {
    logError('getTodos', error);
    return [];
  }
};

/**
 * Get a single todo by ID
 */
const getTodoById = async (todoId, userEmail = null) => {
  const userId = await getUserIdSafe(userEmail);
  const todo = await todoRepo.findById(todoId, { userId });

  if (!todo) {
    throw new Error('Todo not found');
  }

  return todo;
};

/**
 * Update a todo
 */
const updateTodo = async (todoId, userEmail, updates) => {
  const userId = await authController.getUserId(userEmail);
  return todoRepo.update(todoId, updates, userId);
};

/**
 * Delete a todo
 */
const deleteTodo = async (todoId, userEmail) => {
  const userId = await authController.getUserId(userEmail);
  await todoRepo.delete(todoId, userId);
  return { message: 'Todo deleted successfully' };
};

/**
 * Toggle todo completion
 */
const toggleTodoComplete = async (todoId, userEmail) => {
  const userId = await authController.getUserId(userEmail);

  // Get current todo to check ownership and get current state
  const todo = await Todo.findById(todoId);

  if (!todo) {
    throw new Error('Todo not found');
  }

  // Check ownership
  if (todo.owner?.toString() !== userId) {
    throw new Error('You do not have permission to update this todo');
  }

  // Toggle and save
  todo.completed = !todo.completed;
  await todo.save();

  return {
    id: todo._id.toString(),
    completed: todo.completed,
    updatedAt: todo.updatedAt
  };
};

/**
 * Get todo statistics for a user
 */
const getTodoStats = async (userEmail) => {
  const userId = await authController.getUserId(userEmail);
  const ownerObjectId = toObjectId(userId);

  const stats = await todoRepo.aggregate([
    {
      $match: { owner: ownerObjectId }
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
  ], { includePrivate: true });

  return stats[0] || {
    total: 0,
    completed: 0,
    public: 0,
    highPriority: 0,
    overdue: 0
  };
};

/**
 * Get paginated todos
 */
const getTodosPaginated = async (userEmail = null, options = {}) => {
  const userId = await getUserIdSafe(userEmail);
  const { page = 1, limit = 20, ...filters } = options;

  return todoRepo.paginate(filters, { userId, page, limit });
};

/**
 * Get user's own todos
 */
const getMyTodos = async (userEmail, options = {}) => {
  const userId = await authController.getUserId(userEmail);
  return todoRepo.findByOwner(userId, options);
};

/**
 * Search todos
 */
const searchTodos = async (searchTerm, userEmail = null) => {
  const userId = await getUserIdSafe(userEmail);
  return todoRepo.search(searchTerm, { userId });
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  getTodoStats,
  getTodosPaginated,
  getMyTodos,
  searchTodos,
  // Expose repo for advanced usage
  todoRepo
};
