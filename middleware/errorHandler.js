const { ZodError } = require('zod');

function notFound(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Route not found' });
  }

  next();
}

function errorHandler(error, req, res, next) {
  console.error('Unexpected error:', error);

  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  if (error instanceof ZodError) {
    statusCode = 400;
    message = error.issues?.[0]?.message || 'Request validation failed';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors || {})[0]?.message || 'Validation failed';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with this value already exists';
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token is invalid or expired';
  }

  res.status(statusCode).json({
    message,
  });
}

module.exports = { notFound, errorHandler };
