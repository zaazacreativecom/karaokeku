/**
 * Admin Middleware - Verifikasi role admin
 * File: src/middlewares/admin.js
 */

const { formatResponse } = require('../utils/helpers');

/**
 * Middleware untuk proteksi route admin
 * Harus digunakan SETELAH requireAuth
 */
const requireAdmin = (req, res, next) => {
  // Pastikan user sudah terautentikasi
  if (!req.user) {
    return res.status(401).json(
      formatResponse(false, 'Anda harus login terlebih dahulu.')
    );
  }
  
  // Cek role admin
  if (req.user.role !== 'admin') {
    return res.status(403).json(
      formatResponse(false, 'Akses ditolak. Hanya admin yang dapat mengakses resource ini.')
    );
  }
  
  next();
};

module.exports = {
  requireAdmin
};
