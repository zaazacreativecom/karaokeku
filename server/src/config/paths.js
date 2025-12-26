/**
 * Path Configuration - Uploads & Media directories
 * File: src/config/paths.js
 */

const path = require('path');
require('dotenv').config();

const resolvePath = (value) => (value ? path.resolve(value) : null);

// Upload root directory (can be absolute or relative to process.cwd())
const UPLOAD_PATH = resolvePath(process.env.UPLOAD_PATH) || path.resolve(process.cwd(), 'uploads');

// Derived directories
const VIDEOS_PATH = path.join(UPLOAD_PATH, 'videos');
const VIDEOS_LOW_PATH = path.join(VIDEOS_PATH, 'low');
const TEMP_PATH = path.join(UPLOAD_PATH, 'temp');
const THUMBNAILS_PATH = path.join(UPLOAD_PATH, 'thumbnails');
const QR_PATH = path.join(UPLOAD_PATH, 'qr');
const ICONS_PATH = path.join(UPLOAD_PATH, 'icons');

// Songs scan directory
const SONGS_DIRECTORY = resolvePath(process.env.SONGS_DIRECTORY) || VIDEOS_PATH;

const isWithin = (root, candidate) => {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

const safeJoin = (root, ...segments) => {
  const full = path.resolve(root, ...segments);
  return isWithin(root, full) ? full : null;
};

/**
 * Convert a public `/uploads/...` URL to a safe absolute filesystem path.
 * Returns null if the URL is invalid or attempts path traversal.
 */
const uploadsUrlToFilePath = (urlPath) => {
  if (!urlPath || typeof urlPath !== 'string') return null;
  if (!urlPath.startsWith('/uploads/')) return null;

  const rel = urlPath.slice('/uploads/'.length);
  return safeJoin(UPLOAD_PATH, rel);
};

/**
 * Convert a public `/videos/<filename>` URL to an absolute filesystem path.
 */
const videosUrlToFilePath = (urlPath) => {
  if (!urlPath || typeof urlPath !== 'string') return null;
  const cleanPath = urlPath.split('?')[0].split('#')[0];
  if (!cleanPath.startsWith('/videos/')) return null;

  const rel = cleanPath.slice('/videos/'.length);
  if (!rel) return null;

  const segments = rel
    .split('/')
    .filter(Boolean)
    .map((seg) => {
      try {
        return decodeURIComponent(seg);
      } catch (_) {
        return seg;
      }
    });

  return safeJoin(VIDEOS_PATH, ...segments);
};

module.exports = {
  UPLOAD_PATH,
  VIDEOS_PATH,
  VIDEOS_LOW_PATH,
  TEMP_PATH,
  THUMBNAILS_PATH,
  QR_PATH,
  ICONS_PATH,
  SONGS_DIRECTORY,
  uploadsUrlToFilePath,
  videosUrlToFilePath
};
