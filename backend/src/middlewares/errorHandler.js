const config = require('../config/env');

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;

  const body = {
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode,
  };

  if (!config.isProduction) {
    body.stack = err.stack;
  }

  if (statusCode === 500) {
    console.error(`[ERROR] ${err.message}`, err.stack);
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
