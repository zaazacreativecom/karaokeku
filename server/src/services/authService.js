/**
 * Auth Service - Business logic untuk autentikasi
 * File: src/services/authService.js
 */

const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const crypto = require('crypto');
const { verifyFirebaseIdToken } = require('../config/firebaseAdmin');
const { Op, fn, col, where: sequelizeWhere } = require('sequelize');

const normalizeUsernameBase = (raw) => {
  const cleaned = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (cleaned.length >= 3) return cleaned;

  return `user_${crypto.randomBytes(3).toString('hex')}`;
};

const buildUsername = (base, suffix = '') => {
  const safeSuffix = String(suffix || '').trim();
  const maxLen = 100;
  const baseMax = safeSuffix ? maxLen - (safeSuffix.length + 1) : maxLen;
  const trimmedBase = String(base || '').slice(0, Math.max(3, baseMax));
  return safeSuffix ? `${trimmedBase}_${safeSuffix}` : trimmedBase;
};

const generateUniqueUsername = async (seed) => {
  const base = normalizeUsernameBase(seed);

  const initial = buildUsername(base);
  const initialExists = await User.findOne({ where: { username: initial } });
  if (!initialExists) return initial;

  for (let attempt = 1; attempt <= 25; attempt += 1) {
    const suffix = String(attempt);
    const candidate = buildUsername(base, suffix);
    const exists = await User.findOne({ where: { username: candidate } });
    if (!exists) return candidate;
  }

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const suffix = crypto.randomBytes(2).toString('hex');
    const candidate = buildUsername(base, suffix);
    const exists = await User.findOne({ where: { username: candidate } });
    if (!exists) return candidate;
  }

  return buildUsername('user', crypto.randomBytes(6).toString('hex'));
};

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
  const identity = String(emailOrUsername || '').trim();
  const identityLower = identity.toLowerCase();

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { username: identity },
        sequelizeWhere(fn('LOWER', fn('TRIM', col('email'))), identityLower)
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
 * Login / register via Google Firebase (ID token)
 * @param {Object} payload - { idToken }
 * @returns {Object} User dan token
 */
const loginWithGoogle = async ({ idToken }) => {
  if (!idToken) {
    const error = new Error('Firebase ID token wajib diisi.');
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = await verifyFirebaseIdToken(idToken);
  } catch (err) {
    if (err?.statusCode) throw err;
    const error = new Error('Firebase ID token tidak valid.');
    error.statusCode = 401;
    throw error;
  }

  const provider = decoded?.firebase?.sign_in_provider;
  if (provider && provider !== 'google.com') {
    const error = new Error('Provider Firebase tidak didukung untuk login Google.');
    error.statusCode = 401;
    throw error;
  }

  const email = String(decoded?.email || '').trim().toLowerCase();
  if (!email) {
    const error = new Error('Email dari Google tidak ditemukan.');
    error.statusCode = 401;
    throw error;
  }

  if (decoded?.email_verified !== true) {
    const error = new Error('Email Google belum terverifikasi.');
    error.statusCode = 401;
    throw error;
  }

  const displayName = String(decoded?.name || '').trim();
  const avatarUrl = String(decoded?.picture || '').trim() || null;

  let user = await User.findOne({ where: { email } });

  if (!user) {
    const emailPrefix = email.split('@')[0] || 'user';
    const username = await generateUniqueUsername(emailPrefix);

    user = await User.create({
      name: displayName || username,
      email,
      username,
      password_hash: crypto.randomBytes(32).toString('hex'),
      role: 'user',
      avatar_url: avatarUrl
    });
  } else {
    let changed = false;
    if (!user.avatar_url && avatarUrl) {
      user.avatar_url = avatarUrl;
      changed = true;
    }
    if ((!user.name || user.name === user.username) && displayName) {
      user.name = displayName;
      changed = true;
    }
    if (changed) {
      await user.save();
    }
  }

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
  loginWithGoogle,
  getProfile,
  updateProfile,
  changePassword
};
