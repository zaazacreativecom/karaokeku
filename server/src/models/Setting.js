/**
 * Model Setting - Tabel settings
 * File: src/models/Setting.js
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  setting_key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  setting_value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  setting_type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Static method untuk mendapatkan nilai setting
Setting.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ where: { setting_key: key } });
  if (!setting) return defaultValue;
  
  // Parse berdasarkan tipe
  switch (setting.setting_type) {
    case 'number':
      return parseFloat(setting.setting_value);
    case 'boolean':
      return setting.setting_value === 'true';
    case 'json':
      try {
        return JSON.parse(setting.setting_value);
      } catch {
        return defaultValue;
      }
    default:
      return setting.setting_value;
  }
};

// Static method untuk set nilai setting
Setting.setValue = async function(key, value, type = 'string', description = null) {
  const stringValue = type === 'json' ? JSON.stringify(value) : String(value);
  
  const [setting, created] = await this.findOrCreate({
    where: { setting_key: key },
    defaults: {
      setting_value: stringValue,
      setting_type: type,
      description
    }
  });
  
  if (!created) {
    setting.setting_value = stringValue;
    setting.setting_type = type;
    if (description) setting.description = description;
    await setting.save();
  }
  
  return setting;
};

module.exports = Setting;
