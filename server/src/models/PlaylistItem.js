/**
 * Model PlaylistItem - Tabel playlist_items
 * File: src/models/PlaylistItem.js
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlaylistItem = sequelize.define('PlaylistItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  playlist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'playlists',
      key: 'id'
    }
  },
  song_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'songs',
      key: 'id'
    }
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Urutan lagu dalam playlist'
  }
}, {
  tableName: 'playlist_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Tidak perlu updated_at
  indexes: [
    { fields: ['playlist_id', 'position'] }
  ]
});

module.exports = PlaylistItem;
