const express = require('express');
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/profileController');

const router = express.Router();

// Apply protect middleware to ALL routes
router.use(protect);

// Define routes
router.get('/', getProfile);           // GET /api/profile
router.put('/', updateProfile);        // PUT /api/profile

// OR single line (both work):
// router.route('/').get(getProfile).put(updateProfile);

module.exports = router;