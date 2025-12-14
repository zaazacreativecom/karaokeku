/**
 * Model User - Tabel users
 * File: src/models/User.js
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nama tidak boleh kosong' },
      len: { args: [2, 255], msg: 'Nama minimal 2 karakter' }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: { msg: 'Email sudah terdaftar' },
    validate: {
      isEmail: { msg: 'Format email tidak valid' }
    }
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: { msg: 'Username sudah digunakan' },
    validate: {
      notEmpty: { msg: 'Username tidak boleh kosong' },
      len: { args: [3, 100], msg: 'Username minimal 3 karakter' },
      is: { args: /^[a-zA-Z0-9_]+$/, msg: 'Username hanya boleh huruf, angka, dan underscore' }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  total_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_songs_played: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    // Hash password sebelum create
    beforeCreate: async (user) => {
      if (user.password_hash) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    },
    // Hash password sebelum update (jika berubah)
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    }
  }
});

// Instance method untuk verifikasi password
User.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

// Instance method untuk output JSON tanpa password
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

module.exports = User;
