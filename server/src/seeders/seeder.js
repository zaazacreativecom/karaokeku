/**
 * Database Seeder - Data contoh untuk development
 * File: src/seeders/seeder.js
 * 
 * Jalankan dengan: node src/seeders/seeder.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, User, Song, Playlist, PlaylistItem, Setting, syncDatabase } = require('../models');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeder...\n');
    
    // Sync database
    await syncDatabase({ alter: true });
    
    // ==========================================
    // USERS
    // ==========================================
    console.log('👤 Creating users...');
    
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      await User.create({
        name: 'Administrator',
        email: 'admin@karaoke.local',
        username: 'admin',
        password_hash: 'admin123',
        role: 'admin'
      });
      console.log('   ✅ Admin user created');
    }
    
    const demoUser = await User.findOne({ where: { email: 'demo@karaoke.local' } });
    if (!demoUser) {
      await User.create({
        name: 'Demo User',
        email: 'demo@karaoke.local',
        username: 'demo',
        password_hash: 'demo123',
        role: 'user'
      });
      console.log('   ✅ Demo user created');
    }
    
    // ==========================================
    // SONGS
    // ==========================================
    console.log('🎵 Creating sample songs...');
    
    const sampleSongs = [
      { title: 'Laskar Pelangi', artist: 'Nidji', genre: 'Pop', language: 'Indonesia', duration: 245 },
      { title: 'Dia', artist: 'Anji', genre: 'Pop', language: 'Indonesia', duration: 267 },
      { title: 'Separuh Aku', artist: 'Noah', genre: 'Pop Rock', language: 'Indonesia', duration: 230 },
      { title: 'Kangen', artist: 'Dewa 19', genre: 'Rock', language: 'Indonesia', duration: 285 },
      { title: 'Perahu Kertas', artist: 'Maudy Ayunda', genre: 'Pop', language: 'Indonesia', duration: 210 },
      { title: 'Aku Cinta Kau dan Dia', artist: 'Ahmad Dhani', genre: 'Pop', language: 'Indonesia', duration: 320 },
      { title: 'Terlalu Cinta', artist: 'Rossa', genre: 'Ballad', language: 'Indonesia', duration: 295 },
      { title: 'Bukan Cinta Biasa', artist: 'Siti Nurhaliza', genre: 'Pop', language: 'Indonesia', duration: 258 },
      { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', language: 'English', duration: 355 },
      { title: 'Someone Like You', artist: 'Adele', genre: 'Ballad', language: 'English', duration: 285 },
      { title: 'Shape of You', artist: 'Ed Sheeran', genre: 'Pop', language: 'English', duration: 234 },
      { title: 'Perfect', artist: 'Ed Sheeran', genre: 'Ballad', language: 'English', duration: 263 },
      { title: 'Dynamite', artist: 'BTS', genre: 'K-Pop', language: 'Korean', duration: 199 },
      { title: 'Butter', artist: 'BTS', genre: 'K-Pop', language: 'Korean', duration: 188 },
      { title: 'How You Like That', artist: 'BLACKPINK', genre: 'K-Pop', language: 'Korean', duration: 183 },
    ];
    
    for (const songData of sampleSongs) {
      const exists = await Song.findOne({ where: { title: songData.title, artist: songData.artist } });
      if (!exists) {
        await Song.create({
          ...songData,
          status: 'active',
          play_count: Math.floor(Math.random() * 1000),
          video_url_full: `/videos/${songData.title.toLowerCase().replace(/\s+/g, '-')}.mp4`,
          video_url_instrumental: `/videos/${songData.title.toLowerCase().replace(/\s+/g, '-')}-instrumental.mp4`,
        });
      }
    }
    console.log(`   ✅ ${sampleSongs.length} sample songs created`);
    
    // ==========================================
    // SETTINGS
    // ==========================================
    console.log('⚙️  Creating default settings...');
    
    const defaultSettings = [
      { key: 'app_name', value: 'KaraokeKu', type: 'string', description: 'Nama aplikasi' },
      { key: 'app_tagline', value: 'Nyanyi Dimana Saja, Kapan Saja', type: 'string', description: 'Tagline aplikasi' },
      { key: 'max_upload_size_mb', value: '500', type: 'number', description: 'Maksimal ukuran upload (MB)' },
      { key: 'allowed_formats', value: 'mp4,mkv,webm', type: 'string', description: 'Format file yang diizinkan' },
      { key: 'songs_per_page', value: '20', type: 'number', description: 'Jumlah lagu per halaman' },
    ];
    
    for (const setting of defaultSettings) {
      await Setting.setValue(setting.key, setting.value, setting.type, setting.description);
    }
    console.log('   ✅ Default settings created');
    
    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Demo:  demo / demo123');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run seeder
seedData();
