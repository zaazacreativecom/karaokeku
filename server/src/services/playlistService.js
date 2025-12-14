/**
 * Playlist Service - Business logic untuk playlist
 * File: src/services/playlistService.js
 */

const { Playlist, PlaylistItem, Song, sequelize } = require('../models');

/**
 * Dapatkan semua playlist milik user
 * @param {number} userId - ID user
 */
const getUserPlaylists = async (userId) => {
  const playlists = await Playlist.findAll({
    where: { user_id: userId },
    include: [
      {
        model: PlaylistItem,
        as: 'items',
        include: [
          {
            model: Song,
            as: 'song',
            attributes: ['id', 'title', 'artist', 'thumbnail_url', 'duration']
          }
        ],
        order: [['position', 'ASC']]
      }
    ],
    order: [['updated_at', 'DESC']]
  });
  
  // Hitung jumlah lagu per playlist
  return playlists.map(p => ({
    ...p.toJSON(),
    songCount: p.items ? p.items.length : 0
  }));
};

/**
 * Dapatkan detail playlist
 * @param {number} playlistId - ID playlist
 * @param {number} userId - ID user (untuk validasi ownership)
 */
const getPlaylistById = async (playlistId, userId = null) => {
  const playlist = await Playlist.findByPk(playlistId, {
    include: [
      {
        model: PlaylistItem,
        as: 'items',
        include: [
          {
            model: Song,
            as: 'song'
          }
        ],
        order: [['position', 'ASC']]
      }
    ]
  });
  
  if (!playlist) {
    const error = new Error('Playlist tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  // Cek ownership jika playlist private
  if (!playlist.is_public && userId && playlist.user_id !== userId) {
    const error = new Error('Anda tidak memiliki akses ke playlist ini.');
    error.statusCode = 403;
    throw error;
  }
  
  return playlist;
};

/**
 * Buat playlist baru
 * @param {number} userId - ID user
 * @param {Object} playlistData - Data playlist {name, description, is_public}
 */
const createPlaylist = async (userId, playlistData) => {
  const { name, description, is_public = false, cover_url } = playlistData;
  
  const playlist = await Playlist.create({
    user_id: userId,
    name,
    description,
    is_public,
    cover_url
  });
  
  return playlist;
};

/**
 * Update playlist
 * @param {number} playlistId - ID playlist
 * @param {number} userId - ID user (untuk validasi)
 * @param {Object} updateData - Data yang diupdate
 */
const updatePlaylist = async (playlistId, userId, updateData) => {
  const playlist = await Playlist.findByPk(playlistId);
  
  if (!playlist) {
    const error = new Error('Playlist tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  if (playlist.user_id !== userId) {
    const error = new Error('Anda tidak memiliki akses untuk mengubah playlist ini.');
    error.statusCode = 403;
    throw error;
  }
  
  const allowedFields = ['name', 'description', 'is_public', 'cover_url'];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      playlist[field] = updateData[field];
    }
  }
  
  await playlist.save();
  return playlist;
};

/**
 * Hapus playlist
 * @param {number} playlistId - ID playlist
 * @param {number} userId - ID user (untuk validasi)
 */
const deletePlaylist = async (playlistId, userId) => {
  const playlist = await Playlist.findByPk(playlistId);
  
  if (!playlist) {
    const error = new Error('Playlist tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  if (playlist.user_id !== userId) {
    const error = new Error('Anda tidak memiliki akses untuk menghapus playlist ini.');
    error.statusCode = 403;
    throw error;
  }
  
  await playlist.destroy(); // Items akan terhapus otomatis (CASCADE)
  return true;
};

/**
 * Tambah lagu ke playlist
 * @param {number} playlistId - ID playlist
 * @param {number} userId - ID user
 * @param {number} songId - ID lagu
 */
const addSongToPlaylist = async (playlistId, userId, songId) => {
  // Validasi playlist
  const playlist = await Playlist.findByPk(playlistId);
  
  if (!playlist) {
    const error = new Error('Playlist tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  if (playlist.user_id !== userId) {
    const error = new Error('Anda tidak memiliki akses ke playlist ini.');
    error.statusCode = 403;
    throw error;
  }
  
  // Validasi lagu
  const song = await Song.findByPk(songId);
  
  if (!song) {
    const error = new Error('Lagu tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  // Cek apakah lagu sudah ada di playlist
  const existingItem = await PlaylistItem.findOne({
    where: { playlist_id: playlistId, song_id: songId }
  });
  
  if (existingItem) {
    const error = new Error('Lagu sudah ada di playlist ini.');
    error.statusCode = 400;
    throw error;
  }
  
  // Dapatkan posisi terakhir
  const lastItem = await PlaylistItem.findOne({
    where: { playlist_id: playlistId },
    order: [['position', 'DESC']]
  });
  
  const position = lastItem ? lastItem.position + 1 : 0;
  
  // Tambahkan item
  const item = await PlaylistItem.create({
    playlist_id: playlistId,
    song_id: songId,
    position
  });
  
  return item;
};

/**
 * Hapus lagu dari playlist
 * @param {number} playlistId - ID playlist
 * @param {number} userId - ID user
 * @param {number} itemId - ID playlist item
 */
const removeSongFromPlaylist = async (playlistId, userId, itemId) => {
  // Validasi playlist
  const playlist = await Playlist.findByPk(playlistId);
  
  if (!playlist) {
    const error = new Error('Playlist tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  if (playlist.user_id !== userId) {
    const error = new Error('Anda tidak memiliki akses ke playlist ini.');
    error.statusCode = 403;
    throw error;
  }
  
  // Hapus item
  const item = await PlaylistItem.findOne({
    where: { id: itemId, playlist_id: playlistId }
  });
  
  if (!item) {
    const error = new Error('Item tidak ditemukan di playlist.');
    error.statusCode = 404;
    throw error;
  }
  
  await item.destroy();
  return true;
};

/**
 * Ubah urutan lagu dalam playlist
 * @param {number} playlistId - ID playlist
 * @param {number} userId - ID user
 * @param {Array} itemOrder - Array of {itemId, position}
 */
const reorderPlaylistItems = async (playlistId, userId, itemOrder) => {
  // Validasi playlist
  const playlist = await Playlist.findByPk(playlistId);
  
  if (!playlist) {
    const error = new Error('Playlist tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  if (playlist.user_id !== userId) {
    const error = new Error('Anda tidak memiliki akses ke playlist ini.');
    error.statusCode = 403;
    throw error;
  }
  
  // Update posisi dalam transaction
  const transaction = await sequelize.transaction();
  
  try {
    for (const item of itemOrder) {
      await PlaylistItem.update(
        { position: item.position },
        {
          where: {
            id: item.itemId,
            playlist_id: playlistId
          },
          transaction
        }
      );
    }
    
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistItems
};
