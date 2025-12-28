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

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { THUMBNAILS_PATH } = require('../config/paths');

// Ensure thumbnail upload directory exists
const thumbUploadDir = THUMBNAILS_PATH;
if (!fs.existsSync(thumbUploadDir)) {
  fs.mkdirSync(thumbUploadDir, { recursive: true });
}

// Multer config for Thumbnails
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, thumbUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `thumb_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diizinkan'));
    }
  }
});

// Songs management
router.get('/songs', adminController.getAllSongs);
router.post('/songs', adminController.createSong);
router.put('/songs/:id', adminController.updateSong);
router.delete('/songs/:id', adminController.deleteSong);
router.post('/songs/:id/thumbnail', upload.single('thumbnail'), adminController.uploadThumbnail);
router.post('/songs/scan', adminController.scanSongs);
router.post('/songs/sync-files', adminController.syncSongsWithFiles);

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
