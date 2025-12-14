/**
 * Request Routes
 * File: src/routes/requests.js
 */

const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { requireAuth } = require('../middlewares/auth');

// Simple isAdmin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Akses ditolak. Admin only.' });
};

// User routes
router.get('/my', requireAuth, requestController.getMyRequests);
router.post('/', requireAuth, requestController.createRequest);

// Admin routes
router.get('/', requireAuth, isAdmin, requestController.getAllRequests);
router.get('/stats', requireAuth, isAdmin, requestController.getStats);
router.put('/:id/status', requireAuth, isAdmin, requestController.updateStatus);
router.delete('/:id', requireAuth, isAdmin, requestController.deleteRequest);

module.exports = router;
