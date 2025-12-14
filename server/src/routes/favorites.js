/**
 * Favorite Routes
 * File: src/routes/favorites.js
 */

const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { requireAuth } = require('../middlewares/auth');

// Public route (mostly for Landing Page)
router.get('/popular', favoriteController.getPopularFavorites);

// Protected routes
router.use(requireAuth);
router.get('/', favoriteController.getFavorites);
router.get('/ids', favoriteController.getFavoriteIds);
router.post('/toggle', favoriteController.toggleFavorite);

module.exports = router;
