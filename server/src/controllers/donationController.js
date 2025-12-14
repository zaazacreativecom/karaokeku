/**
 * Donation Controller - Manage donations
 * File: src/controllers/donationController.js
 */

const { Donation, User } = require('../models');
const { Op } = require('sequelize');

// Get all donations (admin)
exports.getAllDonations = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) where.status = status;
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Donation.findAndCountAll({
      where,
      include: [
        { model: User, as: 'donor', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'verifier', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      success: true,
      data: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's donations
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    
    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create donation
exports.createDonation = async (req, res) => {
  try {
    const { amount, method, donor_name, message, proof_url } = req.body;
    
    const donation = await Donation.create({
      user_id: req.user.id,
      amount,
      method,
      donor_name,
      message,
      proof_url,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Donasi berhasil dicatat, menunggu verifikasi',
      data: donation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify donation (admin)
exports.verifyDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    
    const donation = await Donation.findByPk(id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donasi tidak ditemukan' });
    }
    
    await donation.update({
      status,
      admin_notes,
      verified_by: req.user.id,
      verified_at: new Date()
    });
    
    res.json({
      success: true,
      message: `Donasi ${status === 'verified' ? 'terverifikasi' : 'ditolak'}`,
      data: donation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete donation (admin)
exports.deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const donation = await Donation.findByPk(id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donasi tidak ditemukan' });
    }
    
    await donation.destroy();
    
    res.json({ success: true, message: 'Donasi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get donation stats (admin)
exports.getStats = async (req, res) => {
  try {
    const total = await Donation.count();
    const pending = await Donation.count({ where: { status: 'pending' } });
    const verified = await Donation.count({ where: { status: 'verified' } });
    const rejected = await Donation.count({ where: { status: 'rejected' } });
    
    const totalAmount = await Donation.sum('amount', { where: { status: 'verified' } }) || 0;
    
    res.json({
      success: true,
      data: { total, pending, verified, rejected, totalAmount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
