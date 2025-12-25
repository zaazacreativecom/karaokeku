/**
 * Song Thumbnail Helper
 * File: src/utils/songThumbnail.js
 *
 * Buat thumbnail otomatis dari video jika thumbnail_url belum ada.
 */

const fs = require('fs');
const path = require('path');
const { THUMBNAILS_PATH, uploadsUrlToFilePath, videosUrlToFilePath } = require('../config/paths');
const { generateThumbnail } = require('./thumbnailGenerator');

const resolveLocalVideoPath = (song, preferredVideoPath = null) => {
  if (preferredVideoPath && fs.existsSync(preferredVideoPath)) return preferredVideoPath;

  // file_path can be absolute or relative
  if (song?.file_path) {
    const candidate = path.isAbsolute(song.file_path)
      ? song.file_path
      : path.resolve(process.cwd(), song.file_path);

    if (fs.existsSync(candidate)) return candidate;
  }

  const candidates = [song?.video_url_full, song?.video_url_instrumental].filter(Boolean);
  for (const urlPath of candidates) {
    const fsPath = videosUrlToFilePath(urlPath) || uploadsUrlToFilePath(urlPath);
    if (fsPath && fs.existsSync(fsPath)) return fsPath;
  }

  return null;
};

/**
 * Ensure song has a thumbnail_url by generating from its video when possible.
 * Non-fatal: returns null if thumbnail cannot be generated.
 * @param {import('sequelize').Model} song - Sequelize Song instance
 * @param {Object} options
 * @param {string|null} options.preferredVideoPath - Absolute path to video to use (optional)
 * @returns {Promise<string|null>} thumbnail_url when generated (or already exists)
 */
const ensureSongThumbnail = async (song, options = {}) => {
  if (!song) return null;
  if (song.thumbnail_url) return song.thumbnail_url;

  const localVideoPath = resolveLocalVideoPath(song, options.preferredVideoPath || null);
  if (!localVideoPath) return null;

  try {
    const thumbnailUrl = await generateThumbnail(localVideoPath, THUMBNAILS_PATH, `thumb_${song.id}`);
    await song.update({ thumbnail_url: thumbnailUrl });
    return thumbnailUrl;
  } catch (error) {
    console.error('Thumbnail generation failed (non-fatal):', error.message);
    return null;
  }
};

module.exports = {
  ensureSongThumbnail
};

