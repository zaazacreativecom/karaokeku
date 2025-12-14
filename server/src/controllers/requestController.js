/**
 * Request Controller - Manage song requests
 * File: src/controllers/requestController.js
 */

const { SongRequest, User } = require('../models');
const { Op } = require('sequelize');

// Get all requests (admin)
exports.getAllRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) where.status = status;
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await SongRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'requester', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewer', attributes: ['id', 'name'] }
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

// Get user's requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await SongRequest.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create request
exports.createRequest = async (req, res) => {
  try {
    const { title, artist, genre, language, link, notes } = req.body;
    
    const request = await SongRequest.create({
      user_id: req.user.id,
      title,
      artist,
      genre,
      language,
      link,
      notes,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Request lagu berhasil dikirim',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update request status (admin)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    
    const request = await SongRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request tidak ditemukan' });
    }
    
    await request.update({
      status,
      admin_notes,
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    });
    
    res.json({
      success: true,
      message: `Request ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete request (admin)
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await SongRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request tidak ditemukan' });
    }
    
    await request.destroy();
    
    res.json({ success: true, message: 'Request berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get request stats (admin)
exports.getStats = async (req, res) => {
  try {
    const total = await SongRequest.count();
    const pending = await SongRequest.count({ where: { status: 'pending' } });
    const approved = await SongRequest.count({ where: { status: 'approved' } });
    const rejected = await SongRequest.count({ where: { status: 'rejected' } });
    
    res.json({
      success: true,
      data: { total, pending, approved, rejected }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
