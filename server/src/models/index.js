/**
 * Index Models - Setup relasi antar model
 * File: src/models/index.js
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Song = require('./Song');
const Playlist = require('./Playlist');
const PlaylistItem = require('./PlaylistItem');
const PlayHistory = require('./PlayHistory');
const UserScore = require('./UserScore');
const Upload = require('./Upload');
const Setting = require('./Setting');
const Favorite = require('./Favorite');
const SongRequest = require('./SongRequest');
const Donation = require('./Donation');
const ChatMessage = require('./ChatMessage');
const PaymentMethod = require('./PaymentMethod');

// ==========================================
// RELASI ANTAR MODEL
// ==========================================

// User - Playlist (1:N)
User.hasMany(Playlist, { foreignKey: 'user_id', as: 'playlists' });
Playlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Playlist - PlaylistItem (1:N)
Playlist.hasMany(PlaylistItem, { foreignKey: 'playlist_id', as: 'items' });
PlaylistItem.belongsTo(Playlist, { foreignKey: 'playlist_id', as: 'playlist' });

// Song - PlaylistItem (1:N)
Song.hasMany(PlaylistItem, { foreignKey: 'song_id', as: 'playlistItems' });
PlaylistItem.belongsTo(Song, { foreignKey: 'song_id', as: 'song' });

// User - PlayHistory (1:N)
User.hasMany(PlayHistory, { foreignKey: 'user_id', as: 'playHistory' });
PlayHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Song - PlayHistory (1:N)
Song.hasMany(PlayHistory, { foreignKey: 'song_id', as: 'playHistory' });
PlayHistory.belongsTo(Song, { foreignKey: 'song_id', as: 'song' });

// User - UserScore (1:N)
User.hasMany(UserScore, { foreignKey: 'user_id', as: 'scores' });
UserScore.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Song - UserScore (1:N)
Song.hasMany(UserScore, { foreignKey: 'song_id', as: 'scores' });
UserScore.belongsTo(Song, { foreignKey: 'song_id', as: 'song' });

// User - Favorite (1:N)
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Song - Favorite (1:N)
Song.hasMany(Favorite, { foreignKey: 'song_id', as: 'favoritedBy' });
Favorite.belongsTo(Song, { foreignKey: 'song_id', as: 'song' });

// User - Upload (1:N)
User.hasMany(Upload, { foreignKey: 'user_id', as: 'uploads' });
Upload.belongsTo(User, { foreignKey: 'user_id', as: 'uploader' });

// Upload reviewer (admin)
Upload.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

// User - SongRequest (1:N)
User.hasMany(SongRequest, { foreignKey: 'user_id', as: 'songRequests' });
SongRequest.belongsTo(User, { foreignKey: 'user_id', as: 'requester' });
SongRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

// User - Donation (1:N)
User.hasMany(Donation, { foreignKey: 'user_id', as: 'donations' });
Donation.belongsTo(User, { foreignKey: 'user_id', as: 'donor' });
Donation.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });

// User - ChatMessage (sender/receiver)
User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(ChatMessage, { foreignKey: 'receiver_id', as: 'receivedMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
ChatMessage.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

// ==========================================
// SINKRONISASI DATABASE
// ==========================================

const ensureSchemaUpdates = async () => {
  const queryInterface = sequelize.getQueryInterface();

  // Safe, targeted schema patch: uploads.thumbnail_url
  try {
    const uploadsTable = await queryInterface.describeTable('uploads');
    if (!uploadsTable.thumbnail_url) {
      await queryInterface.addColumn('uploads', 'thumbnail_url', {
        type: DataTypes.STRING(500),
        allowNull: true
      });
      console.log('✅ Added column uploads.thumbnail_url');
    }
  } catch (error) {
    console.warn('⚠️  Could not ensure uploads.thumbnail_url column:', error.message);
  }
};

const syncDatabase = async (options = {}) => {
  try {
    // Default: alter=true di development, force=false di production
    const defaultOptions = {
      alter: process.env.NODE_ENV === 'development',
      force: false,
      ...options
    };
    
    await sequelize.sync(defaultOptions);
    await ensureSchemaUpdates();
    console.log('✅ Database synchronized successfully!');
    
    // Buat setting default jika belum ada
    await createDefaultSettings();
    
  } catch (error) {
    console.error('❌ Database sync error:', error.message);
    throw error;
  }
};

// Buat setting default aplikasi
const createDefaultSettings = async () => {
  const defaultSettings = [
    { key: 'app_name', value: 'KaraokeKu', type: 'string', desc: 'Nama aplikasi' },
    { key: 'app_tagline', value: 'Nyanyi Dimana Saja, Kapan Saja', type: 'string', desc: 'Tagline aplikasi' },
    { key: 'max_upload_size_mb', value: '500', type: 'number', desc: 'Maksimal ukuran upload (MB)' },
    { key: 'allowed_formats', value: 'mp4,mkv,webm,avi', type: 'string', desc: 'Format video yang diizinkan' },
    { key: 'songs_per_page', value: '20', type: 'number', desc: 'Jumlah lagu per halaman' }
  ];
  
  for (const s of defaultSettings) {
    await Setting.findOrCreate({
      where: { setting_key: s.key },
      defaults: {
        setting_value: s.value,
        setting_type: s.type,
        description: s.desc
      }
    });
  }
};

module.exports = {
  sequelize,
  User,
  Song,
  Playlist,
  PlaylistItem,
  PlayHistory,
  UserScore,
  Upload,
  Setting,
  Favorite,
  SongRequest,
  Donation,
  ChatMessage,
  PaymentMethod,
  syncDatabase
};
