/**
 * PaymentMethod Model - Metode pembayaran donasi
 * File: src/models/PaymentMethod.js
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PaymentMethod = sequelize.define('PaymentMethod', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('qris', 'ewallet', 'bank'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nama metode: QRIS, GoPay, BCA, dll'
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Bootstrap Icon class atau URL gambar'
  },
  account_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Nomor e-wallet / rekening'
  },
  account_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Atas nama rekening'
  },
  qr_code_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL gambar QR Code'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'payment_methods',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PaymentMethod;
