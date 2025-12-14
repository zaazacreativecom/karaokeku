/**
 * Donation Routes
 * File: src/routes/donations.js
 */

const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { requireAuth } = require('../middlewares/auth');

// Simple isAdmin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Akses ditolak. Admin only.' });
};

// User routes
router.get('/my', requireAuth, donationController.getMyDonations);
router.post('/', requireAuth, donationController.createDonation);

// Admin routes
router.get('/', requireAuth, isAdmin, donationController.getAllDonations);
router.get('/stats', requireAuth, isAdmin, donationController.getStats);
router.put('/:id/verify', requireAuth, isAdmin, donationController.verifyDonation);
router.delete('/:id', requireAuth, isAdmin, donationController.deleteDonation);

module.exports = router;
