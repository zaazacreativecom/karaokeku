/**
 * Song Controller - Handle request lagu
 * File: src/controllers/songController.js
 */

const songService = require('../services/songService');
const { formatResponse, formatPagination } = require('../utils/helpers');

/**
 * GET /api/songs
 * Dapatkan semua lagu dengan filter
 */
const getAllSongs = async (req, res, next) => {
  try {
    const { search, genre, language, page, limit, sortBy, sortOrder } = req.query;
    
    const result = await songService.getAllSongs({
      search,
      genre,
      language,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'title',
      sortOrder: sortOrder || 'ASC'
    });
    
    res.json(formatResponse(
      true,
      'Berhasil mendapatkan daftar lagu.',
      result.songs,
      formatPagination(result.page, result.limit, result.total)
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/songs/:id
 * Dapatkan detail lagu
 */
const getSongById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const song = await songService.getSongById(id);
    
    res.json(formatResponse(true, 'Berhasil mendapatkan detail lagu.', song));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/songs/top
 * Dapatkan top songs
 */
const getTopSongs = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const songs = await songService.getTopSongs(parseInt(limit) || 10);
    
    res.json(formatResponse(true, 'Berhasil mendapatkan top songs.', songs));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/songs/genres
 * Dapatkan daftar genre
 */
const getGenres = async (req, res, next) => {
  try {
    const genres = await songService.getGenres();
    
    res.json(formatResponse(true, 'Berhasil mendapatkan daftar genre.', genres));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/songs/languages
 * Dapatkan daftar bahasa
 */
const getLanguages = async (req, res, next) => {
  try {
    const languages = await songService.getLanguages();
    
    res.json(formatResponse(true, 'Berhasil mendapatkan daftar bahasa.', languages));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/songs/search
 * Quick search lagu
 */
const searchSongs = async (req, res, next) => {
  try {
    const { q, limit } = req.query;
    
    if (!q) {
      return res.json(formatResponse(true, 'Query pencarian kosong.', []));
    }
    
    const songs = await songService.searchSongs(q, parseInt(limit) || 10);
    
    res.json(formatResponse(true, 'Berhasil mencari lagu.', songs));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  getTopSongs,
  getGenres,
  getLanguages,
  searchSongs
};
