/**
 * Song Service - Business logic untuk lagu
 * File: src/services/songService.js
 */

const { Op } = require('sequelize');
const { Song, PlaylistItem, PlayHistory, UserScore, Favorite, sequelize } = require('../models');
const { deleteSongMediaFiles } = require('../utils/songMediaCleanup');

/**
 * Dapatkan semua lagu dengan filter dan pagination
 * @param {Object} options - Filter options
 */
const getAllSongs = async (options = {}) => {
  const {
    search = '',
    genre = '',
    language = '',
    status = 'active',
    page = 1,
    limit = 20,
    sortBy = 'title',
    sortOrder = 'ASC'
  } = options;
  
  const offset = (page - 1) * limit;
  
  // Build where clause
  const where = {};
  
  if (status) {
    where.status = status;
  }
  
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { artist: { [Op.like]: `%${search}%` } }
    ];
  }
  
  if (genre) {
    where.genre = genre;
  }
  
  if (language) {
    where.language = language;
  }
  
  // Query
  const { count, rows } = await Song.findAndCountAll({
    where,
    order: [[sortBy, sortOrder]],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  return {
    songs: rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * Dapatkan detail lagu berdasarkan ID
 * @param {number} songId - ID lagu
 */
const getSongById = async (songId) => {
  const song = await Song.findByPk(songId);
  
  if (!song) {
    const error = new Error('Lagu tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  return song;
};

/**
 * Dapatkan top songs berdasarkan play count
 * @param {number} limit - Jumlah lagu
 */
const getTopSongs = async (limit = 10) => {
  const songs = await Song.findAll({
    where: { status: 'active' },
    order: [['play_count', 'DESC']],
    limit: parseInt(limit)
  });
  
  return songs;
};

/**
 * Dapatkan daftar genre yang tersedia
 */
const getGenres = async () => {
  const genres = await Song.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('genre')), 'genre']],
    where: {
      genre: { [Op.ne]: null },
      status: 'active'
    },
    raw: true
  });
  
  return genres.map(g => g.genre).filter(Boolean);
};

/**
 * Dapatkan daftar bahasa/negara yang tersedia
 */
const getLanguages = async () => {
  const languages = await Song.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('language')), 'language']],
    where: {
      language: { [Op.ne]: null },
      status: 'active'
    },
    raw: true
  });
  
  return languages.map(l => l.language).filter(Boolean);
};

/**
 * Increment play count
 * @param {number} songId - ID lagu
 */
const incrementPlayCount = async (songId) => {
  const song = await Song.findByPk(songId);
  
  if (song) {
    song.play_count += 1;
    await song.save();
    return song.play_count;
  }
  
  return 0;
};

/**
 * Helper to strip localhost from URLs
 */
const cleanUrl = (url) => {
  if (!url) return url;
  if (typeof url === 'string' && url.includes('localhost')) {
    return url.replace(/^http(s)?:\/\/localhost(:\d+)?/, '');
  }
  return url;
};

/**
 * Buat lagu baru (admin)
 * @param {Object} songData - Data lagu
 */
const createSong = async (songData) => {
  // Sanitize URLs
  if (songData.thumbnail_url) songData.thumbnail_url = cleanUrl(songData.thumbnail_url);
  if (songData.video_url_full) songData.video_url_full = cleanUrl(songData.video_url_full);
  if (songData.video_url_instrumental) songData.video_url_instrumental = cleanUrl(songData.video_url_instrumental);

  const song = await Song.create(songData);
  return song;
};

/**
 * Update lagu (admin)
 * @param {number} songId - ID lagu
 * @param {Object} updateData - Data yang diupdate
 */
const updateSong = async (songId, updateData) => {
  const song = await Song.findByPk(songId);
  
  if (!song) {
    const error = new Error('Lagu tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  // Sanitize URLs
  if (updateData.thumbnail_url) updateData.thumbnail_url = cleanUrl(updateData.thumbnail_url);
  if (updateData.video_url_full) updateData.video_url_full = cleanUrl(updateData.video_url_full);
  if (updateData.video_url_instrumental) updateData.video_url_instrumental = cleanUrl(updateData.video_url_instrumental);

  await song.update(updateData);
  return song;
};

/**
 * Hapus lagu (admin)
 * @param {number} songId - ID lagu
 */
const deleteSong = async (songId, options = {}) => {
  const { deleteFiles = true } = options;
  const song = await Song.findByPk(songId);
  
  if (!song) {
    const error = new Error('Lagu tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // Hapus record terkait terlebih dahulu (hindari foreign key constraint errors)
  await sequelize.transaction(async (transaction) => {
    await PlaylistItem.destroy({ where: { song_id: song.id }, transaction });
    await PlayHistory.destroy({ where: { song_id: song.id }, transaction });
    await UserScore.destroy({ where: { song_id: song.id }, transaction });
    await Favorite.destroy({ where: { song_id: song.id }, transaction });
    await song.destroy({ transaction });
  });

  // Best-effort: hapus file media lokal terkait lagu (video/thumbnail/low variants)
  if (deleteFiles) {
    try {
      const result = await deleteSongMediaFiles(song);
      if (result.errors.length > 0) {
        console.warn('⚠️  Beberapa file gagal dihapus:', result.errors);
      }
    } catch (error) {
      console.warn('⚠️  Gagal menghapus file media lagu (non-fatal):', error.message || error);
    }
  }

  return true;
};

/**
 * Search lagu dengan full text
 * @param {string} query - Search query
 */
const searchSongs = async (query, limit = 10) => {
  const songs = await Song.findAll({
    where: {
      [Op.and]: [
        { status: 'active' },
        {
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
            { artist: { [Op.like]: `%${query}%` } }
          ]
        }
      ]
    },
    order: [['play_count', 'DESC']],
    limit: parseInt(limit)
  });
  
  return songs;
};

module.exports = {
  getAllSongs,
  getSongById,
  getTopSongs,
  getGenres,
  getLanguages,
  incrementPlayCount,
  createSong,
  updateSong,
  deleteSong,
  searchSongs
};
