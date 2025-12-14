/**
 * Playback Routes
 * File: src/routes/playbackRoutes.js
 */

const express = require('express');
const router = express.Router();
const playbackController = require('../controllers/playbackController');
const { requireAuth, optionalAuth } = require('../middlewares/auth');

// Playback (logged in users)
router.post('/start', requireAuth, playbackController.startPlayback);
router.post('/end', requireAuth, playbackController.endPlayback);

// User scores & history
router.get('/me/scores', requireAuth, playbackController.getMyScoreSummary);
router.get('/me/history', requireAuth, playbackController.getMyPlayHistory);

// Leaderboard (public)
router.get('/leaderboard', optionalAuth, playbackController.getLeaderboard);

module.exports = router;
