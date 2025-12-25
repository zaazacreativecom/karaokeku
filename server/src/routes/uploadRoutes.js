/**
 * Upload Routes
 * File: src/routes/uploadRoutes.js
 */

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { requireAuth } = require('../middlewares/auth');
const { uploadVideoWithThumbnail } = require('../middlewares/upload');

// Semua route butuh auth
router.use(requireAuth);

// Upload video
router.post(
  '/',
  uploadVideoWithThumbnail.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  uploadController.uploadVideo
);

// My uploads
router.get('/me', uploadController.getMyUploads);
router.delete('/:id', uploadController.deleteMyUpload);

module.exports = router;
