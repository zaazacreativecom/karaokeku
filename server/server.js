/**
 * Server Entry Point
 * File: server.js
 * 
 * Jalankan dengan: npm run dev (development) atau npm start (production)
 */

const http = require('http');
const app = require('./app');
const { testConnection } = require('./src/config/database');
const { syncDatabase } = require('./src/models');
const { initializeSocket } = require('./src/socket');
const { pruneMissingLocalSongs } = require('./src/services/songMaintenanceService');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Make io available in app locals (optional, but using helper is better)
app.set('io', io);

/**
 * Inisialisasi dan jalankan server
 */
const startServer = async () => {
  try {
    console.log('🎵 ====================================');
    console.log('   KARAOKE SERVER');
    console.log('====================================\n');
    
    // Test koneksi database
    console.log('📦 Menghubungkan ke database...');
    await testConnection();
    
    // Sync database (create/alter tables)
    console.log('🔄 Sinkronisasi tabel database...');
    const shouldAlter = process.env.DB_SYNC_ALTER === 'true' || process.env.NODE_ENV === 'development';
    await syncDatabase({ alter: shouldAlter });
    
    // Buat admin default jika belum ada
    await createDefaultAdmin();

    // Optional: background job to keep DB in sync with files in uploads/videos
    startSongFileSyncJob();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`\n🚀 Server berjalan di port ${PORT}`);
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      console.log(`\n🎤 Karaoke server siap digunakan!`);
      console.log('====================================\n');
    });
    
  } catch (error) {
    console.error('\n❌ Gagal menjalankan server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

const startSongFileSyncJob = () => {
  const intervalMinutes = parseInt(process.env.SONG_FILE_SYNC_INTERVAL_MINUTES || '0', 10);
  if (!Number.isFinite(intervalMinutes) || intervalMinutes <= 0) return;

  const intervalMs = intervalMinutes * 60 * 1000;
  let running = false;

  const runOnce = async () => {
    if (running) return;
    running = true;
    try {
      const result = await pruneMissingLocalSongs({ dryRun: false });
      if (result?.deleted > 0 || (result?.errors?.length || 0) > 0) {
        console.log('🧹 Song file sync result:', result);
      }
    } catch (error) {
      console.warn('⚠️  Song file sync job error:', error.message || error);
    } finally {
      running = false;
    }
  };

  // Run at startup then periodically.
  runOnce();
  setInterval(runOnce, intervalMs);
  console.log(`🕒 Song file sync job aktif: tiap ${intervalMinutes} menit`);
};

/**
 * Buat user admin default jika belum ada
 */
const createDefaultAdmin = async () => {
  try {
    const { User } = require('./src/models');
    
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      console.log('👤 Membuat admin default...');
      
      await User.create({
        name: 'Administrator',
        email: 'admin@karaoke.local',
        username: 'admin',
        password_hash: 'admin123', // Akan di-hash oleh hook
        role: 'admin'
      });
      
      console.log('✅ Admin default dibuat:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   ⚠️  SEGERA GANTI PASSWORD DI PRODUCTION!\n');
    }
  } catch (error) {
    console.error('⚠️  Gagal membuat admin default:', error.message);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Jalankan server
startServer();
