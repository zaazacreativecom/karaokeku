/**
 * Playlist Routes
 * File: src/routes/playlistRoutes.js
 */

const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { requireAuth } = require('../middlewares/auth');

// Semua route butuh auth
router.use(requireAuth);

router.get('/', playlistController.getMyPlaylists);
router.post('/', playlistController.createPlaylist);
router.get('/:id', playlistController.getPlaylistById);
router.put('/:id', playlistController.updatePlaylist);
router.delete('/:id', playlistController.deletePlaylist);

// Playlist items
router.post('/:id/songs', playlistController.addSongToPlaylist);
router.delete('/:id/songs/:itemId', playlistController.removeSongFromPlaylist);
router.put('/:id/reorder', playlistController.reorderPlaylistItems);

module.exports = router;
