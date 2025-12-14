/**
 * Index Routes - Gabungkan semua routes
 * File: src/routes/index.js
 */

const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./authRoutes');
const songRoutes = require('./songRoutes');
const playlistRoutes = require('./playlistRoutes');
const playbackRoutes = require('./playbackRoutes');
const uploadRoutes = require('./uploadRoutes');
const adminRoutes = require('./adminRoutes');
const requestRoutes = require('./requests');
const donationRoutes = require('./donations');
const chatRoutes = require('./chat');
const paymentMethodRoutes = require('./paymentMethods');

// API health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Karaoke API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      songs: '/api/songs',
      playlists: '/api/playlists',
      playback: '/api/playback',
      uploads: '/api/uploads',
      admin: '/api/admin',
      requests: '/api/requests',
      donations: '/api/donations',
      chat: '/api/chat',
      paymentMethods: '/api/payment-methods'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/songs', songRoutes);
router.use('/playlists', playlistRoutes);
router.use('/playback', playbackRoutes);
router.use('/uploads', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/requests', requestRoutes);
router.use('/donations', donationRoutes);
router.use('/chat', chatRoutes);
router.use('/payment-methods', paymentMethodRoutes);

module.exports = router;
