/**
 * Konfigurasi CORS
 * File: src/config/cors.js
 */

require('dotenv').config();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  // Important for streaming media: browsers use `Range` requests (and may preflight it on CORS)
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Range'],
  // Useful for clients/tools and some media use-cases
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Accept-Ranges', 'Content-Length'],
  maxAge: 86400 // Cache preflight request selama 24 jam
};

module.exports = corsOptions;
