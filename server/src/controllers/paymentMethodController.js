/**
 * PaymentMethod Controller
 * File: src/controllers/paymentMethodController.js
 */

const { PaymentMethod } = require('../models');
const path = require('path');
const fs = require('fs');
const { uploadsUrlToFilePath } = require('../config/paths');

// Get all payment methods (public)
exports.getAll = async (req, res) => {
  try {
    const methods = await PaymentMethod.findAll({
      where: { is_active: true },
      order: [['type', 'ASC'], ['sort_order', 'ASC']]
    });
    
    res.json({ success: true, data: methods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all payment methods (admin - includes inactive)
exports.getAllAdmin = async (req, res) => {
  try {
    const methods = await PaymentMethod.findAll({
      order: [['type', 'ASC'], ['sort_order', 'ASC']]
    });
    
    res.json({ success: true, data: methods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create payment method
exports.create = async (req, res) => {
  try {
    const { type, name, icon, account_number, account_name, is_active, sort_order } = req.body;
    
    const method = await PaymentMethod.create({
      type,
      name,
      icon,
      account_number,
      account_name,
      is_active: is_active !== false,
      sort_order: sort_order || 0
    });
    
    res.status(201).json({
      success: true,
      message: 'Metode pembayaran berhasil ditambahkan',
      data: method
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update payment method
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, name, icon, account_number, account_name, is_active, sort_order } = req.body;
    
    const method = await PaymentMethod.findByPk(id);
    if (!method) {
      return res.status(404).json({ success: false, message: 'Metode pembayaran tidak ditemukan' });
    }
    
    await method.update({
      type,
      name,
      icon,
      account_number,
      account_name,
      is_active,
      sort_order
    });
    
    res.json({
      success: true,
      message: 'Metode pembayaran berhasil diupdate',
      data: method
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete payment method
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const method = await PaymentMethod.findByPk(id);
    if (!method) {
      return res.status(404).json({ success: false, message: 'Metode pembayaran tidak ditemukan' });
    }
    
    // Delete QR code file if exists
    if (method.qr_code_url) {
      const filePath = uploadsUrlToFilePath(method.qr_code_url);
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await method.destroy();
    
    res.json({ success: true, message: 'Metode pembayaran berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload QR Code
exports.uploadQR = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    }
    
    const method = await PaymentMethod.findByPk(id);
    if (!method) {
      return res.status(404).json({ success: false, message: 'Metode pembayaran tidak ditemukan' });
    }
    
    // Delete old QR if exists
    if (method.qr_code_url) {
      const oldPath = uploadsUrlToFilePath(method.qr_code_url);
      if (oldPath && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    const qrUrl = `/uploads/qr/${req.file.filename}`;
    await method.update({ qr_code_url: qrUrl });
    
    res.json({
      success: true,
      message: 'QR Code berhasil diupload',
      data: { qr_code_url: qrUrl }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle active status
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    
    const method = await PaymentMethod.findByPk(id);
    if (!method) {
      return res.status(404).json({ success: false, message: 'Metode pembayaran tidak ditemukan' });
    }
    
    await method.update({ is_active: !method.is_active });
    
    res.json({
      success: true,
      message: `Metode pembayaran ${method.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: method
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
