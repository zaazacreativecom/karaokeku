/**
 * Upload Service - Business logic untuk upload video karaoke user
 * File: src/services/uploadService.js
 */

const { Upload, User, Song } = require('../models');
const { moveToFinal, deleteFile, VIDEOS_PATH } = require('../middlewares/upload');
const path = require('path');
const { ensureLowVideoVariant } = require('../utils/videoLowVariant');
const { ensureSongThumbnail } = require('../utils/songThumbnail');
const { uploadsUrlToFilePath } = require('../config/paths');
const { optimizeUploadedVideo, optimizeUploadedThumbnail } = require('../utils/mediaOptimizer');
const fs = require('fs');

/**
 * Proses upload video karaoke dari user
 * @param {number} userId - ID user
 * @param {Object} uploadData - Data upload
 * @param {Object} videoFile - Multer file object (video)
 * @param {Object|null} thumbnailFile - Multer file object (thumbnail, optional)
 */
const processUpload = async (userId, uploadData, videoFile, thumbnailFile = null) => {
  const { title, artist, genre, language, lyrics_data } = uploadData;
  
  if (!videoFile) {
    const error = new Error('File video tidak ditemukan.');
    error.statusCode = 400;
    throw error;
  }

  // Auto-compress/optimize uploaded media (best-effort)
  const shouldOptimizeVideo = (process.env.UPLOAD_OPTIMIZE_VIDEO || 'true').toLowerCase() !== 'false';
  const shouldOptimizeThumbnail = (process.env.UPLOAD_OPTIMIZE_THUMBNAIL || 'true').toLowerCase() !== 'false';

  if (shouldOptimizeVideo && videoFile?.path) {
    try {
      const result = await optimizeUploadedVideo(videoFile.path);
      videoFile.path = result.outputPath;
      const stat = fs.existsSync(videoFile.path) ? fs.statSync(videoFile.path) : null;
      if (stat?.isFile()) videoFile.size = stat.size;
    } catch (error) {
      console.warn('Video optimization failed (non-fatal):', error.message);
    }
  }

  if (shouldOptimizeThumbnail && thumbnailFile?.path) {
    try {
      const result = await optimizeUploadedThumbnail(thumbnailFile.path);
      thumbnailFile.path = result.outputPath;
      const stat = fs.existsSync(thumbnailFile.path) ? fs.statSync(thumbnailFile.path) : null;
      if (stat?.isFile()) thumbnailFile.size = stat.size;
    } catch (error) {
      console.warn('Thumbnail optimization failed (non-fatal):', error.message);
    }
  }

  const thumbnailUrl = thumbnailFile?.path ? `/uploads/thumbnails/${path.basename(thumbnailFile.path)}` : null;

  try {
    // Buat upload record (status: pending)
    const upload = await Upload.create({
      user_id: userId,
      title,
      artist,
      genre,
      language,
      file_path: videoFile.path, // Masih di temp
      file_size: videoFile.size,
      thumbnail_url: thumbnailUrl,
      lyrics_data: lyrics_data ? JSON.parse(lyrics_data) : null,
      status: 'pending'
    });

    return upload;
  } catch (error) {
    // Cleanup on failure to avoid orphan files
    deleteFile(videoFile.path);
    if (thumbnailFile?.path) deleteFile(thumbnailFile.path);
    throw error;
  }
};

/**
 * Dapatkan semua upload (admin)
 * @param {Object} options - Filter options
 */
const getAllUploads = async (options = {}) => {
  const { status, page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;
  
  const where = {};
  if (status) {
    where.status = status;
  }
  
  const { count, rows } = await Upload.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'uploader',
        attributes: ['id', 'name', 'username', 'email']
      },
      {
        model: User,
        as: 'reviewer',
        attributes: ['id', 'name', 'username']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  return {
    uploads: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit)
  };
};

/**
 * Dapatkan upload milik user
 * @param {number} userId - ID user
 */
const getUserUploads = async (userId) => {
  const uploads = await Upload.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']]
  });
  
  return uploads;
};

/**
 * Review upload (admin)
 * @param {number} uploadId - ID upload
 * @param {number} adminId - ID admin yang mereview
 * @param {Object} reviewData - {status: 'approved'|'rejected', admin_note}
 */
const reviewUpload = async (uploadId, adminId, reviewData) => {
  const { status, admin_note } = reviewData;
  
  if (!['approved', 'rejected'].includes(status)) {
    const error = new Error('Status tidak valid. Gunakan "approved" atau "rejected".');
    error.statusCode = 400;
    throw error;
  }
  
  const upload = await Upload.findByPk(uploadId);
  
  if (!upload) {
    const error = new Error('Upload tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  if (upload.status !== 'pending') {
    const error = new Error('Upload ini sudah direview sebelumnya.');
    error.statusCode = 400;
    throw error;
  }
  
  // Update status
  upload.status = status;
  upload.admin_note = admin_note;
  upload.reviewed_by = adminId;
  upload.reviewed_at = new Date();
  await upload.save();
  
  // Jika approved, pindahkan file dan tambahkan ke songs
  if (status === 'approved') {
    try {
      // Pindahkan file ke direktori final
      const filename = path.basename(upload.file_path);
      const finalPath = await moveToFinal(upload.file_path, VIDEOS_PATH, filename);
      
      // Update path di upload
      upload.file_path = finalPath;
      await upload.save();
      
      // Buat entry di songs
      const song = await Song.create({
        title: upload.title,
        artist: upload.artist,
        genre: upload.genre,
        language: upload.language,
        video_url_full: `/videos/${filename}`,
        video_url_instrumental: `/videos/${filename}`,
        thumbnail_url: upload.thumbnail_url || null,
        lyrics_data: upload.lyrics_data,
        file_path: finalPath,
        status: 'active',
        play_count: 0
      });

      // Auto-generate thumbnail from the uploaded video (non-fatal)
      await ensureSongThumbnail(song, { preferredVideoPath: finalPath });

      // Generate low-quality variant (non-blocking). Video quality turun, audio tetap.
      ensureLowVideoVariant(finalPath, filename).catch((error) => {
        console.error('Error generating low-quality video variant:', error);
      });
      
      return { upload, song };
    } catch (error) {
      // Rollback status jika gagal
      upload.status = 'pending';
      upload.admin_note = `Error saat memproses: ${error.message}`;
      await upload.save();
      throw error;
    }
  }
  
  // Jika rejected, hapus file
  if (status === 'rejected') {
    deleteFile(upload.file_path);
    if (upload.thumbnail_url) {
      const thumbPath = uploadsUrlToFilePath(upload.thumbnail_url);
      if (thumbPath) deleteFile(thumbPath);
    }
  }
  
  return { upload };
};

/**
 * Hapus upload (admin atau pemilik)
 * @param {number} uploadId - ID upload
 * @param {number} userId - ID user (untuk validasi)
 * @param {boolean} isAdmin - Apakah user adalah admin
 */
const deleteUpload = async (uploadId, userId, isAdmin = false) => {
  const upload = await Upload.findByPk(uploadId);
  
  if (!upload) {
    const error = new Error('Upload tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }
  
  // Validasi ownership (kecuali admin)
  if (!isAdmin && upload.user_id !== userId) {
    const error = new Error('Anda tidak memiliki akses untuk menghapus upload ini.');
    error.statusCode = 403;
    throw error;
  }
  
  // Tidak bisa hapus jika sudah approved
  if (upload.status === 'approved') {
    const error = new Error('Upload yang sudah disetujui tidak dapat dihapus.');
    error.statusCode = 400;
    throw error;
  }
  
  // Hapus file
  deleteFile(upload.file_path);
  if (upload.thumbnail_url) {
    const thumbPath = uploadsUrlToFilePath(upload.thumbnail_url);
    if (thumbPath) deleteFile(thumbPath);
  }
  
  // Hapus record
  await upload.destroy();
  
  return true;
};

module.exports = {
  processUpload,
  getAllUploads,
  getUserUploads,
  reviewUpload,
  deleteUpload
};
