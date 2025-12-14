/**
 * Model Song - Tabel songs
 * File: src/models/Song.js
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Song = sequelize.define('Song', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Judul lagu tidak boleh kosong' }
    }
  },
  artist: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nama artis tidak boleh kosong' }
    }
  },
  genre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Bahasa/Negara asal lagu'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Durasi dalam detik'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  video_url_full: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL video dengan vocal'
  },
  video_url_instrumental: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL video tanpa vocal (karaoke)'
  },
  thumbnail_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  lyrics_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Data lirik dengan timestamp [{time: 0, text: "..."}]'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  play_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Path file lokal untuk auto-scan'
  }
}, {
  tableName: 'songs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['genre'] },
    { fields: ['language'] },
    { fields: ['play_count'] },
    { fields: ['status'] },
    { fields: ['title', 'artist'] }
  ]
});

// Method untuk increment play count
Song.prototype.incrementPlayCount = async function() {
  this.play_count += 1;
  await this.save();
  return this.play_count;
};

module.exports = Song;
