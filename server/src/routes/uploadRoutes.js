/**
 * Upload Routes
 * File: src/routes/uploadRoutes.js
 */

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { requireAuth } = require('../middlewares/auth');
const { uploadVideo } = require('../middlewares/upload');

// Semua route butuh auth
router.use(requireAuth);

// Upload video
router.post('/', uploadVideo.single('video'), uploadController.uploadVideo);

// My uploads
router.get('/me', uploadController.getMyUploads);
router.delete('/:id', uploadController.deleteMyUpload);

module.exports = router;
