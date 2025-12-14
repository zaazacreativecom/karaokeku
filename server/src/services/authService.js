/**
 * Auth Service - Business logic untuk autentikasi
 * File: src/services/authService.js
 */

const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

/**
 * Registrasi user baru
 * @param {Object} userData - Data user {name, email, username, password}
 * @returns {Object} User dan token
 */
const register = async (userData) => {
  const { name, email, username, password } = userData;
  
  // Cek apakah email sudah terdaftar
  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    const error = new Error('Email sudah terdaftar.');
    error.statusCode = 400;
    throw error;
  }
  
  // Cek apakah username sudah digunakan
  const existingUsername = await User.findOne({ where: { username } });
  if (existingUsername) {
    const error = new Error('Username sudah digunakan.');
    error.statusCode = 400;
    throw error;
  }
  
  // Buat user baru
  const user = await User.create({
    name,
    email,
    username,
    password_hash: password, // Akan di-hash oleh hook
    role: 'user'
  });
  
  // Generate token
  const token = generateToken(user);
  
  return {
    user: user.toJSON(),
    token
  };
};

/**
 * Login user
 * @param {Object} credentials - {emailOrUsername, password}
 * @returns {Object} User dan token
 */
const login = async (credentials) => {
  const { emailOrUsername, password } = credentials;
  
  // Cari user berdasarkan email atau username
  const user = await User.findOne({
    where: {
      [require('sequelize').Op.or]: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    }
  });
  
  if (!user) {
    const error = new Error('Email/username atau password salah.');
    error.statusCode = 401;
    throw error;
  }
  
  // Verifikasi password
  const isValidPassword = await user.verifyPassword(password);
  
  if (!isValidPassword) {
    const error = new Error('Email/username atau password salah.');
    error.statusCode = 401;
    throw error;
  }
  
  // Generate token
  const token = generateToken(user);
  
  return {
    user: user.toJSON(),
    token
  };
};

/**
 * Get user profile dengan statistik
 * @param {number} userId - ID user
 * @returns {Object} User profile
 */
const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password_hash'] }
  });
  
  if (!user) {
    const error = new Error('User tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  return user.toJSON();
};

/**
 * Update user profile
 * @param {number} userId - ID user
 * @param {Object} updateData - Data yang diupdate
 * @returns {Object} Updated user
 */
const updateProfile = async (userId, updateData) => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    const error = new Error('User tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  // Field yang boleh diupdate
  const allowedFields = ['name', 'email', 'username', 'avatar_url'];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  }
  
  await user.save();
  
  return user.toJSON();
};

/**
 * Change password
 * @param {number} userId - ID user
 * @param {Object} passwords - {currentPassword, newPassword}
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    const error = new Error('User tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  // Verifikasi password lama
  const isValid = await user.verifyPassword(currentPassword);
  
  if (!isValid) {
    const error = new Error('Password lama tidak sesuai.');
    error.statusCode = 400;
    throw error;
  }
  
  // Update password
  user.password_hash = newPassword;
  await user.save();
  
  return true;
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
