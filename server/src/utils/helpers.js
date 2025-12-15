/**
 * Helper Functions
 * File: src/utils/helpers.js
 */

/**
 * Format response API yang konsisten
 * @param {boolean} success - Status sukses
 * @param {string} message - Pesan response
 * @param {any} data - Data response (optional)
 * @param {Object} meta - Metadata seperti pagination (optional)
 */
const formatResponse = (success, message, data = null, meta = null) => {
  const response = {
    success,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (meta !== null) {
    response.meta = meta;
  }
  
  return response;
};

/**
 * Format pagination metadata
 * @param {number} page - Halaman saat ini
 * @param {number} limit - Jumlah item per halaman
 * @param {number} total - Total item
 */
const formatPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Parse query params untuk pagination
 * @param {Object} query - Express query object
 * @param {Object} defaults - Default values
 */
const parsePaginationQuery = (query, defaults = {}) => {
  const page = parseInt(query.page) || defaults.page || 1;
  const limit = parseInt(query.limit) || defaults.limit || 20;
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

/**
 * Sanitize filename untuk upload
 * @param {string} filename - Nama file original
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
};

/**
 * Parse nama file lagu dengan format: JUDUL-LAGU#ARTIS#GENRE#NEGARA.mp4
 * @param {string} filename - Nama file
 * @returns {Object} Parsed data {title, artist, genre, language}
 */
const parseSongFilename = (filename) => {
  // Hapus ekstensi
  const baseName = filename.replace(/\.[^/.]+$/, '');
  
  // Split berdasarkan #
  const parts = baseName.split('#');
  
  // Format: JUDUL-LAGU#ARTIS#GENRE#NEGARA
  return {
    title: parts[0] ? parts[0].replace(/-/g, ' ').trim() : 'Unknown Title',
    artist: parts[1] ? parts[1].trim() : 'Unknown Artist',
    genre: parts[2] ? parts[2].trim() : null,
    language: parts[3] ? parts[3].trim() : null
  };
};

/**
 * Generate slug dari string
 * @param {string} text - Text untuk dijadikan slug
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Format durasi dalam detik ke format mm:ss atau hh:mm:ss
 * @param {number} seconds - Durasi dalam detik
 */
const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate score berdasarkan durasi yang dimainkan
 * @param {number} playedDuration - Durasi yang dimainkan (detik)
 * @param {number} totalDuration - Total durasi lagu (detik)
 */
/**
 * Calculate score dengan simulasi performance
 * @param {number} playedDuration - Durasi yang dimainkan (detik)
 * @param {number} totalDuration - Total durasi lagu (detik)
 */
const calculateScore = (playedDuration, totalDuration) => {
  if (!totalDuration || totalDuration <= 0) return 0;
  
  const percentage = (playedDuration / totalDuration) * 100;
  
  // 1. Jika lagu diskip terlalu cepat (< 20%), score rendah (0-20)
  if (percentage < 20) {
    return Math.floor((percentage / 20) * 20);
  }
  
  // 2. Jika lagu tidak selesai (< 85%), score proporsional (20-75)
  if (percentage < 85) {
    // Map 20-85% to 20-75 score
    const score = 20 + ((percentage - 20) / (85 - 20)) * 55;
    return Math.round(score);
  }
  
  // 3. Jika lagu selesai (> 85%), simulasi penilaian "real" (75-100)
  // Base 75, sisa 25 poin adalah "Performance" (Random)
  // Semakin lama durasi diputar, semakin tinggi peluang score bagus
  const perfectionBonus = percentage >= 90 ? 5 : 0; // Bonus jika sampai 90% (dianggap selesai)
  
  // Random fluctuation (0-20)
  // Menggunakan Math.random() agar setiap sesi unik
  const performanceScore = Math.floor(Math.random() * 21);
  
  let finalScore = 75 + performanceScore + perfectionBonus;
  
  // Cap at 100
  return Math.min(Math.round(finalScore), 100);
};

module.exports = {
  formatResponse,
  formatPagination,
  parsePaginationQuery,
  sanitizeFilename,
  parseSongFilename,
  generateSlug,
  formatDuration,
  calculateScore
};
