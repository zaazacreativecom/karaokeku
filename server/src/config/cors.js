/**
 * Konfigurasi CORS
 * File: src/config/cors.js
 */

require('dotenv').config();

const parseOrigins = (raw) => {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
};

const allowedOrigins = parseOrigins(process.env.FRONTEND_URL);
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const origins = allowedOrigins.length ? allowedOrigins : defaultOrigins;

const isSameHostOrigin = (origin, req) => {
  if (!origin) return false;
  const host = req.get('host');
  if (!host) return false;

  try {
    const parsed = new URL(origin);
    return parsed.host === host;
  } catch (_) {
    return false;
  }
};

const baseOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  // Important for streaming media: browsers use `Range` requests (and may preflight it on CORS)
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Range'],
  // Useful for clients/tools and some media use-cases
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Accept-Ranges', 'Content-Length'],
  maxAge: 86400 // Cache preflight request selama 24 jam
};

module.exports = (req, callback) => {
  const origin = req.header('Origin');

  // No Origin header: treat as non-CORS request (curl/postman or some same-origin navigations).
  if (!origin) {
    return callback(null, { ...baseOptions, origin: false });
  }

  const allowed = origins.includes(origin) || isSameHostOrigin(origin, req);
  if (allowed) {
    // Reflect origin
    return callback(null, { ...baseOptions, origin: true });
  }

  const err = new Error(`CORS blocked for origin: ${origin}`);
  err.statusCode = 403;
  return callback(err, { ...baseOptions, origin: false });
};
