/**
 * Upload Controller - Handle request upload video user
 * File: src/controllers/uploadController.js
 */

const uploadService = require('../services/uploadService');
const { formatResponse, formatPagination } = require('../utils/helpers');
const { deleteFile } = require('../middlewares/upload');

/**
 * POST /api/uploads
 * Upload video karaoke
 */
const uploadVideo = async (req, res, next) => {
  try {
    const { title, artist, genre, language, lyrics_data } = req.body;
    const videoFile = req.files?.video?.[0] || req.file;
    const thumbnailFile = req.files?.thumbnail?.[0] || null;
    
    if (!title) {
      return res.status(400).json(
        formatResponse(false, 'Judul lagu wajib diisi.')
      );
    }
    
    if (!videoFile) {
      return res.status(400).json(
        formatResponse(false, 'File video wajib diupload.')
      );
    }

    // Optional: validate thumbnail size (default 2MB)
    if (thumbnailFile) {
      const maxThumbSizeMB = parseInt(process.env.UPLOAD_THUMBNAIL_MAX_SIZE) || 2;
      const maxBytes = maxThumbSizeMB * 1024 * 1024;

      if (thumbnailFile.size > maxBytes) {
        // Cleanup uploaded files
        deleteFile(videoFile.path);
        deleteFile(thumbnailFile.path);

        return res.status(400).json(
          formatResponse(false, `Ukuran thumbnail maksimal ${maxThumbSizeMB}MB.`)
        );
      }
    }
    
    const upload = await uploadService.processUpload(
      req.userId,
      { title, artist, genre, language, lyrics_data },
      videoFile,
      thumbnailFile
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
