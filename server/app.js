/**
 * Express App Configuration
 * File: app.js
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const { UPLOAD_PATH, VIDEOS_PATH } = require('./src/config/paths');

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
app.use('/videos', express.static(VIDEOS_PATH));
app.use('/uploads', express.static(UPLOAD_PATH));

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
// FRONTEND SERVING (PRODUCTION)
// ==========================================
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../client/dist');
  
  // Serve static files from dist
  app.use(express.static(clientDistPath));

  // SPA Fallback: Any route not handled by API gets index.html
  app.get('*', (req, res) => {
    // Skip if API request (should have been handled by routes above or 404)
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'Endpoint not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
