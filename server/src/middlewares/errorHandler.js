/**
 * Error Handler Middleware - Handle semua error secara global
 * File: src/middlewares/errorHandler.js
 */

const { formatResponse } = require('../utils/helpers');

/**
 * Handler untuk route yang tidak ditemukan (404)
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json(
    formatResponse(false, `Route ${req.method} ${req.originalUrl} tidak ditemukan.`)
  );
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan pada server.';
  let errors = null;
  
  // Handle Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validasi gagal.';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }
  
  // Handle Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Data sudah ada.';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }
  
  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token tidak valid.';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token sudah expired. Silakan login ulang.';
  }
  
  // Handle Multer Error (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'Ukuran file terlalu besar.';
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Field file tidak sesuai.';
  }
  
  // Response
  const response = formatResponse(false, message);
  
  if (errors) {
    response.errors = errors;
  }
  
  // Tampilkan stack trace hanya di development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
