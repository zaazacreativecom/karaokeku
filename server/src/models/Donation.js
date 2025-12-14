/**
 * Donation Model - Donasi dari user
 * File: src/models/Donation.js
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Donation = sequelize.define('Donation', {
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
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Jumlah donasi'
  },
  method: {
    type: DataTypes.ENUM('qris', 'gopay', 'ovo', 'dana', 'shopeepay', 'bca', 'bni', 'mandiri', 'other'),
    allowNull: false
  },
  proof_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL bukti transfer'
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  donor_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nama pengirim (opsional)'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Pesan dari donatur'
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'donations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Donation;
