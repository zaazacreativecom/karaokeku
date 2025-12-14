/**
 * Playlist Controller - Handle request playlist
 * File: src/controllers/playlistController.js
 */

const playlistService = require('../services/playlistService');
const { formatResponse } = require('../utils/helpers');

/**
 * GET /api/playlists
 * Dapatkan semua playlist milik user
 */
const getMyPlaylists = async (req, res, next) => {
  try {
    const playlists = await playlistService.getUserPlaylists(req.userId);
    
    res.json(formatResponse(true, 'Berhasil mendapatkan daftar playlist.', playlists));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/playlists/:id
 * Dapatkan detail playlist
 */
const getPlaylistById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const playlist = await playlistService.getPlaylistById(id, req.userId);
    
    res.json(formatResponse(true, 'Berhasil mendapatkan detail playlist.', playlist));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/playlists
 * Buat playlist baru
 */
const createPlaylist = async (req, res, next) => {
  try {
    const { name, description, is_public, cover_url } = req.body;
    
    if (!name) {
      return res.status(400).json(
        formatResponse(false, 'Nama playlist wajib diisi.')
      );
    }
    
    const playlist = await playlistService.createPlaylist(req.userId, {
      name,
      description,
      is_public,
      cover_url
    });
    
    res.status(201).json(
      formatResponse(true, 'Playlist berhasil dibuat.', playlist)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/playlists/:id
 * Update playlist
 */
const updatePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const playlist = await playlistService.updatePlaylist(id, req.userId, updateData);
    
    res.json(formatResponse(true, 'Playlist berhasil diupdate.', playlist));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/playlists/:id
 * Hapus playlist
 */
const deletePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await playlistService.deletePlaylist(id, req.userId);
    
    res.json(formatResponse(true, 'Playlist berhasil dihapus.'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/playlists/:id/songs
 * Tambah lagu ke playlist
 */
const addSongToPlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    
    if (!songId) {
      return res.status(400).json(
        formatResponse(false, 'ID lagu wajib diisi.')
      );
    }
    
    const item = await playlistService.addSongToPlaylist(id, req.userId, songId);
    
    res.status(201).json(
      formatResponse(true, 'Lagu berhasil ditambahkan ke playlist.', item)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/playlists/:id/songs/:itemId
 * Hapus lagu dari playlist
 */
const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    
    await playlistService.removeSongFromPlaylist(id, req.userId, itemId);
    
    res.json(formatResponse(true, 'Lagu berhasil dihapus dari playlist.'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/playlists/:id/reorder
 * Ubah urutan lagu dalam playlist
 */
const reorderPlaylistItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // Array of {itemId, position}
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json(
        formatResponse(false, 'Data urutan tidak valid.')
      );
    }
    
    await playlistService.reorderPlaylistItems(id, req.userId, items);
    
    res.json(formatResponse(true, 'Urutan playlist berhasil diubah.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistItems
};
