/**
 * Upload Controller - Handle request upload video user
 * File: src/controllers/uploadController.js
 */

const uploadService = require('../services/uploadService');
const { formatResponse, formatPagination } = require('../utils/helpers');

/**
 * POST /api/uploads
 * Upload video karaoke
 */
const uploadVideo = async (req, res, next) => {
  try {
    const { title, artist, genre, language, lyrics_data } = req.body;
    const file = req.file;
    
    if (!title) {
      return res.status(400).json(
        formatResponse(false, 'Judul lagu wajib diisi.')
      );
    }
    
    if (!file) {
      return res.status(400).json(
        formatResponse(false, 'File video wajib diupload.')
      );
    }
    
    const upload = await uploadService.processUpload(
      req.userId,
      { title, artist, genre, language, lyrics_data },
      file
    );
    
    res.status(201).json(
      formatResponse(true, 'Video berhasil diupload dan menunggu review admin.', upload)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/uploads/me
 * Dapatkan upload milik user
 */
const getMyUploads = async (req, res, next) => {
  try {
    const uploads = await uploadService.getUserUploads(req.userId);
    
    res.json(formatResponse(true, 'Berhasil mendapatkan daftar upload.', uploads));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/uploads/:id
 * Hapus upload (oleh pemilik)
 */
const deleteMyUpload = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await uploadService.deleteUpload(id, req.userId, false);
    
    res.json(formatResponse(true, 'Upload berhasil dihapus.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadVideo,
  getMyUploads,
  deleteMyUpload
};
