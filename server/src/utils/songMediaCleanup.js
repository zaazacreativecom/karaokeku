/**
 * Song Media Cleanup
 * File: src/utils/songMediaCleanup.js
 *
 * Tujuan:
 * - Menghapus file video/thumbnail lokal yang terkait dengan record Song.
 * - Aman: hanya menghapus file di dalam folder uploads (UPLOAD_PATH).
 */

const fs = require('fs');
const path = require('path');
const {
  UPLOAD_PATH,
  VIDEOS_PATH,
  VIDEOS_LOW_PATH,
  uploadsUrlToFilePath,
  videosUrlToFilePath
} = require('../config/paths');

const isWithin = (root, candidate) => {
  if (!root || !candidate) return false;
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

const toAbsolutePath = (value) => {
  if (!value || typeof value !== 'string') return null;
  // Only strip query string. Do NOT strip '#', because filenames can contain '#'.
  const clean = value.split('?')[0];
  return path.isAbsolute(clean) ? clean : path.resolve(process.cwd(), clean);
};

const safeAdd = (set, filePath) => {
  if (!filePath) return;
  if (!isWithin(UPLOAD_PATH, filePath)) return;
  set.add(filePath);
};

const replaceExtension = (value, newExt) => {
  const ext = path.extname(value);
  if (!ext) return `${value}${newExt}`;
  return `${value.slice(0, -ext.length)}${newExt}`;
};

/**
 * Kumpulkan semua path media lokal yang relevan untuk sebuah lagu.
 * @param {object} song Sequelize Song instance/POJO
 * @returns {{videoPaths: string[], thumbnailPaths: string[], allPaths: string[]}}
 */
const collectSongMediaPaths = (song) => {
  const videoPaths = new Set();
  const thumbnailPaths = new Set();

  // Candidate: file_path
  safeAdd(videoPaths, toAbsolutePath(song?.file_path));

  // Candidate: video URLs
  safeAdd(videoPaths, videosUrlToFilePath(song?.video_url_full));
  safeAdd(videoPaths, videosUrlToFilePath(song?.video_url_instrumental));

  // Candidate: thumbnail URL
  safeAdd(thumbnailPaths, uploadsUrlToFilePath(song?.thumbnail_url));

  // Expand: derived variants (low + mpg->mp4)
  const snapshotVideos = Array.from(videoPaths);
  for (const videoPath of snapshotVideos) {
    // If original is .mpg, delete the generated .mp4 variant too (if exists).
    const ext = path.extname(videoPath).toLowerCase();
    if (ext === '.mpg') {
      safeAdd(videoPaths, replaceExtension(videoPath, '.mp4'));
    }

    // Low-quality variants (stored under uploads/videos/low/<relative>)
    if (isWithin(VIDEOS_PATH, videoPath)) {
      const rel = path.relative(VIDEOS_PATH, videoPath);
      safeAdd(videoPaths, path.join(VIDEOS_LOW_PATH, rel));

      // If original is .mpg and we also generate low for the .mp4 variant (preferred),
      // include that low mp4 path as well.
      if (ext === '.mpg') {
        const relMp4 = replaceExtension(rel, '.mp4');
        safeAdd(videoPaths, path.join(VIDEOS_LOW_PATH, relMp4));
      }
    }
  }

  const allPaths = Array.from(new Set([...videoPaths, ...thumbnailPaths]));
  return {
    videoPaths: Array.from(videoPaths),
    thumbnailPaths: Array.from(thumbnailPaths),
    allPaths
  };
};

const deleteFileIfExists = async (filePath) => {
  if (!filePath) return { status: 'skipped', path: filePath };
  if (!isWithin(UPLOAD_PATH, filePath)) return { status: 'skipped', path: filePath };

  try {
    const stat = await fs.promises.lstat(filePath);
    if (!stat.isFile() && !stat.isSymbolicLink()) {
      return { status: 'skipped', path: filePath };
    }
  } catch (error) {
    if (error?.code === 'ENOENT') return { status: 'missing', path: filePath };
    return { status: 'error', path: filePath, error: error.message || String(error) };
  }

  try {
    await fs.promises.unlink(filePath);
    return { status: 'deleted', path: filePath };
  } catch (error) {
    if (error?.code === 'ENOENT') return { status: 'missing', path: filePath };
    return { status: 'error', path: filePath, error: error.message || String(error) };
  }
};

/**
 * Hapus semua media lokal terkait lagu (best-effort).
 * @param {object} song Sequelize Song instance/POJO
 * @returns {Promise<{deleted: string[], missing: string[], errors: Array<{path: string, error: string}>, skipped: string[]}>}
 */
const deleteSongMediaFiles = async (song) => {
  const { allPaths } = collectSongMediaPaths(song);

  const deleted = [];
  const missing = [];
  const skipped = [];
  const errors = [];

  for (const p of allPaths) {
    const result = await deleteFileIfExists(p);
    if (result.status === 'deleted') deleted.push(p);
    else if (result.status === 'missing') missing.push(p);
    else if (result.status === 'skipped') skipped.push(p);
    else if (result.status === 'error') errors.push({ path: p, error: result.error });
  }

  return { deleted, missing, skipped, errors };
};

module.exports = {
  collectSongMediaPaths,
  deleteSongMediaFiles
};
