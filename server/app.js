/**
 * Express App Configuration
 * File: app.js
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import middlewares
const corsOptions = require('./src/config/cors');
const { notFoundHandler, errorHandler } = require('./src/middlewares/errorHandler');

// Import routes
const routes = require('./src/routes');

// Create Express app
const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS
app.use(cors(corsOptions));

// Request logging (skip di production jika diperlukan)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files untuk uploads
app.use('/videos', express.static(path.join(__dirname, 'uploads/videos')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// ROUTES
// ==========================================

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
