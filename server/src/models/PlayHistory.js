/**
 * Model PlayHistory - Tabel play_history
 * File: src/models/PlayHistory.js
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlayHistory = sequelize.define('PlayHistory', {
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
  song_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'songs',
      key: 'id'
    }
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Score karaoke (0-100)'
  },
  duration_played: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Durasi yang dimainkan dalam detik'
  }
}, {
  tableName: 'play_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['song_id'] },
    { fields: ['started_at'] }
  ]
});

module.exports = PlayHistory;
