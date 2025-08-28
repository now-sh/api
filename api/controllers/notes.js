const Note = require('../models/note');
const authController = require('./auth');

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
  let query = {};
  
  // Base query for access control
  if (userEmail) {
    const userId = await authController.getUserId(userEmail).catch(() => null);
    if (userId) {
      query = {
        $or: [
          { owner: userId },
          { isPublic: true },
          { 'collaborators.user': userId }
        ]
      };
    } else {
      query = { isPublic: true };
    }
  } else {
    query = { isPublic: true };
  }
  
  // Search functionality
  if (options.search) {
    query.$text = { $search: options.search };
  }
  
  // Filter by type
  if (options.isGist !== undefined) {
    query.isGist = options.isGist;
  }
  
  // Filter by tags
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  // Filter by content type
  if (options.contentType) {
    query.contentType = options.contentType;
  }
  
  // Filter by language (for code snippets)
  if (options.language) {
    query.language = options.language;
  }
  
  // Build sort object
  let sort = {};
  if (options.sortBy === 'updated') {
    sort = { updatedAt: -1 };
  } else if (options.sortBy === 'views') {
    sort = { viewCount: -1 };
  } else {
    sort = { isPinned: -1, createdAt: -1 }; // Default: pinned first, then newest
  }
  
  const notes = await Note.find(query)
    .sort(sort)
    .limit(Math.min(options.limit || 50, 100))
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email');
  
  return notes.map(note => formatNoteResponse(note, userEmail));
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
  
  // Check access permissions
  const canAccess = await checkNoteAccess(note, userEmail);
  if (!canAccess) {
    throw new Error('You do not have permission to view this note');
  }
  
  // Increment view count for public notes or non-owner access
  if (userEmail) {
    const userId = await authController.getUserId(userEmail).catch(() => null);
    if (!userId || note.owner._id.toString() !== userId.toString()) {
      note.viewCount += 1;
      note.lastViewedAt = new Date();
      await note.save();
    }
  } else if (note.isPublic) {
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
  
  // Check edit permissions
  const canEdit = await checkNoteEditAccess(note, userEmail);
  if (!canEdit) {
    throw new Error('You do not have permission to edit this note');
  }
  
  // Update allowed fields
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
  
  return formatNoteResponse(note);
};

/**
 * Delete a note
 */
const deleteNote = async (noteId, userEmail) => {
  const note = await Note.findById(noteId);
  
  if (!note) {
    throw new Error('Note not found');
  }
  
  // Only owner can delete
  const isOwner = await authController.checkOwnership(userEmail, note.owner);
  if (!isOwner) {
    throw new Error('You do not have permission to delete this note');
  }
  
  await note.deleteOne();
  
  return { message: 'Note deleted successfully' };
};

/**
 * Toggle note pinned status
 */
const toggleNotePinned = async (noteId, userEmail) => {
  const note = await Note.findById(noteId);
  
  if (!note) {
    throw new Error('Note not found');
  }
  
  // Check ownership
  const isOwner = await authController.checkOwnership(userEmail, note.owner);
  if (!isOwner) {
    throw new Error('You do not have permission to pin/unpin this note');
  }
  
  note.isPinned = !note.isPinned;
  await note.save();
  
  return {
    id: note._id,
    isPinned: note.isPinned
  };
};

/**
 * Add collaborator to note
 */
const addCollaborator = async (noteId, ownerEmail, collaboratorEmail, permission = 'view') => {
  const note = await Note.findById(noteId);
  
  if (!note) {
    throw new Error('Note not found');
  }
  
  // Check ownership
  const isOwner = await authController.checkOwnership(ownerEmail, note.owner);
  if (!isOwner) {
    throw new Error('You do not have permission to add collaborators');
  }
  
  // Get collaborator user ID
  const collaboratorId = await authController.getUserId(collaboratorEmail);
  
  // Check if already a collaborator
  const existingCollaborator = note.collaborators.find(
    c => c.user.toString() === collaboratorId.toString()
  );
  
  if (existingCollaborator) {
    existingCollaborator.permission = permission;
  } else {
    note.collaborators.push({
      user: collaboratorId,
      permission
    });
  }
  
  await note.save();
  await note.populate('collaborators.user', 'name email');
  
  return formatNoteResponse(note);
};

/**
 * Remove collaborator from note
 */
const removeCollaborator = async (noteId, ownerEmail, collaboratorEmail) => {
  const note = await Note.findById(noteId);
  
  if (!note) {
    throw new Error('Note not found');
  }
  
  // Check ownership
  const isOwner = await authController.checkOwnership(ownerEmail, note.owner);
  if (!isOwner) {
    throw new Error('You do not have permission to remove collaborators');
  }
  
  // Get collaborator user ID
  const collaboratorId = await authController.getUserId(collaboratorEmail);
  
  note.collaborators = note.collaborators.filter(
    c => c.user.toString() !== collaboratorId.toString()
  );
  
  await note.save();
  
  return formatNoteResponse(note);
};

/**
 * Get popular public notes/gists
 */
const getPopularNotes = async (options = {}) => {
  const query = { isPublic: true };
  
  if (options.isGist !== undefined) {
    query.isGist = options.isGist;
  }
  
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
  
  const stats = await Note.aggregate([
    {
      $match: { owner: userId }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        public: {
          $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
        },
        gists: {
          $sum: { $cond: [{ $eq: ['$isGist', true] }, 1, 0] }
        },
        pinned: {
          $sum: { $cond: [{ $eq: ['$isPinned', true] }, 1, 0] }
        },
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

// Helper functions

/**
 * Check if user has access to view a note
 */
const checkNoteAccess = async (note, userEmail) => {
  // Public notes are accessible to everyone
  if (note.isPublic) return true;
  
  // No email means unauthenticated user
  if (!userEmail) return false;
  
  const userId = await authController.getUserId(userEmail).catch(() => null);
  if (!userId) return false;
  
  // Check if owner
  if (note.owner._id.toString() === userId.toString()) return true;
  
  // Check if collaborator
  const isCollaborator = note.collaborators.some(
    c => c.user._id.toString() === userId.toString()
  );
  
  return isCollaborator;
};

/**
 * Check if user has edit access to a note
 */
const checkNoteEditAccess = async (note, userEmail) => {
  if (!userEmail) return false;
  
  const userId = await authController.getUserId(userEmail).catch(() => null);
  if (!userId) return false;
  
  // Check if owner
  if (note.owner.toString() === userId.toString()) return true;
  
  // Check if collaborator with edit permission
  const collaborator = note.collaborators.find(
    c => c.user.toString() === userId.toString()
  );
  
  return collaborator && collaborator.permission === 'edit';
};

/**
 * Format note response
 */
const formatNoteResponse = (note, userEmail = null) => {
  const response = {
    id: note._id,
    title: note.title,
    content: note.content,
    snippet: note.snippet,
    contentType: note.contentType,
    language: note.language,
    isPublic: note.isPublic,
    isGist: note.isGist,
    tags: note.tags,
    color: note.color,
    isPinned: note.isPinned,
    attachments: note.attachments,
    viewCount: note.viewCount,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
  
  // Format owner info
  if (note.owner && note.owner._id) {
    response.owner = {
      id: note.owner._id,
      name: note.owner.name,
      email: note.isPublic ? note.owner.email : 'private'
    };
  }
  
  // Include collaborators only for authenticated users who have access
  if (userEmail && note.collaborators && note.collaborators.length > 0) {
    response.collaborators = note.collaborators.map(c => ({
      user: {
        id: c.user._id,
        name: c.user.name,
        email: c.user.email
      },
      permission: c.permission
    }));
  }
  
  return response;
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
  getNoteStats
};