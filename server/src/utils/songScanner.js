/**
 * Song Scanner - Utility untuk scan file lagu di direktori
 * dan menambahkan ke database secara otomatis
 * 
 * Format nama file: JUDUL LAGU#NAMA ARTIS#NEGARA.mp4 / .mpg
 * Contoh: Bohemian Rhapsody#Queen#UK.mp4
 * 
 * Jalankan dengan: npm run scan-songs
 * 
 * File: src/utils/songScanner.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { SONGS_DIRECTORY, VIDEOS_PATH } = require('../config/paths');

const { Op } = require('sequelize');
const { Song, sequelize } = require('../models');
const { parseSongFilename } = require('./helpers');
const { ensureSongThumbnail } = require('./songThumbnail');

// Ekstensi video yang didukung
const SUPPORTED_EXTENSIONS = ['.mp4', '.mpg'];
const SKIP_DIR_NAMES = new Set(['low']);
const SONG_FILENAME_REGEX = /^([^#]*[^#\s][^#]*)#([^#]*[^#\s][^#]*)#([^#]*[^#\s][^#]*)\.(mp4|mpg)$/i;

const toPosixPath = (value) => String(value || '').split(path.sep).join('/');

const computeVideoUrl = (fullPath) => {
  const rel = path.relative(VIDEOS_PATH, fullPath);
  // Not within VIDEOS_PATH => cannot be served from /videos
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return `/videos/${toPosixPath(rel)}`;
};

/**
 * Scan direktori untuk file lagu
 * @param {string} directory - Path direktori yang akan di-scan
 * @returns {Array} Array of file info objects
 */
const scanDirectory = (directory) => {
  const files = [];
  
  if (!fs.existsSync(directory)) {
    console.log(`⚠️  Direktori tidak ditemukan: ${directory}`);
    return files;
  }
  
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      if (SKIP_DIR_NAMES.has(item.name)) {
        continue;
      }
      // Rekursif scan subdirectory
      files.push(...scanDirectory(fullPath));
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      
      // Jika ada pasangan .mpg dan .mp4 dengan basename yang sama,
      // skip .mp4 agar tidak menambah duplikat (misalnya hasil konversi on-demand).
      if (ext === '.mp4') {
        const base = path.basename(item.name, ext);
        const mpgCandidateLower = path.join(directory, `${base}.mpg`);
        const mpgCandidateUpper = path.join(directory, `${base}.MPG`);
        if (fs.existsSync(mpgCandidateLower) || fs.existsSync(mpgCandidateUpper)) {
          continue;
        }
      }

      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        const stats = fs.statSync(fullPath);
        const videoUrl = computeVideoUrl(fullPath);
        files.push({
          filename: item.name,
          fullPath,
          relativePath: path.relative(process.cwd(), fullPath),
          size: stats.size,
          extension: ext,
          isValidFormat: SONG_FILENAME_REGEX.test(item.name),
          videoUrl
        });
      }
    }
  }
  
  return files;
};

/**
 * Tambahkan lagu ke database dari hasil scan
 * @param {Array} files - Array of file info dari scanDirectory
 * @param {Object} options - Options {dryRun, skipExisting}
 */
const addSongsToDatabase = async (files, options = {}) => {
  const { dryRun = false, skipExisting = true } = options;
  
  const results = {
    total: files.length,
    added: 0,
    skipped: 0,
    ignored: 0,
    errors: []
  };
  
  console.log(`\n📂 Memproses ${files.length} file lagu...\n`);
  
  for (const file of files) {
    try {
      if (!file?.videoUrl) {
        console.log(`⏭️  Abaikan (di luar folder videos): ${file.filename}`);
        results.ignored++;
        continue;
      }

      const isValidFormat = file?.isValidFormat ?? SONG_FILENAME_REGEX.test(file.filename);
      if (!isValidFormat) {
        console.log(`⏭️  Abaikan (format tidak valid): ${file.filename}`);
        results.ignored++;
        continue;
      }

      // Parse nama file untuk metadata
      const metadata = parseSongFilename(file.filename);
      
      // Cek apakah sudah ada di database
      if (skipExisting) {
        const filePathCandidates = Array.from(new Set([file.relativePath, file.fullPath].filter(Boolean)));

        const existing = await Song.findOne({
          where: {
            [Op.or]: [
              { video_url_full: file.videoUrl },
              filePathCandidates.length ? { file_path: { [Op.in]: filePathCandidates } } : null
            ].filter(Boolean)
          }
        });
        
        if (existing) {
          // Auto-fix URL jika file cocok tapi URL masih legacy (tanpa subfolder)
          const matchesFilePath = filePathCandidates.includes(existing.file_path);
          const shouldUpdateUrl =
            matchesFilePath &&
            typeof existing.video_url_full === 'string' &&
            existing.video_url_full.startsWith('/videos/') &&
            existing.video_url_full !== file.videoUrl;
          if (!dryRun && shouldUpdateUrl) {
            await existing.update({
              video_url_full: file.videoUrl,
              video_url_instrumental: file.videoUrl
            });
            console.log(`♻️  Update URL: ${metadata.title} - ${metadata.artist}`);
            results.skipped++;
            continue;
          }

          console.log(`⏭️  Skip (sudah ada): ${metadata.title} - ${metadata.artist}`);
          results.skipped++;
          continue;
        }
      }
      
      if (dryRun) {
        console.log(`🔍 [DRY RUN] Akan ditambahkan: ${metadata.title} - ${metadata.artist}`);
        console.log(`   Genre: ${metadata.genre || '-'}, Bahasa: ${metadata.language || '-'}`);
        console.log(`   Path: ${file.relativePath}\n`);
        results.added++;
        continue;
      }
      
      // Tambahkan ke database
      const song = await Song.create({
        title: metadata.title,
        artist: metadata.artist,
        genre: metadata.genre,
        language: metadata.language,
        file_path: file.relativePath,
        video_url_full: file.videoUrl,
        video_url_instrumental: file.videoUrl, // Sama untuk saat ini
        status: 'active',
        play_count: 0
      });

      await ensureSongThumbnail(song, { preferredVideoPath: file.fullPath });
      
      console.log(`✅ Ditambahkan: ${song.title} - ${song.artist} (ID: ${song.id})`);
      results.added++;
      
    } catch (error) {
      console.error(`❌ Error memproses ${file.filename}: ${error.message}`);
      results.errors.push({
        file: file.filename,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Main function untuk menjalankan scan
 */
const runScanner = async () => {
  console.log('🎵 ====================================');
  console.log('   KARAOKE SONG SCANNER');
  console.log('====================================\n');
  
  // Ambil direktori dari env atau gunakan default
  const songsDirectory = process.env.SONGS_DIRECTORY || SONGS_DIRECTORY;
  const absolutePath = path.resolve(process.cwd(), songsDirectory);
  
  console.log(`📁 Scanning direktori: ${absolutePath}`);
  console.log(`📋 Format file: JUDUL LAGU#NAMA ARTIS#NEGARA.mp4 / .mpg\n`);
  
  // Check arguments
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const force = args.includes('--force') || args.includes('-f');
  
  if (dryRun) {
    console.log('🔍 Mode: DRY RUN (tidak ada perubahan database)\n');
  }
  
  try {
    // Test koneksi database
    await sequelize.authenticate();
    console.log('✅ Koneksi database berhasil!\n');
    
    // Scan direktori
    const files = scanDirectory(absolutePath);
    
    if (files.length === 0) {
      console.log('⚠️  Tidak ada file video dengan format yang valid ditemukan di direktori.');
      console.log('   Pastikan file memiliki ekstensi: ' + SUPPORTED_EXTENSIONS.join(', '));
      console.log('   dan mengikuti format: JUDUL LAGU#NAMA ARTIS#NEGARA.mp4 / .mpg');
      process.exit(0);
    }
    
    const validCount = files.filter((f) => f.isValidFormat).length;
    const invalidCount = files.length - validCount;
    console.log(`📊 Ditemukan ${files.length} file video (${SUPPORTED_EXTENSIONS.join(', ')})`);
    console.log(`✅ Valid format: ${validCount}`);
    console.log(`⏭️  Diabaikan (format tidak valid): ${invalidCount}\n`);
    
    // Tambahkan ke database
    const results = await addSongsToDatabase(files, {
      dryRun,
      skipExisting: !force
    });
    
    // Print summary
    console.log('\n====================================');
    console.log('📊 RINGKASAN');
    console.log('====================================');
    console.log(`Total file: ${results.total}`);
    console.log(`Ditambahkan: ${results.added}`);
    console.log(`Dilewati: ${results.skipped}`);
    console.log(`Diabaikan (format tidak valid): ${results.ignored}`);
    console.log(`Error: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Daftar Error:');
      results.errors.forEach(e => {
        console.log(`   - ${e.file}: ${e.error}`);
      });
    }
    
    console.log('\n✅ Scan selesai!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Export untuk digunakan sebagai module
module.exports = {
  scanDirectory,
  addSongsToDatabase,
  runScanner,
  SUPPORTED_EXTENSIONS
};

// Jalankan jika dipanggil langsung
if (require.main === module) {
  runScanner();
}
