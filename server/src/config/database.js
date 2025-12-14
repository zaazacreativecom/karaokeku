/**
 * Konfigurasi Database - Sequelize dengan MariaDB
 * File: src/config/database.js
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Buat instance Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'karaoke_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mariadb',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true, // Gunakan snake_case untuk kolom
      freezeTableName: true
    }
  }
);

// Test koneksi database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi database berhasil!');
  } catch (error) {
    console.error('❌ Gagal konek ke database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
