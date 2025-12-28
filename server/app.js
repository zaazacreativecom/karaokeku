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
const { UPLOAD_PATH, VIDEOS_PATH, VIDEOS_LOW_PATH, videosUrlToFilePath } = require('./src/config/paths');
const { ensureLowVideoVariant } = require('./src/utils/videoLowVariant');
const { ensureMp4Variant } = require('./src/utils/videoMp4Variant');

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
const toPosixPath = (value) => String(value || '').split(path.sep).join('/');
const encodeUrlPathSegments = (value) =>
  toPosixPath(value)
    .split('/')
    .filter((seg) => seg.length > 0)
    .map(encodeURIComponent)
    .join('/');

const replaceExtension = (value, newExt) => {
  const ext = path.extname(value);
  if (!ext) return `${value}${newExt}`;
  return `${value.slice(0, -ext.length)}${newExt}`;
};

const fileLooksValid = (filePath) => {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile() && stat.size > 0;
  } catch (_) {
    return false;
  }
};

app.get('/videos/low/*', async (req, res, next) => {
  const lowFsPath = videosUrlToFilePath(req.path);
  if (!lowFsPath) return next();

  if (fs.existsSync(lowFsPath)) return next();

  const relFromVideos = path.relative(VIDEOS_PATH, lowFsPath);
  const lowPrefix = `low${path.sep}`;
  if (!relFromVideos.startsWith(lowPrefix)) return next();

  const relNoLow = relFromVideos.slice(lowPrefix.length);
  const originalFsPath = path.join(VIDEOS_PATH, relNoLow);
  if (!fs.existsSync(originalFsPath)) return next();

  const originalExt = path.extname(originalFsPath).toLowerCase();

  if (originalExt === '.mpg') {
    try {
      const mp4FsPath = fileLooksValid(replaceExtension(originalFsPath, '.mp4'))
        ? replaceExtension(originalFsPath, '.mp4')
        : await ensureMp4Variant(originalFsPath);

      const mp4RelNoLow = replaceExtension(relNoLow, '.mp4');
      const lowMp4FsPath = path.join(VIDEOS_LOW_PATH, mp4RelNoLow);

      // If low MP4 already exists, serve it directly (clients might request .mpg).
      if (fileLooksValid(lowMp4FsPath)) {
        return res.redirect(307, `/videos/low/${encodeUrlPathSegments(mp4RelNoLow)}`);
      }

      ensureLowVideoVariant(mp4FsPath, mp4RelNoLow).catch((error) => {
        console.error('Error generating low-quality video variant:', error);
      });

      return res.redirect(307, `/videos/${encodeUrlPathSegments(mp4RelNoLow)}`);
    } catch (error) {
      console.error('Error preparing .mpg for playback:', error);
      return res.redirect(307, `/videos/${encodeUrlPathSegments(relNoLow)}`);
    }
  }

  ensureLowVideoVariant(originalFsPath, relNoLow).catch((error) => {
    console.error('Error generating low-quality video variant:', error);
  });

  return res.redirect(307, `/videos/${encodeUrlPathSegments(relNoLow)}`);
});

// Optional helper: allow clients to request low-quality via query/header/env.
app.get('/videos/*', async (req, res, next) => {
  // Don't interfere with /videos/low/*
  if (req.path.startsWith('/videos/low/')) return next();

  const videoFsPath = videosUrlToFilePath(req.path);
  if (!videoFsPath) return next();

  const quality = String(req.query.quality || '').toLowerCase();
  const defaultQuality = String(process.env.DEFAULT_VIDEO_QUALITY || '').toLowerCase();
  const saveData = String(req.headers['save-data'] || '').toLowerCase() === 'on';

  const wantLow =
    quality === 'low' ||
    saveData ||
    defaultQuality === 'low';

  if (wantLow) {
    const relFromVideos = path.relative(VIDEOS_PATH, videoFsPath);
    return res.redirect(307, `/videos/low/${encodeUrlPathSegments(relFromVideos)}`);
  }

  const ext = path.extname(videoFsPath).toLowerCase();

  // Auto-normalize .mpg to browser-friendly .mp4 (cached on disk).
  if (ext === '.mpg') {
    const relFromVideos = path.relative(VIDEOS_PATH, videoFsPath);
    const mp4Rel = replaceExtension(relFromVideos, '.mp4');
    const mp4FsPath = replaceExtension(videoFsPath, '.mp4');

    if (fileLooksValid(mp4FsPath)) {
      return res.redirect(307, `/videos/${encodeUrlPathSegments(mp4Rel)}`);
    }

    if (fs.existsSync(videoFsPath)) {
      try {
        await ensureMp4Variant(videoFsPath);
        return res.redirect(307, `/videos/${encodeUrlPathSegments(mp4Rel)}`);
      } catch (error) {
        console.error('Error preparing .mpg for playback:', error);
        return next();
      }
    }

    // If .mpg is missing but .mp4 exists, still redirect (helps legacy DB URLs).
    if (fileLooksValid(mp4FsPath)) {
      return res.redirect(307, `/videos/${encodeUrlPathSegments(mp4Rel)}`);
    }
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
