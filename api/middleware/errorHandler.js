const notFound = (req, res, _next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route not found - ${req.originalUrl}`,
    errors: [{
      msg: `The requested endpoint ${req.originalUrl} does not exist`
    }]
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
  } else if (error.name === 'CastError') {
    statusCode = 400;
  } else if (error.code === 11000) {
    statusCode = 409; // Conflict - duplicate key
  }
  
  res.status(statusCode).json({
    success: false,
    error: error.message,
    errors: [{
      msg: error.message
    }],
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
