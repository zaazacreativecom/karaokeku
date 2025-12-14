/**
 * Auth Controller - Handle request autentikasi
 * File: src/controllers/authController.js
 */

const authService = require('../services/authService');
const { formatResponse } = require('../utils/helpers');

/**
 * POST /api/auth/register
 * Registrasi user baru
 */
const register = async (req, res, next) => {
  try {
    const { name, email, username, password, confirmPassword } = req.body;
    
    // Validasi input
    if (!name || !email || !username || !password) {
      return res.status(400).json(
        formatResponse(false, 'Semua field wajib diisi.')
      );
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json(
        formatResponse(false, 'Password dan konfirmasi password tidak cocok.')
      );
    }
    
    if (password.length < 6) {
      return res.status(400).json(
        formatResponse(false, 'Password minimal 6 karakter.')
      );
    }
    
    const result = await authService.register({ name, email, username, password });
    
    res.status(201).json(
      formatResponse(true, 'Registrasi berhasil!', result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    
    // Validasi input
    if (!emailOrUsername || !password) {
      return res.status(400).json(
        formatResponse(false, 'Email/username dan password wajib diisi.')
      );
    }
    
    const result = await authService.login({ emailOrUsername, password });
    
    res.json(
      formatResponse(true, 'Login berhasil!', result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
const getMe = async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.userId);
    
    res.json(
      formatResponse(true, 'Berhasil mendapatkan profile.', profile)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const updateData = req.body;
    const profile = await authService.updateProfile(req.userId, updateData);
    
    res.json(
      formatResponse(true, 'Profile berhasil diupdate.', profile)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/password
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    
    // Validasi
    if (!currentPassword || !newPassword) {
      return res.status(400).json(
        formatResponse(false, 'Password lama dan baru wajib diisi.')
      );
    }
    
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json(
        formatResponse(false, 'Password baru dan konfirmasi tidak cocok.')
      );
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json(
        formatResponse(false, 'Password baru minimal 6 karakter.')
      );
    }
    
    await authService.changePassword(req.userId, { currentPassword, newPassword });
    
    res.json(
      formatResponse(true, 'Password berhasil diubah.')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
