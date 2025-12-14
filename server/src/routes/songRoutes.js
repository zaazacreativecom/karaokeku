/**
 * Song Routes
 * File: src/routes/songRoutes.js
 */

const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const { optionalAuth } = require('../middlewares/auth');

// Public routes (dengan optional auth untuk tracking)
router.get('/', optionalAuth, songController.getAllSongs);
router.get('/top', songController.getTopSongs);
router.get('/genres', songController.getGenres);
router.get('/languages', songController.getLanguages);
router.get('/search', songController.searchSongs);
router.get('/:id', optionalAuth, songController.getSongById);

module.exports = router;
