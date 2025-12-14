/**
 * Admin Routes
 * File: src/routes/adminRoutes.js
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/admin');

// Semua route butuh auth + admin
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Songs management
router.get('/songs', adminController.getAllSongs);
router.post('/songs', adminController.createSong);
router.put('/songs/:id', adminController.updateSong);
router.delete('/songs/:id', adminController.deleteSong);
router.post('/songs/scan', adminController.scanSongs);

// Users management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Uploads management
router.get('/uploads', adminController.getAllUploads);
router.put('/uploads/:id', adminController.reviewUpload);
router.delete('/uploads/:id', adminController.deleteUpload);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
