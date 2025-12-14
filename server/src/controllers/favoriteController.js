/**
 * Favorite Controller - Handle favorite songs
 * File: src/controllers/favoriteController.js
 */

const { Favorite, Song, sequelize } = require('../models');
const { formatResponse, formatPagination } = require('../utils/helpers');

/**
 * POST /api/favorites/toggle
 * Body: { songId }
 */
const toggleFavorite = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const userId = req.userId;

    const existingFavorite = await Favorite.findOne({
      where: { user_id: userId, song_id: songId }
    });

    if (existingFavorite) {
      await existingFavorite.destroy();
      return res.json(formatResponse(true, 'Lagu dihapus dari favorit.', { isFavorite: false }));
    } else {
      await Favorite.create({ user_id: userId, song_id: songId });
      return res.json(formatResponse(true, 'Lagu ditambahkan ke favorit.', { isFavorite: true }));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/favorites
 * Get user's favorite songs
 */
const getFavorites = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.userId;

    const { count, rows } = await Favorite.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Song,
          as: 'song',
          where: { status: 'active' } // Only show active songs
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Flatten structure to return list of songs with added 'is_favorite' flag if needed
    // But mostly frontend needs the Song objects
    const songs = rows.map(fav => fav.song);

    res.json(formatResponse(
      true, 
      'Daftar lagu favorit berhasil diambil.', 
      songs,
      formatPagination(page, limit, count)
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/favorites/ids
 * Get list of song IDs favorited by user (for quick frontend check)
 */
const getFavoriteIds = async (req, res, next) => {
  try {
    const userId = req.userId;
    const favorites = await Favorite.findAll({
      where: { user_id: userId },
      attributes: ['song_id']
    });
    
    const ids = favorites.map(f => f.song_id);
    res.json(formatResponse(true, 'Favorite IDs retrieved', ids));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/favorites/popular
 * Get most favorited songs (for Landing Page)
 */
const getPopularFavorites = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    // Count favorites group by song_id
    const popular = await Favorite.findAll({
      attributes: [
        'song_id',
        [sequelize.fn('COUNT', sequelize.col('user_id')), 'favorite_count']
      ],
      group: ['song_id'],
      order: [[sequelize.literal('favorite_count'), 'DESC']],
      limit: parseInt(limit),
      include: [
        {
            model: Song,
            as: 'song',
            where: { status: 'active' }
        }
      ]
    });

    // Format response
    const songs = popular.map(item => {
        const songJSON = item.song.toJSON();
        songJSON.favorite_count = parseInt(item.getDataValue('favorite_count'));
        return songJSON;
    });

    res.json(formatResponse(true, 'Top favorites retrieved', songs));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
  getFavoriteIds,
  getPopularFavorites
};
