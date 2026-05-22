const express = require('express');
const { protect } = require('../middleware/auth');
const { getChatHistory, newChat } = require('../controllers/chatController');

const router = express.Router();

router.use(protect);
router.get('/', getChatHistory);
router.post('/new', newChat);

module.exports = router;