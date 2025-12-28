/**
 * Song Maintenance Service
 * File: src/services/songMaintenanceService.js
 *
 * Tujuan:
 * - Hapus record lagu di database jika file video lokalnya sudah tidak ada.
 * - Bisa dipanggil manual (admin endpoint) atau via scheduler.
 */

const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { Song } = require('../models');
const songService = require('./songService');
const { VIDEOS_PATH, videosUrlToFilePath } = require('../config/paths');

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

const fileLooksValid = (filePath) => {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile() && stat.size > 0;
  } catch (_) {
    return false;
  }
};

const replaceExtension = (value, newExt) => {
  const ext = path.extname(value);
  if (!ext) return `${value}${newExt}`;
  return `${value.slice(0, -ext.length)}${newExt}`;
};

const buildLocalVideoCandidates = (song) => {
  const candidates = [];

  const filePath = toAbsolutePath(song?.file_path);
  if (filePath && isWithin(VIDEOS_PATH, filePath)) {
    candidates.push(filePath);
  }

  const fromFullUrl = videosUrlToFilePath(song?.video_url_full);
  if (fromFullUrl && isWithin(VIDEOS_PATH, fromFullUrl)) {
    candidates.push(fromFullUrl);
  }

  const fromInsUrl = videosUrlToFilePath(song?.video_url_instrumental);
  if (fromInsUrl && isWithin(VIDEOS_PATH, fromInsUrl)) {
    candidates.push(fromInsUrl);
  }

  return Array.from(new Set(candidates));
};

const hasExistingLocalVideo = (song) => {
  const candidates = buildLocalVideoCandidates(song);
  if (candidates.length === 0) return { isLocal: false, exists: true, candidates };

  for (const candidate of candidates) {
    if (fileLooksValid(candidate)) return { isLocal: true, exists: true, candidates };

    const ext = path.extname(candidate).toLowerCase();
    // Untuk .mpg, anggap file .mp4 varian-nya valid juga (hasil konversi on-demand).
    if (ext === '.mpg') {
      const mp4Variant = replaceExtension(candidate, '.mp4');
      if (fileLooksValid(mp4Variant)) return { isLocal: true, exists: true, candidates: [...candidates, mp4Variant] };
    }
  }

  return { isLocal: true, exists: false, candidates };
};

/**
 * Hapus lagu-lagu lokal yang file videonya sudah hilang.
 * @param {{dryRun?: boolean, limit?: number}} options
 */
const pruneMissingLocalSongs = async (options = {}) => {
  const { dryRun = false, limit = 0 } = options;

  const where = {
    [Op.or]: [
      { video_url_full: { [Op.like]: '/videos/%' } },
      { video_url_instrumental: { [Op.like]: '/videos/%' } },
      { file_path: { [Op.ne]: null } }
    ]
  };

  const songs = await Song.findAll({
    where,
    order: [['id', 'ASC']],
    ...(limit > 0 ? { limit: parseInt(limit) } : {})
  });

  const summary = {
    checked: songs.length,
    missing: 0,
    deleted: 0,
    dryRun,
    errors: []
  };

  for (const song of songs) {
    const status = hasExistingLocalVideo(song);
    if (!status.isLocal) continue;
    if (status.exists) continue;

    summary.missing += 1;

    if (dryRun) continue;

    try {
      await songService.deleteSong(song.id, { deleteFiles: true });
      summary.deleted += 1;
    } catch (error) {
      summary.errors.push({
        songId: song.id,
        title: song.title,
        artist: song.artist,
        error: error.message || String(error)
      });
    }
  }

  return summary;
};

module.exports = {
  pruneMissingLocalSongs
};
