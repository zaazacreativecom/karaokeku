/**
 * Chat Controller - Manage chat messages
 * File: src/controllers/chatController.js
 */

const { ChatMessage, User } = require('../models');
const { Op } = require('sequelize');

// Get conversations list
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get unique conversation partners
    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Group by conversation partner
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const partner = msg.sender_id === userId ? msg.receiver : msg.sender;
      
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      // Count unread
      if (msg.receiver_id === userId && !msg.is_read) {
        const conv = conversationsMap.get(partnerId);
        conv.unreadCount++;
      }
    });
    
    const conversations = Array.from(conversationsMap.values());
    
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages with specific user
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partnerId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId, receiver_id: partnerId },
          { sender_id: partnerId, receiver_id: userId }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'role'] }
      ],
      order: [['created_at', 'ASC']],
      limit: parseInt(limit),
      offset
    });
    
    // Mark messages as read
    await ChatMessage.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          sender_id: partnerId,
          receiver_id: userId,
          is_read: false
        }
      }
    );
    
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    
    // Check receiver exists
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    const chatMessage = await ChatMessage.create({
      sender_id: req.user.id,
      receiver_id,
      message
    });
    
    // Reload with associations
    await chatMessage.reload({
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'role'] }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Pesan terkirim',
      data: chatMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Pesan tidak ditemukan' });
    }
    
    if (message.receiver_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Tidak diizinkan' });
    }
    
    await message.update({ is_read: true, read_at: new Date() });
    
    res.json({ success: true, message: 'Pesan ditandai sudah dibaca' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users for admin chat
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      where: { id: { [Op.ne]: req.user.id } },
      order: [['name', 'ASC']]
    });
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await ChatMessage.count({
      where: {
        receiver_id: req.user.id,
        is_read: false
      }
    });
    
    res.json({ success: true, data: { unread: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
