/**
 * Model UserScore - Tabel user_scores
 * File: src/models/UserScore.js
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserScore = sequelize.define('UserScore', {
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
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Score karaoke (0-100)'
  },
  is_high_score: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Apakah ini high score untuk lagu ini'
  }
}, {
  tableName: 'user_scores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id', 'song_id'] },
    { fields: ['score'] }
  ]
});

module.exports = UserScore;
