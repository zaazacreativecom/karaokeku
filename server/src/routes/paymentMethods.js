/**
 * Payment Method Routes
 * File: src/routes/paymentMethods.js
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const paymentMethodController = require('../controllers/paymentMethodController');
const { requireAuth } = require('../middlewares/auth');

// Ensure QR upload directory exists
const qrUploadDir = path.join(__dirname, '../../uploads/qr');
if (!fs.existsSync(qrUploadDir)) {
  fs.mkdirSync(qrUploadDir, { recursive: true });
}

// Multer config for QR code upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, qrUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `qr_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Hanya file gambar yang diizinkan'));
  }
});

// Simple isAdmin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Akses ditolak. Admin only.' });
};

// Public route - get active payment methods
router.get('/', paymentMethodController.getAll);

// Admin routes
router.get('/admin', requireAuth, isAdmin, paymentMethodController.getAllAdmin);
router.post('/', requireAuth, isAdmin, paymentMethodController.create);
router.put('/:id', requireAuth, isAdmin, paymentMethodController.update);
router.delete('/:id', requireAuth, isAdmin, paymentMethodController.delete);
router.post('/:id/qr', requireAuth, isAdmin, upload.single('qr_code'), paymentMethodController.uploadQR);
router.put('/:id/toggle', requireAuth, isAdmin, paymentMethodController.toggleActive);

module.exports = router;
