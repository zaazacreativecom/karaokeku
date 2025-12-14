/**
 * Chat Routes
 * File: src/routes/chat.js
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middlewares/auth');

// All routes require authentication
router.use(requireAuth);

// Get conversations list
router.get('/conversations', chatController.getConversations);

// Get unread count
router.get('/unread', chatController.getUnreadCount);

// Get all users (for starting new chat)
router.get('/users', chatController.getAllUsers);

// Get messages with specific user
router.get('/messages/:partnerId', chatController.getMessages);

// Send message
router.post('/send', chatController.sendMessage);

// Mark message as read
router.put('/read/:messageId', chatController.markAsRead);

module.exports = router;
