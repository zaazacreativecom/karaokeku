/**
 * Model Playlist - Tabel playlists
 * File: src/models/Playlist.js
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Playlist = sequelize.define('Playlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nama playlist tidak boleh kosong' },
      len: { args: [1, 255], msg: 'Nama playlist maksimal 255 karakter' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  cover_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'playlists',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Playlist;
