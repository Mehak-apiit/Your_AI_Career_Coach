const express = require('express');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { getAllUsers, deleteUser, getAnalytics } = require('../controllers/adminController');

const router = express.Router();

// Apply auth + admin middleware
router.use(protect);
router.use(admin);

// Admin dashboard routes
router.get('/users', getAllUsers);//api/admin/users
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);

module.exports = router;