/**
 * Database utilities
 * Provides standardized CRUD operations with auth/ownership handling
 */

const mongoose = require('mongoose');
const { getErrorMessage } = require('./errorUtils');

/**
 * Convert string to ObjectId if valid
 */
function toObjectId(id) {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

/**
 * Create a repository for a model with standardized CRUD operations
 * @param {Model} Model - Mongoose model
 * @param {object} options - Repository options
 * @returns {object} Repository with CRUD methods
 */
function createRepository(Model, options = {}) {
  const {
    // Field that stores the owner reference
    ownerField = 'owner',
    // Field that determines public/private visibility
    publicField = 'isPublic',
    // Default sort order
    defaultSort = { createdAt: -1 },
    // Default limit for queries
    defaultLimit = 50,
    // Fields to exclude from responses (e.g., sensitive data)
    excludeFields = [],
    // Fields that can be updated
    allowedUpdates = null,
    // Custom formatter for response objects
    formatResponse = null
  } = options;

  /**
   * Format a document for response
   */
  const formatDocument = (doc, includeOwner = false) => {
    if (!doc) return null;

    const obj = doc.toObject ? doc.toObject() : { ...doc };

    // Convert _id to id
    if (obj._id) {
      obj.id = obj._id.toString();
      delete obj._id;
    }

    // Remove excluded fields
    excludeFields.forEach(field => delete obj[field]);

    // Remove __v
    delete obj.__v;

    // Convert owner ObjectId to string if present
    if (obj[ownerField] && typeof obj[ownerField] === 'object') {
      obj[ownerField] = obj[ownerField].toString();
    }

    // Optionally hide owner
    if (!includeOwner && obj[ownerField]) {
      obj[ownerField] = 'anonymous';
    }

    // Apply custom formatter if provided
    if (formatResponse) {
      return formatResponse(obj);
    }

    return obj;
  };

  return {
    /**
     * Create a new document
     * @param {object} data - Document data
     * @param {string} userId - Owner user ID (optional)
     * @returns {object} Created document
     */
    async create(data, userId = null) {
      const docData = { ...data };

      if (userId) {
        docData[ownerField] = userId;
      }

      const doc = new Model(docData);
      await doc.save();

      return formatDocument(doc);
    },

    /**
     * Find documents with optional auth filtering
     * @param {object} query - Query filters
     * @param {object} options - Query options
     * @returns {array} Array of documents
     */
    async find(query = {}, opts = {}) {
      const {
        userId = null,
        includePrivate = false,
        sort = defaultSort,
        limit = defaultLimit,
        skip = 0,
        select = null
      } = opts;

      const finalQuery = { ...query };

      // If not including private, only show public OR owned by user
      if (!includePrivate) {
        if (userId) {
          finalQuery.$or = [
            { [publicField]: true },
            { [ownerField]: userId }
          ];
        } else {
          finalQuery[publicField] = true;
        }
      }

      let dbQuery = Model.find(finalQuery)
        .sort(sort)
        .limit(limit)
        .skip(skip);

      if (select) {
        dbQuery = dbQuery.select(select);
      }

      const docs = await dbQuery;
      return docs.map(doc => formatDocument(doc, !!userId));
    },

    /**
     * Find one document by ID with auth check
     * @param {string} id - Document ID
     * @param {object} options - Query options
     * @returns {object} Document or null
     */
    async findById(id, opts = {}) {
      const { userId = null, requireOwnership = false } = opts;

      const doc = await Model.findById(id);

      if (!doc) {
        return null;
      }

      // Check if user can access this document
      const isOwner = userId && doc[ownerField]?.toString() === userId;
      const isPublic = doc[publicField] === true;

      if (requireOwnership && !isOwner) {
        throw new Error('Permission denied');
      }

      if (!isPublic && !isOwner) {
        throw new Error('Permission denied');
      }

      return formatDocument(doc, isOwner);
    },

    /**
     * Find one document by query
     * @param {object} query - Query filters
     * @param {object} options - Query options
     * @returns {object} Document or null
     */
    async findOne(query, opts = {}) {
      const { userId = null } = opts;

      const finalQuery = { ...query };

      // Add visibility filter
      if (userId) {
        finalQuery.$or = [
          { [publicField]: true },
          { [ownerField]: userId }
        ];
      } else {
        finalQuery[publicField] = true;
      }

      const doc = await Model.findOne(finalQuery);
      return doc ? formatDocument(doc, !!userId) : null;
    },

    /**
     * Update a document with ownership check
     * @param {string} id - Document ID
     * @param {object} updates - Fields to update
     * @param {string} userId - User ID (required for ownership check)
     * @returns {object} Updated document
     */
    async update(id, updates, userId) {
      if (!userId) {
        throw new Error('Authentication required');
      }

      const doc = await Model.findById(id);

      if (!doc) {
        throw new Error('Document not found');
      }

      // Check ownership
      if (doc[ownerField]?.toString() !== userId) {
        throw new Error('Permission denied');
      }

      // Filter allowed updates if specified
      const filteredUpdates = allowedUpdates
        ? Object.keys(updates)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {})
        : updates;

      // Apply updates
      Object.assign(doc, filteredUpdates);
      await doc.save();

      return formatDocument(doc, true);
    },

    /**
     * Delete a document with ownership check
     * @param {string} id - Document ID
     * @param {string} userId - User ID (required for ownership check)
     * @returns {boolean} Success
     */
    async delete(id, userId) {
      if (!userId) {
        throw new Error('Authentication required');
      }

      const doc = await Model.findById(id);

      if (!doc) {
        throw new Error('Document not found');
      }

      // Check ownership
      if (doc[ownerField]?.toString() !== userId) {
        throw new Error('Permission denied');
      }

      await doc.deleteOne();
      return true;
    },

    /**
     * Count documents
     * @param {object} query - Query filters
     * @param {object} options - Query options
     * @returns {number} Count
     */
    async count(query = {}, opts = {}) {
      const { userId = null, includePrivate = false } = opts;

      const finalQuery = { ...query };

      if (!includePrivate) {
        if (userId) {
          finalQuery.$or = [
            { [publicField]: true },
            { [ownerField]: userId }
          ];
        } else {
          finalQuery[publicField] = true;
        }
      }

      return Model.countDocuments(finalQuery);
    },

    /**
     * Check if user owns a document
     * @param {string} id - Document ID
     * @param {string} userId - User ID
     * @returns {boolean} Is owner
     */
    async isOwner(id, userId) {
      if (!userId) return false;

      const doc = await Model.findById(id).select(ownerField);
      if (!doc) return false;

      return doc[ownerField]?.toString() === userId;
    },

    /**
     * Get user's own documents
     * @param {string} userId - User ID
     * @param {object} options - Query options
     * @returns {array} Array of documents
     */
    async findByOwner(userId, opts = {}) {
      const { sort = defaultSort, limit = defaultLimit, skip = 0 } = opts;

      const docs = await Model.find({ [ownerField]: userId })
        .sort(sort)
        .limit(limit)
        .skip(skip);

      return docs.map(doc => formatDocument(doc, true));
    },

    /**
     * Paginated find with metadata
     * @param {object} query - Query filters
     * @param {object} options - Pagination options
     * @returns {object} { data, pagination }
     */
    async paginate(query = {}, opts = {}) {
      const {
        userId = null,
        includePrivate = false,
        page = 1,
        limit = defaultLimit,
        sort = defaultSort
      } = opts;

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.find(query, { userId, includePrivate, sort, limit, skip }),
        this.count(query, { userId, includePrivate })
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    },

    /**
     * Search documents (requires text index on model)
     * @param {string} searchTerm - Search term
     * @param {object} options - Search options
     * @returns {array} Array of matching documents
     */
    async search(searchTerm, opts = {}) {
      const { userId = null, limit = defaultLimit } = opts;

      const query = { $text: { $search: searchTerm } };

      if (userId) {
        query.$or = [
          { [publicField]: true },
          { [ownerField]: userId }
        ];
      } else {
        query[publicField] = true;
      }

      const docs = await Model.find(query)
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit);

      return docs.map(doc => formatDocument(doc, !!userId));
    },

    /**
     * Bulk update documents owned by user
     * @param {object} query - Query filters
     * @param {object} updates - Updates to apply
     * @param {string} userId - User ID
     * @returns {number} Number of modified documents
     */
    async bulkUpdate(query, updates, userId) {
      if (!userId) {
        throw new Error('Authentication required');
      }

      const finalQuery = { ...query, [ownerField]: userId };
      const result = await Model.updateMany(finalQuery, updates);

      return result.modifiedCount || 0;
    },

    /**
     * Aggregate with auth filtering
     * @param {array} pipeline - Aggregation pipeline
     * @param {object} options - Options
     * @returns {array} Aggregation results
     */
    async aggregate(pipeline, opts = {}) {
      const { userId = null, includePrivate = false } = opts;

      // Prepend match stage for visibility
      const matchStage = {};
      if (!includePrivate) {
        if (userId) {
          matchStage.$or = [
            { [publicField]: true },
            { [ownerField]: userId }
          ];
        } else {
          matchStage[publicField] = true;
        }
      }

      const fullPipeline = Object.keys(matchStage).length > 0
        ? [{ $match: matchStage }, ...pipeline]
        : pipeline;

      return Model.aggregate(fullPipeline);
    },

    // Expose the model for advanced queries
    Model
  };
}

/**
 * Pagination helper - parse pagination params from request
 * @param {object} query - Request query params
 * @param {object} defaults - Default values
 * @returns {object} Parsed pagination params
 */
function parsePagination(query, defaults = {}) {
  const {
    page: defaultPage = 1,
    limit: defaultLimit = 50,
    maxLimit = 100
  } = defaults;

  let page = parseInt(query.page, 10) || defaultPage;
  let limit = parseInt(query.limit, 10) || defaultLimit;

  // Ensure valid ranges
  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), maxLimit);

  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Sort helper - parse sort params from request
 * @param {string} sortParam - Sort parameter (e.g., '-createdAt' or 'name')
 * @param {object} allowedFields - Map of allowed sort fields
 * @param {object} defaultSort - Default sort object
 * @returns {object} Mongoose sort object
 */
function parseSort(sortParam, allowedFields = {}, defaultSort = { createdAt: -1 }) {
  if (!sortParam) return defaultSort;

  const direction = sortParam.startsWith('-') ? -1 : 1;
  const field = sortParam.replace(/^-/, '');

  // Check if field is allowed
  if (allowedFields[field]) {
    return { [allowedFields[field]]: direction };
  }

  return defaultSort;
}

/**
 * Build query from request params
 * @param {object} params - Request query params
 * @param {object} fieldMap - Map of param names to query fields
 * @returns {object} Mongoose query object
 */
function buildQuery(params, fieldMap = {}) {
  const query = {};

  for (const [param, config] of Object.entries(fieldMap)) {
    const value = params[param];
    if (value === undefined || value === '') continue;

    const field = typeof config === 'string' ? config : config.field;
    const type = typeof config === 'object' ? config.type : 'exact';

    switch (type) {
      case 'exact':
        query[field] = value;
        break;
      case 'regex':
        query[field] = new RegExp(value, 'i');
        break;
      case 'boolean':
        query[field] = value === 'true' || value === '1';
        break;
      case 'number':
        query[field] = Number(value);
        break;
      case 'array':
        query[field] = { $in: value.split(',').map(v => v.trim()) };
        break;
      case 'gte':
        query[field] = { $gte: Number(value) };
        break;
      case 'lte':
        query[field] = { $lte: Number(value) };
        break;
      case 'dateGte':
        query[field] = { $gte: new Date(value) };
        break;
      case 'dateLte':
        query[field] = { $lte: new Date(value) };
        break;
    }
  }

  return query;
}

module.exports = {
  createRepository,
  parsePagination,
  parseSort,
  buildQuery,
  toObjectId
};
