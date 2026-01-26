const Note = require('../models/note');
const authController = require('./auth');
const { createRepository, toObjectId } = require('../utils/databaseUtils');
const { logError } = require('../utils/errorUtils');
const { formatLastUpdated, getRelativeTimeLabel } = require('../utils/dateUtils');

/**
 * Create note repository with standardized CRUD operations
 */
const noteRepo = createRepository(Note, {
  ownerField: 'owner',
  publicField: 'isPublic',
  defaultSort: { isPinned: -1, createdAt: -1 },
  defaultLimit: 50,
  allowedUpdates: [
    'title', 'content', 'contentType', 'language', 'isPublic',
    'isGist', 'tags', 'color', 'isPinned', 'attachments'
  ]
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
 * Format note response with owner and collaborator info
 */
const formatNoteResponse = (note, userEmail = null) => {
  const obj = note.toObject ? note.toObject() : { ...note };

  const response = {
    id: obj._id?.toString() || obj.id,
    title: obj.title,
    content: obj.content,
    snippet: obj.content?.length > 200 ? obj.content.substring(0, 200) + '...' : obj.content,
    contentType: obj.contentType,
    language: obj.language,
    isPublic: obj.isPublic,
    isGist: obj.isGist,
    tags: obj.tags || [],
    color: obj.color,
    isPinned: obj.isPinned,
    attachments: obj.attachments || [],
    viewCount: obj.viewCount || 0,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    createdAtFormatted: formatLastUpdated(obj.createdAt),
    updatedAtRelative: getRelativeTimeLabel(obj.updatedAt)
  };

  // Format owner info
  if (obj.owner) {
    if (obj.owner._id) {
      response.owner = {
        id: obj.owner._id.toString(),
        name: obj.owner.name,
        email: obj.isPublic ? obj.owner.email : 'private'
      };
    } else {
      response.owner = 'anonymous';
    }
  }

  // Include collaborators only for authenticated users
  if (userEmail && obj.collaborators && obj.collaborators.length > 0) {
    response.collaborators = obj.collaborators.map(c => ({
      user: {
        id: c.user?._id?.toString() || c.user?.toString(),
        name: c.user?.name,
        email: c.user?.email
      },
      permission: c.permission
    }));
  }

  return response;
};

/**
 * Check if user has access to view a note
 */
const checkNoteAccess = async (note, userEmail) => {
  if (note.isPublic) return true;
  if (!userEmail) return false;

  const userId = await getUserIdSafe(userEmail);
  if (!userId) return false;

  const ownerId = note.owner?._id?.toString() || note.owner?.toString();
  if (ownerId === userId) return true;

  // Check if collaborator
  const isCollaborator = note.collaborators?.some(
    c => (c.user?._id?.toString() || c.user?.toString()) === userId
  );

  return isCollaborator;
};

/**
 * Check if user has edit access to a note
 */
const checkNoteEditAccess = async (note, userEmail) => {
  if (!userEmail) return false;

  const userId = await getUserIdSafe(userEmail);
  if (!userId) return false;

  const ownerId = note.owner?._id?.toString() || note.owner?.toString();
  if (ownerId === userId) return true;

  // Check if collaborator with edit permission
  const collaborator = note.collaborators?.find(
    c => (c.user?._id?.toString() || c.user?.toString()) === userId
  );

  return collaborator?.permission === 'edit';
};

/**
 * Create a new note
 */
const createNote = async (userEmail, noteData) => {
  const userId = await authController.getUserId(userEmail);
  const note = new Note({
    ...noteData,
    owner: userId
  });

  await note.save();
  return formatNoteResponse(note);
};

/**
 * Get notes with filtering and search
 */
const getNotes = async (userEmail = null, options = {}) => {
  try {
    const userId = await getUserIdSafe(userEmail);
    let query = {};

    // Build access control query
    if (userId) {
      query.$or = [
        { owner: userId },
        { isPublic: true },
        { 'collaborators.user': userId }
      ];
    } else {
      query.isPublic = true;
    }

    // Search functionality
    if (options.search) {
      query.$text = { $search: options.search };
    }

    // Apply filters
    if (options.isGist !== undefined) query.isGist = options.isGist;
    if (options.tags?.length > 0) query.tags = { $in: options.tags };
    if (options.contentType) query.contentType = options.contentType;
    if (options.language) query.language = options.language;

    // Build sort
    let sort = { isPinned: -1, createdAt: -1 };
    if (options.sortBy === 'updated') sort = { updatedAt: -1 };
    if (options.sortBy === 'views') sort = { viewCount: -1 };

    const notes = await Note.find(query)
      .sort(sort)
      .limit(Math.min(options.limit || 50, 100))
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');

    return notes.map(note => formatNoteResponse(note, userEmail));
  } catch (error) {
    logError('getNotes', error);
    return [];
  }
};

/**
 * Get a single note by ID
 */
const getNoteById = async (noteId, userEmail = null) => {
  const note = await Note.findById(noteId)
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email');

  if (!note) {
    throw new Error('Note not found');
  }

  const canAccess = await checkNoteAccess(note, userEmail);
  if (!canAccess) {
    throw new Error('You do not have permission to view this note');
  }

  // Increment view count for non-owners
  const userId = await getUserIdSafe(userEmail);
  const ownerId = note.owner?._id?.toString();
  if (!userId || ownerId !== userId) {
    note.viewCount += 1;
    note.lastViewedAt = new Date();
    await note.save();
  }

  return formatNoteResponse(note, userEmail);
};

/**
 * Update a note
 */
const updateNote = async (noteId, userEmail, updates) => {
  const note = await Note.findById(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  const canEdit = await checkNoteEditAccess(note, userEmail);
  if (!canEdit) {
    throw new Error('You do not have permission to edit this note');
  }

  // Apply allowed updates
  const allowedUpdates = [
    'title', 'content', 'contentType', 'language', 'isPublic',
    'isGist', 'tags', 'color', 'isPinned', 'attachments'
  ];

  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      note[field] = updates[field];
    }
  });

  await note.save();
  return formatNoteResponse(note, userEmail);
};

/**
 * Delete a note
 */
const deleteNote = async (noteId, userEmail) => {
  const userId = await authController.getUserId(userEmail);
  const note = await Note.findById(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  if (note.owner?.toString() !== userId) {
    throw new Error('You do not have permission to delete this note');
  }

  await note.deleteOne();
  return { message: 'Note deleted successfully' };
};

/**
 * Toggle note pinned status
 */
const toggleNotePinned = async (noteId, userEmail) => {
  const userId = await authController.getUserId(userEmail);
  const note = await Note.findById(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  if (note.owner?.toString() !== userId) {
    throw new Error('You do not have permission to pin/unpin this note');
  }

  note.isPinned = !note.isPinned;
  await note.save();

  return {
    id: note._id.toString(),
    isPinned: note.isPinned
  };
};

/**
 * Add collaborator to note
 */
const addCollaborator = async (noteId, ownerEmail, collaboratorEmail, permission = 'view') => {
  const userId = await authController.getUserId(ownerEmail);
  const note = await Note.findById(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  if (note.owner?.toString() !== userId) {
    throw new Error('You do not have permission to add collaborators');
  }

  const collaboratorId = await authController.getUserId(collaboratorEmail);

  // Check if already a collaborator
  const existingIndex = note.collaborators.findIndex(
    c => c.user.toString() === collaboratorId
  );

  if (existingIndex >= 0) {
    note.collaborators[existingIndex].permission = permission;
  } else {
    note.collaborators.push({ user: collaboratorId, permission });
  }

  await note.save();
  await note.populate('collaborators.user', 'name email');

  return formatNoteResponse(note, ownerEmail);
};

/**
 * Remove collaborator from note
 */
const removeCollaborator = async (noteId, ownerEmail, collaboratorEmail) => {
  const userId = await authController.getUserId(ownerEmail);
  const note = await Note.findById(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  if (note.owner?.toString() !== userId) {
    throw new Error('You do not have permission to remove collaborators');
  }

  const collaboratorId = await authController.getUserId(collaboratorEmail);

  note.collaborators = note.collaborators.filter(
    c => c.user.toString() !== collaboratorId
  );

  await note.save();
  return formatNoteResponse(note, ownerEmail);
};

/**
 * Get popular public notes/gists
 */
const getPopularNotes = async (options = {}) => {
  const query = { isPublic: true };
  if (options.isGist !== undefined) query.isGist = options.isGist;

  const notes = await Note.find(query)
    .sort({ viewCount: -1 })
    .limit(Math.min(options.limit || 20, 50))
    .populate('owner', 'name email');

  return notes.map(note => formatNoteResponse(note));
};

/**
 * Get note statistics for user
 */
const getNoteStats = async (userEmail) => {
  const userId = await authController.getUserId(userEmail);
  const ownerObjectId = toObjectId(userId);

  const stats = await Note.aggregate([
    { $match: { owner: ownerObjectId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        public: { $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] } },
        gists: { $sum: { $cond: [{ $eq: ['$isGist', true] }, 1, 0] } },
        pinned: { $sum: { $cond: [{ $eq: ['$isPinned', true] }, 1, 0] } },
        totalViews: { $sum: '$viewCount' },
        withCollaborators: {
          $sum: { $cond: [{ $gt: [{ $size: '$collaborators' }, 0] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    public: 0,
    gists: 0,
    pinned: 0,
    totalViews: 0,
    withCollaborators: 0
  };
};

/**
 * Get user's own notes
 */
const getMyNotes = async (userEmail, options = {}) => {
  const userId = await authController.getUserId(userEmail);

  const notes = await Note.find({ owner: userId })
    .sort(options.sort || { isPinned: -1, createdAt: -1 })
    .limit(options.limit || 50)
    .populate('collaborators.user', 'name email');

  return notes.map(note => formatNoteResponse(note, userEmail));
};

/**
 * Search notes
 */
const searchNotes = async (searchTerm, userEmail = null, options = {}) => {
  const userId = await getUserIdSafe(userEmail);

  const query = { $text: { $search: searchTerm } };

  if (userId) {
    query.$or = [
      { owner: userId },
      { isPublic: true },
      { 'collaborators.user': userId }
    ];
  } else {
    query.isPublic = true;
  }

  const notes = await Note.find(query)
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20)
    .populate('owner', 'name email');

  return notes.map(note => formatNoteResponse(note, userEmail));
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  toggleNotePinned,
  addCollaborator,
  removeCollaborator,
  getPopularNotes,
  getNoteStats,
  getMyNotes,
  searchNotes,
  noteRepo
};
