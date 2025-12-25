/**
 * Upload Middleware - Konfigurasi Multer untuk file upload
 * File: src/middlewares/upload.js
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { UPLOAD_PATH, VIDEOS_PATH, TEMP_PATH } = require('../config/paths');

// Pastikan direktori ada
[UPLOAD_PATH, VIDEOS_PATH, TEMP_PATH].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Format video yang diizinkan
const getAllowedFormats = () => {
  const formats = process.env.ALLOWED_VIDEO_FORMATS || 'mp4,mkv,webm,avi';
  return formats.split(',').map(f => f.trim().toLowerCase());
};

// Maksimal ukuran file (dalam bytes)
const getMaxFileSize = () => {
  const sizeMB = parseInt(process.env.UPLOAD_MAX_SIZE) || 500;
  return sizeMB * 1024 * 1024;
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_PATH);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const allowedFormats = getAllowedFormats();
  
  if (allowedFormats.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Format file tidak diizinkan. Format yang diizinkan: ${allowedFormats.join(', ')}`), false);
  }
};

// Multer instance untuk video
const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: getMaxFileSize(),
    files: 1
  }
});

// Multer instance untuk multiple files (jika diperlukan)
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: getMaxFileSize(),
    files: 5
  }
});

/**
 * Pindahkan file dari temp ke direktori final
 * @param {string} tempPath - Path file di temp
 * @param {string} destDir - Direktori tujuan
 * @param {string} newFilename - Nama file baru (opsional)
 */
const moveToFinal = async (tempPath, destDir = VIDEOS_PATH, newFilename = null) => {
  try {
    const filename = newFilename || path.basename(tempPath);
    const destPath = path.join(destDir, filename);
    
    // Pastikan direktori tujuan ada
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Pindahkan file
    fs.renameSync(tempPath, destPath);
    
    return destPath;
  } catch (error) {
    throw new Error(`Gagal memindahkan file: ${error.message}`);
  }
};

/**
 * Hapus file
 * @param {string} filePath - Path file yang akan dihapus
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Gagal menghapus file ${filePath}:`, error);
    return false;
  }
};

module.exports = {
  uploadVideo,
  uploadMultiple,
  moveToFinal,
  deleteFile,
  UPLOAD_PATH,
  VIDEOS_PATH,
  TEMP_PATH
};
