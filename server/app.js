/**
 * Express App Configuration
 * File: app.js
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { UPLOAD_PATH, VIDEOS_PATH, VIDEOS_LOW_PATH } = require('./src/config/paths');
const { ensureLowVideoVariant } = require('./src/utils/videoLowVariant');

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
// If low-quality variant is requested but missing, generate in background and redirect to original.
app.get('/videos/low/:filename', (req, res, next) => {
  const filename = path.basename(req.params.filename || '');
  if (!filename) return next();

  const lowPath = path.join(VIDEOS_LOW_PATH, filename);
  if (fs.existsSync(lowPath)) return next();

  const originalPath = path.join(VIDEOS_PATH, filename);
  if (!fs.existsSync(originalPath)) return next();

  ensureLowVideoVariant(originalPath, filename).catch((error) => {
    console.error('Error generating low-quality video variant:', error);
  });

  return res.redirect(307, `/videos/${encodeURIComponent(filename)}`);
});

// Optional helper: allow clients to request low-quality via query/header/env.
app.get('/videos/:filename', (req, res, next) => {
  const filename = path.basename(req.params.filename || '');
  if (!filename) return next();

  const quality = String(req.query.quality || '').toLowerCase();
  const defaultQuality = String(process.env.DEFAULT_VIDEO_QUALITY || '').toLowerCase();
  const saveData = String(req.headers['save-data'] || '').toLowerCase() === 'on';

  const wantLow =
    quality === 'low' ||
    saveData ||
    defaultQuality === 'low';

  if (wantLow) {
    return res.redirect(307, `/videos/low/${encodeURIComponent(filename)}`);
  }

  return next();
});

app.use('/videos', express.static(VIDEOS_PATH, { maxAge: '7d' }));
app.use('/uploads', express.static(UPLOAD_PATH, { maxAge: '7d' }));

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
