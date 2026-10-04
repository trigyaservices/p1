/**
 * Global Error Handler Middleware
 * Normalizes all API errors without leaking sensitive stack traces in production
 */

module.exports = function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
