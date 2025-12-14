/**
 * SongRequest Model - Request lagu dari user
 * File: src/models/SongRequest.js
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SongRequest = sequelize.define('SongRequest', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  artist: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  genre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  link: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Link YouTube/Spotify'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    defaultValue: 'pending'
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Catatan dari admin'
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'song_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SongRequest;
