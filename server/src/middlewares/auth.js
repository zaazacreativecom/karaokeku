/**
 * Auth Middleware - Verifikasi JWT token
 * File: src/middlewares/auth.js
 */

const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');
const { formatResponse } = require('../utils/helpers');

/**
 * Middleware untuk proteksi route yang membutuhkan login
 */
const requireAuth = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        formatResponse(false, 'Token tidak ditemukan. Silakan login terlebih dahulu.')
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verifikasi token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json(
        formatResponse(false, 'Token tidak valid atau sudah expired.')
      );
    }
    
    // Cari user di database
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json(
        formatResponse(false, 'User tidak ditemukan.')
      );
    }
    
    // Attach user ke request
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json(
      formatResponse(false, 'Terjadi kesalahan autentikasi.')
    );
  }
};

/**
 * Middleware opsional - cek token tapi tidak wajib
 * Berguna untuk endpoint yang bisa diakses public tapi butuh info user jika login
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      if (decoded) {
        const user = await User.findByPk(decoded.id);
        if (user) {
          req.user = user;
          req.userId = user.id;
        }
      }
    }
    
    next();
  } catch (error) {
    // Jika error, lanjutkan tanpa user
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth
};
