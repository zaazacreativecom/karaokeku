/**
 * Admin Controller - Handle request admin panel
 * File: src/controllers/adminController.js
 */

const { User, Song, Upload, PlayHistory, Setting, sequelize } = require('../models');
const songService = require('../services/songService');
const uploadService = require('../services/uploadService');
const { scanDirectory, addSongsToDatabase, SUPPORTED_EXTENSIONS } = require('../utils/songScanner');
const { formatResponse, formatPagination, parseSongFilename } = require('../utils/helpers');
const { generateThumbnail } = require('../utils/thumbnailGenerator');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// ==========================================
// DASHBOARD
// ==========================================

/**
 * GET /api/admin/dashboard
 * Dapatkan statistik dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Total users
    const totalUsers = await User.count({ where: { role: 'user' } });
    
    // Total songs
    const totalSongs = await Song.count();
    const activeSongs = await Song.count({ where: { status: 'active' } });
    
    // Total plays
    const totalPlays = await PlayHistory.count();
    
    // Plays hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const playsToday = await PlayHistory.count({
      where: {
        created_at: { [Op.gte]: today }
      }
    });
    
    // Pending uploads
    const pendingUploads = await Upload.count({ where: { status: 'pending' } });
    
    // Top songs
    const topSongs = await Song.findAll({
      where: { status: 'active' },
      order: [['play_count', 'DESC']],
      limit: 5
    });
    
    // Recent users
    const recentUsers = await User.findAll({
      where: { role: 'user' },
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'username', 'email', 'created_at']
    });
    
    res.json(formatResponse(true, 'Dashboard stats berhasil diambil.', {
      totalUsers,
      totalSongs,
      activeSongs,
      totalPlays,
      playsToday,
      pendingUploads,
      topSongs,
      recentUsers
    }));
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SONGS MANAGEMENT
// ==========================================

/**
 * GET /api/admin/songs
 * Dapatkan semua lagu (admin)
 */
const getAllSongs = async (req, res, next) => {
  try {
    const { search, genre, language, status, page, limit } = req.query;
    
    const result = await songService.getAllSongs({
      search,
      genre,
      language,
      status: status || null, // Admin bisa lihat semua status
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    res.json(formatResponse(
      true,
      'Berhasil mendapatkan daftar lagu.',
      result.songs,
      formatPagination(result.page, result.limit, result.total)
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/songs
 * Tambah lagu baru
 */
const createSong = async (req, res, next) => {
  try {
    const songData = req.body;
    
    if (!songData.title || !songData.artist) {
      return res.status(400).json(
        formatResponse(false, 'Judul dan artis wajib diisi.')
      );
    }
    
    const song = await songService.createSong(songData);

    // Auto-generate thumbnail if missing and local video exists
    if (!songData.thumbnail_url && song.video_url_full) {
        try {
            // Determine local path
            // Assumes URL /videos/xyz.mp4 -> uploads/videos/xyz.mp4
            let videoRelativePath = song.video_url_full;
            if (videoRelativePath.startsWith('/')) videoRelativePath = videoRelativePath.substring(1);
            
            // Should map /videos/ -> /uploads/videos/
            // But existing 'file_path' in DB might provide better clue?
            // Let's assume standard mapping: /videos -> uploads/videos
            
            let localVideoPath = '';
            if (videoRelativePath.startsWith('videos/')) {
                 localVideoPath = path.join(__dirname, '../../uploads', videoRelativePath);
            } else if (videoRelativePath.startsWith('uploads/')) {
                 localVideoPath = path.join(__dirname, '../../', videoRelativePath);
            } else {
                 // Try prepending uploads/videos if it's just a filename or unknown path
                 localVideoPath = path.join(__dirname, '../../uploads/videos', path.basename(videoRelativePath));
            }


            if (fs.existsSync(localVideoPath)) {
                const thumbOutput = path.join(__dirname, '../../uploads/thumbnails');
                const generatedThumb = await generateThumbnail(localVideoPath, thumbOutput, `thumb_${song.id}`);
                
                await song.update({ thumbnail_url: generatedThumb });
                // Reload song data
                await song.reload();
            }
        } catch (genErr) {
            console.error('Thumbnail generation failed (non-fatal):', genErr.message);
        }
    }
    
    res.status(201).json(
      formatResponse(true, 'Lagu berhasil ditambahkan.', song)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/songs/:id/thumbnail
 * Upload thumbnail lagu
 */
const uploadThumbnail = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json(formatResponse(false, 'File thumbnail wajib diupload.'));
    }
    
    const song = await Song.findByPk(id);
    if (!song) {
        // Delete uploaded file if song not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json(formatResponse(false, 'Lagu tidak ditemukan.'));
    }
    
    // Delete old thumbnail if local
    if (song.thumbnail_url && song.thumbnail_url.startsWith('/uploads/thumbnails/')) {
        const oldPath = path.join(__dirname, '../../', song.thumbnail_url);
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
    }
    
    const thumbUrl = `/uploads/thumbnails/${req.file.filename}`;
    await song.update({ thumbnail_url: thumbUrl });
    
    res.json(formatResponse(true, 'Thumbnail berhasil diupload.', { thumbnail_url: thumbUrl }));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/songs/:id
 * Update lagu
 */
const updateSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const song = await songService.updateSong(id, updateData);
    
    res.json(formatResponse(true, 'Lagu berhasil diupdate.', song));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/songs/:id
 * Hapus lagu
 */
const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await songService.deleteSong(id);
    
    res.json(formatResponse(true, 'Lagu berhasil dihapus.'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/songs/scan
 * Scan direktori untuk lagu baru
 */
const scanSongs = async (req, res, next) => {
  try {
    const { directory, dryRun = false } = req.body;
    
    const songsDir = directory || process.env.SONGS_DIRECTORY || './uploads/videos';
    const absolutePath = path.resolve(process.cwd(), songsDir);
    
    // Scan direktori
    const files = scanDirectory(absolutePath);
    
    if (files.length === 0) {
      return res.json(formatResponse(
        true,
        'Tidak ada file video ditemukan.',
        { scanned: 0, added: 0, skipped: 0 }
      ));
    }
    
    // Tambahkan ke database
    const results = await addSongsToDatabase(files, {
      dryRun,
      skipExisting: true
    });
    
    res.json(formatResponse(
      true,
      `Scan selesai. ${results.added} lagu ${dryRun ? 'akan ' : ''}ditambahkan.`,
      {
        directory: absolutePath,
        supportedFormats: SUPPORTED_EXTENSIONS,
        ...results
      }
    ));
  } catch (error) {
    next(error);
  }
};

// ==========================================
// USERS MANAGEMENT
// ==========================================

/**
 * GET /api/admin/users
 * Dapatkan semua users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(formatResponse(
      true,
      'Berhasil mendapatkan daftar user.',
      rows,
      formatPagination(page, limit, count)
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id
 * Update user (admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User tidak ditemukan.')
      );
    }
    
    if (name) user.name = name;
    if (role && ['user', 'admin'].includes(role)) user.role = role;
    
    await user.save();
    
    res.json(formatResponse(true, 'User berhasil diupdate.', user.toJSON()));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Hapus user
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Jangan hapus diri sendiri
    if (parseInt(id) === req.userId) {
      return res.status(400).json(
        formatResponse(false, 'Tidak dapat menghapus akun sendiri.')
      );
    }
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User tidak ditemukan.')
      );
    }
    
    await user.destroy();
    
    res.json(formatResponse(true, 'User berhasil dihapus.'));
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPLOADS MANAGEMENT
// ==========================================

/**
 * GET /api/admin/uploads
 * Dapatkan semua uploads
 */
const getAllUploads = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    
    const result = await uploadService.getAllUploads({
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
    res.json(formatResponse(
      true,
      'Berhasil mendapatkan daftar upload.',
      result.uploads,
      formatPagination(result.page, 20, result.total)
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/uploads/:id
 * Review upload
 */
const reviewUpload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json(
        formatResponse(false, 'Status harus "approved" atau "rejected".')
      );
    }
    
    const result = await uploadService.reviewUpload(id, req.userId, { status, admin_note });
    
    res.json(formatResponse(
      true,
      `Upload ${status === 'approved' ? 'disetujui' : 'ditolak'}.`,
      result
    ));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/uploads/:id
 * Hapus upload (admin)
 */
const deleteUpload = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await uploadService.deleteUpload(id, req.userId, true);
    
    res.json(formatResponse(true, 'Upload berhasil dihapus.'));
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SETTINGS
// ==========================================

/**
 * GET /api/admin/settings
 * Dapatkan semua settings
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findAll();
    
    // Convert ke object
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.setting_key] = {
        value: s.setting_value,
        type: s.setting_type,
        description: s.description
      };
    });
    
    res.json(formatResponse(true, 'Berhasil mendapatkan settings.', settingsObj));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/settings
 * Update settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body; // Object of {key: value}
    
    for (const [key, value] of Object.entries(updates)) {
      await Setting.setValue(key, value);
    }
    
    res.json(formatResponse(true, 'Settings berhasil diupdate.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Dashboard
  getDashboardStats,
  // Songs
  getAllSongs,
  createSong,
  updateSong,
  deleteSong,
  uploadThumbnail,
  scanSongs,
  // Users
  getAllUsers,
  updateUser,
  deleteUser,
  // Uploads
  getAllUploads,
  reviewUpload,
  deleteUpload,
  // Settings
  getSettings,
  updateSettings
};
